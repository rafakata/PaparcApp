/**
 * Clase que representa el acceso a datos para las reservas.
 * Se encarga de toda la interacción SQL relacionada con reservas y parking.
 */

const db = require('../config/database');

class ReservationDAO {

    /**
     * Obtiene todas las reservas pendientes/activas (próximas).
     * @returns {Array} - Lista de reservas pendientes con información del servicio.
     */
    async getUpcomingReservations() {
        const sql = `
            SELECT 
                r.id_reservation,
                r.license_plate,
                r.entry_date,
                r.exit_date,
                r.status,
                r.total_price,
                r.cod_parking_spot,
                ms.name as service_name,
                STRING_AGG(ads.name, ', ') as additional_services
            FROM reservation r
            LEFT JOIN main_service ms ON r.id_main_service = ms.id_main_service
            LEFT JOIN reservation_additional_service ras ON r.id_reservation = ras.id_reservation
            LEFT JOIN additional_service ads ON ras.id_additional_service = ads.id_additional_service
            WHERE r.status IN ('PENDIENTE', 'EN CURSO', 'CONFIRMADA')
            GROUP BY r.id_reservation, r.license_plate, r.entry_date, r.exit_date, 
                     r.status, r.total_price, r.cod_parking_spot, ms.name
            ORDER BY r.entry_date ASC
        `;

        try {
            const result = await db.query(sql);
            return result.rows;
        } catch (error) {
            console.error('Error al obtener reservas pendientes:', error);
            throw new Error('Error al obtener reservas pendientes', { cause: error });
        }
    }

    /**
     * Obtiene todas las reservas completadas.
     * @returns {Array} - Lista de reservas completadas con información del servicio.
     */
    async getCompletedReservations() {
        const sql = `
            SELECT 
                r.id_reservation,
                r.license_plate,
                r.entry_date,
                r.exit_date,
                r.status,
                r.total_price,
                r.cod_parking_spot,
                ms.name as service_name,
                STRING_AGG(ads.name, ', ') as additional_services
            FROM reservation r
            LEFT JOIN main_service ms ON r.id_main_service = ms.id_main_service
            LEFT JOIN reservation_additional_service ras ON r.id_reservation = ras.id_reservation
            LEFT JOIN additional_service ads ON ras.id_additional_service = ads.id_additional_service
            WHERE r.status IN ('COMPLETADA', 'FINALIZADA')
            GROUP BY r.id_reservation, r.license_plate, r.entry_date, r.exit_date, 
                     r.status, r.total_price, r.cod_parking_spot, ms.name
            ORDER BY r.exit_date DESC
            LIMIT 10
        `;

        try {
            const result = await db.query(sql);
            return result.rows;
        } catch (error) {
            console.error('Error al obtener reservas completadas:', error);
            throw new Error('Error al obtener reservas completadas', { cause: error });
        }
    }

    /**
     * Obtiene estadísticas del parking.
     * @returns {Object} - Objeto con available, occupied, reserved, total.
     */
    async getParkingStats() {
        const sqlTotal = `SELECT COUNT(*) as total FROM parking_spot`;
        const sqlAvailable = `SELECT COUNT(*) as available FROM parking_spot WHERE is_available = true`;
        const sqlReserved = `
            SELECT COUNT(DISTINCT cod_parking_spot) as reserved 
            FROM reservation 
            WHERE status IN ('PENDIENTE', 'EN CURSO', 'CONFIRMADA') 
            AND cod_parking_spot IS NOT NULL
        `;

        try {
            const [totalResult, availableResult, reservedResult] = await Promise.all([
                db.query(sqlTotal),
                db.query(sqlAvailable),
                db.query(sqlReserved)
            ]);

            const total = parseInt(totalResult.rows[0].total) || 0;
            const available = parseInt(availableResult.rows[0].available) || 0;
            const reserved = parseInt(reservedResult.rows[0].reserved) || 0;
            const occupied = total - available;

            return {
                total,
                available,
                occupied,
                reserved
            };
        } catch (error) {
            console.error('Error al obtener estadísticas del parking:', error);
            throw new Error('Error al obtener estadísticas del parking', { cause: error });
        }
    }

    /**
     * Cancela una reserva por su ID.
     * @param {number} reservationId - ID de la reserva a cancelar.
     * @returns {boolean} - True si se canceló correctamente.
     */
    async cancelReservation(reservationId) {
        const sql = `
            UPDATE reservation 
            SET status = 'CANCELADA' 
            WHERE id_reservation = $1 
            RETURNING id_reservation
        `;

        try {
            const result = await db.query(sql, [reservationId]);
            return result.rows.length > 0;
        } catch (error) {
            console.error('Error al cancelar reserva:', error);
            throw new Error('Error al cancelar reserva', { cause: error });
        }
    }
}

module.exports = new ReservationDAO();
