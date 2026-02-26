/**
 * Clase que representa el acceso a datos para los vehiculos.
 * Se encarga de toda la interaccion SQL relacionada con los vehiculos
 * y la tabla intermedia que los asocia a los clientes.
*/

const db = require('../config/database');

class VehicleDAO {

    /**
     * Busca un vehículo por su matrícula.
     * Útil para saber si un coche ya ha estado en el parking antes.
     * @param {string} licensePlate - Matrícula del vehículo.
     * @returns {Object|null} - Objeto del vehículo o null si es la primera vez que viene.
    */
    async getVehicleByLicensePlate(licensePlate) {
        
        const sql = 'SELECT * FROM vehicle WHERE license_plate = $1';
        
        try {
            const result = await db.query(sql, [licensePlate]);
            return result.rows[0] || null;
            
        } catch (error) {
            console.error('Error al buscar el vehículo por matrícula:', error);
            throw new Error('Error al buscar el vehículo', { cause: error });
        }
    }  
    
    /**
     * Registra un vehículo nuevo en el sistema.
     * @param {Object} vehicleData - Objeto con { license_plate, brand, model, color, type }
     * @returns {number} - El nuevo id_vehicle generado por la base de datos.
    */
    async createVehicle(vehicleData) {
        
        const sql = `
            INSERT INTO vehicle (license_plate, brand, model, color, type)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id_vehicle
        `;

        try {
            const values = [
                vehicleData.license_plate,
                vehicleData.brand || 'Desconocida',
                vehicleData.model || 'Desconocido',
                vehicleData.color || 'Sin color',
                vehicleData.type
            ];
            
            const result = await db.query(sql, values);
            return result.rows[0].id_vehicle;

        } catch (error) {
            // Manejamos el error por si por algún motivo la matrícula ya se metio
            if (error.code === '23505') { 
                throw new Error('La matrícula ya está registrada en el sistema.');
            }
            console.error('Error al registrar el nuevo vehículo:', error);
            throw new Error('Error al registrar el vehículo', { cause: error });
        }
    }
    
    /**
     * Enlaza un cliente con un vehículo en el "Garaje Virtual" (Tabla N:M).
     * Utiliza ON CONFLICT DO NOTHING para evitar errores si el cliente ya tenía
     * este coche registrado de visitas anteriores.
     * @param {number} idCustomer - ID del cliente.
     * @param {number} idVehicle - ID del vehículo.
    */
    async linkCustomerAndVehicle(idCustomer, idVehicle) {
        
        // con onconflict evitamos el error si el cliente ya tenía este coche registrado de visitas anteriores
        const sql = `
            INSERT INTO customer_vehicle (id_customer, id_vehicle)
            VALUES ($1, $2)
            ON CONFLICT (id_customer, id_vehicle) DO NOTHING
        `;

        try {
            await db.query(sql, [idCustomer, idVehicle]);
            return true;
            
        } catch (error) {
            console.error('Error al enlazar cliente y vehículo:', error);
            throw new Error('Error al guardar el vehículo en el perfil del cliente', { cause: error });
        }
    }

}

module.exports = new VehicleDAO();