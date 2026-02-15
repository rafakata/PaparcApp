/**
 * Servicio de precios para el sistema de alquiler de vehículos.
 * Este servicio se encarga de gestionar toda la lógica relacionada con los precios de las reservas. 
*/

const PricingDAO = require('../models/pricing-dao');

/**
 * Implementamos una clase singleton para el servicio de precios ya que:
 * esta clase se encarga de inicializar y mantener en la RAM toda la información relacionada con los precios,
 * como los coeficientes de los vehículos, las tarifas de los servicios y el precio de los servicios adicionales.
 * De esta forma, cuando se necesite calcular el precio de una reserva, se puede acceder a esta información de forma rápida y eficiente sin tener que consultar la base de datos cada vez.
*/
class PricingService {
    
    static cache = {
        coefficients : new Map(),
        extras : new Map(),
        rates : []
    };

    static isInitialized = false;

    static async initCache() {

        if (this.isInitialized) return;

        try {

            console.log('Inicializando cache de precios ...');

            const pricingDao = new PricingDAO();

            const rawCoefficients = await pricingDao.getVehicleCoefficients();
            const rawRates = await pricingDao.getServiceRates();
            const rawAdditionalServices = await pricingDao.getAdditionalServices();

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

}

module.exports = PricingService;