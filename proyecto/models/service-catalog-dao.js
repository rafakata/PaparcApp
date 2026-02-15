/**
 * DAO para la gestión de datos que de manera general no varían 
 * y se muestran en multiples vistas de la aplicación.
 * Formualrios de reserva, panel de administración, landing page, etc.
*/

const db = require('../config/database');

class ServiceCatalogDAO {

    /**
     * Obtienes los tipos de vehículos disponibles en el sistema.
     * @returns {Promise<Array>} Un array de objetos con la propiedad 'type' que representa el tipo de vehículo.
     */
    async getVehicleTypes() {

        const sql = 'SELECT vehicle_type AS type  FROM vehicle_coefficient ORDER BY vehicle_type ASC';
        
        try {
            
            const result = await db.query(sql);
            return result.rows;

        } catch (error) {

            console.error('Error al obtener los tipos de vehículos:', error);
            throw new Error('Error al obtener el catálogo de vehículos', { cause: error });

        }

    }

    /**
     * Obtienes los servicios principales disponibles en el sistema.
     * @returns {Promise<Array>} Un array de objetos con las propiedades 'id_main_service' y 'name'.
    */
    async getMainServices() {

        const sql = 'SELECT id_main_service, name FROM main_service ORDER BY id_main_service ASC';

        try {

            const result = await db.query(sql);
            return result.rows;

        } catch (error) {

            console.error('Error al obtener los servicios principales:', error);
            throw new Error('Error al obtener el catálogo de servicios principales', { cause: error });

        }

    }

    /**
     * Obtiene los servicios adicionales disponibles en el sistema.
     * @returns {Promise<Array>} Un array de objetos con las propiedades 'id_additional_service', 'name' y 'price'.
    */
    async getAllAdditionalServices() {

        const sql = 'SELECT id_additional_service, name, price FROM additional_service ORDER BY id_additional_service ASC';

        try {

            const result = await db.query(sql);
            return result.rows;

        } catch (error) {

            console.error('Error al obtener los servicios adicionales:', error);
            throw new Error('Error al obtener el catálogo de servicios adicionales', { cause: error });

        }

    }

}

module.exports = new ServiceCatalogDAO();