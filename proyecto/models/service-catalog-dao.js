/**
 * DAO para la gestión de datos que de manera general no varían 
 * y se muestran en multiples vistas de la aplicación.
 * Formualrios de reserva, panel de administración, landing page, etc.
*/

const db = require('../config/database');

class ServiceCatalogDAO {

    /**
     * Obtienes los tipos de vehículos disponibles en el sistema y su multiplicador.
     * @returns {Promise<Array>} Un array de objetos con la propiedad 'type' que representa el tipo de vehículo y 'multiplier'.
     */
    async getVehicleTypes() {

        const sql = 'SELECT vehicle_type AS type, multiplier  FROM vehicle_coefficient ORDER BY multiplier ASC';
        
        try {
            
            const result = await db.query(sql);
            return result.rows;

        } catch (error) {

            console.error('Error al obtener los tipos de vehículos:', error);
            throw new Error('Error al obtener el catálogo de vehículos', { cause: error });

        }

    }

    /**
     * Obtiene los servicios principales y calcula su tarifa base (Desde X€).
     * @param {boolean} onlyActive - Si es true, solo devuelve los servicios activos (ideal para la web pública).
     * @returns {Promise<Array>} Array con datos del servicio y su precio mínimo ('starting_price').
     */
    async getMainServices(onlyActive = false) {

        let sql = ` SELECT
                        ms.id_main_service, ms.name, ms.tagline, ms.full_description, ms.is_active,
                        MIN(sr.daily_price) AS starting_price
                    FROM main_service ms
                    LEFT JOIN service_rate sr ON ms.id_main_service = sr.id_main_service
        `;

        if (onlyActive) sql += ' WHERE ms.is_active = TRUE';

        sql += ` GROUP BY
                    ms.id_main_service, ms.name, ms.tagline, ms.full_description, ms.is_active
                ORDER BY ms.id_main_service ASC;
        `;

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
     * @param {boolean} onlyActive - Si es true, solo devuelve los extras activos.
     * @returns {Promise<Array>} Array con toda la info comercial y técnica del extra.
     */
    async getAllAdditionalServices(onlyActive = false) {

        let sql = ` SELECT
                        id_additional_service,
                        name,
                        category,
                        tagline,
                        price,
                        features,
                        is_active
                    FROM additional_service
        `;

        if (onlyActive) sql += ' WHERE is_active = TRUE';

        sql += ' ORDER BY id_additional_service ASC;';

        try {

            const result = await db.query(sql);
            return result.rows;

        } catch (error) {

            console.error('Error al obtener los servicios adicionales:', error);
            throw new Error('Error al obtener el catálogo de servicios adicionales', { cause: error });

        }

    }

    /**
     * Obtiene los planes de contrato de suscripción disponibles (NUEVA TABLA).
     * @param {boolean} onlyActive - Si es true, solo devuelve los planes activos.
     * @returns {Promise<Array>} Array con los planes y sus características.
    */
    async getContractPlans(onlyActive = false) {

        let sql = ` SELECT
                        id_plan, name, duration_months, price, tagline, features, is_active
                    FROM contract_plan
        `;

        if (onlyActive) sql += ' WHERE is_active = TRUE';

        sql += ' ORDER BY duration_months ASC;';

        try {

            const result = await db.query(sql);
            return result.rows;

        } catch (error) {

            console.error('Error al obtener los planes de contrato:', error);
            throw new Error('Error al obtener el catálogo de planes de contrato', { cause: error });

        }
        
    }

    /**
     * Obtiene las tarifas por tramos de días de cada servicio principal.
     * @returns {Promise<Array>} Array con id_main_service, min_days, max_days, daily_price.
     */
    async getServiceRates() {

        const sql = `SELECT sr.id_main_service, sr.min_days, sr.max_days, sr.daily_price
                     FROM service_rate sr
                     ORDER BY sr.id_main_service ASC, sr.min_days ASC`;

        try {

            const result = await db.query(sql);
            return result.rows;

        } catch (error) {

            console.error('Error al obtener las tarifas por tramos:', error);
            throw new Error('Error al obtener las tarifas por tramos', { cause: error });

        }

    }

}

module.exports = new ServiceCatalogDAO();