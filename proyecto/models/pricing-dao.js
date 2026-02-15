/**
 * Clase que representa el acceso a datos para los precios.
 * Pedimos las tablas estaticas de precios para cargarlas en la memoria cache y evitar consultas
 * repetitivas a la base de datos cada vez que se necesite mostrar un precio en la aplicacion.
 * Ya que los precios se caclculan de forma dinámica.
 * Tambien se encarga de toda la interaccion SQL relacionada con los precios. 
*/

const db = require('../config/database');

class PricingDAO {

    /**
     * Obtiene los coeficientes de los vehiculos.
     * Estos coeficientes se utilizan para calcular el precio de una reserva en base al tipo de vehiculo.
     * @returns 
     * - devuelve un array de objetos con la informacion de los coeficientes de los vehiculos:
     *  - tipo de vehiculo
     *  - coeficiente asociado a ese tipo de vehiculo
     * @throws -- lanza un error si ocurre un problema al consultar la base de datos
    */
    async getVehicleCoefficients() {

        const sql = 'SELECT * FROM vehicle_coefficient';
        
        try {

            const result = await db.query(sql);
            return result.rows;

        } catch (error) {

            console.error('Error al obtener los coeficientes de vehiculos:', error);
            throw new Error('Error al obtener los coeficientes de vehiculos', { cause: error });

        }
    }

    /**
     * Obtiene la tabla de reglas de los main_service según el número de dias.
     * @returns 
     * - devuelve un array de objetos con la informacion de las reglas de los main_service ordenados por id_main_service y min_days:
     * - id del main_service
     * - min_days: numero minimo de dias para aplicar esa regla
     * - max_days: numero maximo de dias para aplicar esa regla
     * - daily_price: precio diario para esa regla
     * - id_main_service: id del main_service al que se aplica esa regla
     * @throws -- lanza un error si ocurre un problema al consultar la base de datos
    */
    async getServiceRates() {

        // ordeno por servicio y dias para facilitar la búsqueda
        const sql = 'SELECT * FROM service_rate ORDER BY id_main_service, min_days ASC';

        try {

            const result = await db.query(sql);
            return result.rows;

        } catch (error) {

            console.error('Error al obtener las tarifas de servicios:', error);
            throw new Error('Error al obtener las tarifas de servicios', { cause: error });
            
        }
    }

    /**
     * Obtiene la lista de servicios adicionales disponibles.
     * Estos servicios adicionales se pueden agregar a una reserva para aumentar el precio final. 
     * @returns 
     * - devuelve un array de objetos con la informacion de los servicios adicionales:
     * - id del servicio adicional
     * - nombre del servicio adicional
     * - precio del servicio adicional
     * @throws -- lanza un error si ocurre un problema al consultar la base de datos
    */
    async getAdditionalServices() {

        const sql = 'SELECT id_additional_service,name,price FROM additional_service';

        try {

            const result = await db.query(sql);
            return result.rows;

        } catch (error) {

            console.error('Error al obtener los servicios adicionales:', error);
            throw new Error('Error al obtener los servicios adicionales', { cause: error });

        }

    }

}

module.exports = PricingDAO;