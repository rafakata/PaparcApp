/**
 * Servicio de precios para el sistema de alquiler de vehículos.
 * Este servicio se encarga de gestionar toda la lógica relacionada con los precios de las reservas. 
*/

const pricingDAO = require('../models/pricing-dao');

/**
 * Implementamos una clase singleton para el servicio de precios ya que:
 * esta clase se encarga de inicializar y mantener en la RAM toda la información relacionada con los precios,
 * como los coeficientes de los vehículos, las tarifas de los servicios y el precio de los servicios adicionales.
 * De esta forma, cuando se necesite calcular el precio de una reserva, se puede acceder a esta información de forma rápida y eficiente sin tener que consultar la base de datos cada vez.
*/
class PricingService {
    
    // cache en memoria para almacenar la información de precios y evitar consultas SQL
    static cache = {
        coefficients : new Map(),
        extras : new Map(),
        rates : []
    };

    /**
     * Bandera que indica si el cache de precios ha sido inicializado
     * @type {boolean}
    */
    static isInitialized = false;

    /**
     * Inicializa el cache de precios desde la base de datos.
     * Carga los coeficientes de vehículos, tarifas de servicios y servicios adicionales
     * en memoria para optimizar el rendimiento del cálculo de precios.
     * Solo se ejecuta una vez gracias a la bandera isInitialized.
     * 
     * @async
     * @returns {Promise<void>}
     * @throws {Error} Si ocurre un error durante la carga de datos desde la base de datos
    */
    static async initCache() {

        if (this.isInitialized) return;

        try {

            console.log('Inicializando cache de precios ...');

            const rawCoefficients = await pricingDAO.getVehicleCoefficients();
            const rawRates = await pricingDAO.getServiceRates();
            const rawAdditionalServices = await pricingDAO.getAdditionalServices();

            rawCoefficients.forEach(v => {
                this.cache.coefficients.set(v.vehicle_type, parseFloat(v.multiplier));
            });

            rawAdditionalServices.forEach(s => {
                this.cache.extras.set(s.id_additional_service, parseFloat(s.price));
            })

            this.cache.rates = rawRates;

            this.isInitialized = true;
            console.log('Cache de precios cargada correctamente en la RAM');

        } catch (error) {

            console.error('Error al inicializar cache de precios:', error);
            throw error;

        }

    }

    /**
     * Calcula el precio total de una reserva.
     * @param {*} entry_date 
     * @param {*} exit_date 
     * @param {*} vehicle_type 
     * @param {*} id_main_service 
     * @param {*} id_addtional_services 
     * @returns 
     */
    static calculateTotalPrice(entry_date, exit_date, vehicle_type, id_main_service, id_addtional_services = []) {

        if (!this.isInitialized) {
            throw new Error('Cache de precios no inicializada en la RAM');
        }

        const start = new Date(entry_date);
        const end = new Date(exit_date);

        const diffTime = Math.abs(end - start);
        const msPerday = 1000 * 60 * 60 * 24; // cantidad de milisegundos en un día
        const courtesyTime = 2 * 60 * 60 * 1000; // 2 horas de cortesía en milisegundos

        // si la diferencia es menor a 2 horas, se cobra como 1 día
        let calculatedDays = Math.floor(diffTime / msPerday);
        if (diffTime % msPerday > courtesyTime) {
            calculatedDays += 1;
        }

        const totalDays = calculatedDays > 0 ? calculatedDays : 1; // minimo se cobra 1 día

        //buscamos la tarifa base para el servicio principal x numero de días
        const baseRate = this.cache.rates.find(r => 
            r.id_main_service === id_main_service &&
            r.min_days <= totalDays &&
            r.max_days >= totalDays
        )

        if (!baseRate) {
            throw new Error(`No se encontró una tarifa base para el servicio ${id_main_service} y ${totalDays} días`);
        }

        // obtenemos el multiplicador del tipo de vehículo
        const vehicleCoefficient = this.cache.coefficients.get(vehicle_type);

        if (vehicleCoefficient === undefined) {
            throw new Error(`No se encontró un coeficiente para el tipo de vehículo ${vehicle_type}`);
        }

        // buscamos servicios adicionales si los hubiera
        let extrasTotal = 0;

        for (const extraId of id_addtional_services) {
            const extraPrice = this.cache.extras.get(extraId);

            if (extraPrice === undefined) {
                console.warn(`No se encontró un precio para el servicio adicional con id ${extraId}, se omitirá en el cálculo del precio total`);
            } else {
                extrasTotal += extraPrice;
            }
        }

        // calculamos el precio total
        const totalPrice = (baseRate.daily_price * totalDays * vehicleCoefficient) + extrasTotal;
        
        return Math.round(totalPrice * 100) / 100; // redondeamos a 2 decimales
        
    }

}

module.exports = PricingService;