/**
 * Clase que representa el acceso a datos para las reservas.
 * Se encarga de toda la interaccion SQL relacionada con las reservas. 
*/
const db = require('../config/database');


class ReservationDAO {

    /**
     * Obtiene todas las reservas por una fecha dada.
     * @param {*} date -- fecha para filtrar las reservas, se buscan reservas que tengan entry_date o exit_date igual a esta fecha
     * @returns -- devuelve un array de objetos con la informacion necesaria para mostrar en la tabla de reservas:
     * -datos de la reserva (id, fechas, estado)
     * -datos del vehiculo (matricula, marca, color)
     * -datos del cliente (nombre, telefono)
     * -nombre del servicio principal
     * @throws -- lanza un error si ocurre un problema al consultar la base de datos
     */
    async getReservationsByDate(date) {

        const sql = `SELECT
                        r.id_reservation,r.entry_date,r.exit_date,r.status,
                        v.license_plate,v.brand,v.color,
                        c.full_name AS customer_name,c.phone,
                        s.name AS service_name
                    FROM reservation r
                    JOIN vehicle v ON r.license_plate = v.license_plate
                    JOIN customer c ON v.id_customer = c.id_customer
                    JOIN main_service s ON r.id_main_service = s.id_main_service
                    WHERE
                        r.entry_date::date = $1::date
                        OR
                        r.exit_date::date = $1::date
                    ORDER BY r.entry_date ASC;
        `;

        try {

            const result = await db.query(sql, [date]);
            return result.rows;

        } catch (error) {

            console.error('Error al obtener las reservas por fecha:', error);
            throw new Error('Error al obtener las reservas por fecha', { cause: error });

        }

    }

    /**
     * Obtiene toda la informacion de una reserva por su ID.
     * Realizamos dos consultas separadas, cuyas respuestas uniremos en un solo objeto para devolver toda la informacion necesaria para mostrar el detalle de la reserva.
     * @param {*} id 
     * @returns -- devuelve un objeto con toda la informacion de la reserva:
     *  - datos de la reserva (id, fechas, estado, estacionamiento, notas, precio total, metodo de pago, si esta pagada o no)
     *  - cantidad de fotos de evidencia asociadas a la reserva (subconsulta)
     *  - datos del vehiculo (matricula, marca, modelo, color, tipo)
     *  - datos del cliente (nombre, telefono, email)
     *  - nombre del servicio principal (id y nombre)
     *  - servicios adicionales (id, nombre y precio)
     * @throws -- lanza un error si ocurre un problema al consultar la base de datos o si no se encuentra la reserva con el ID dado
     */
    async getInfoReservationByIdReservation(id) {

        // esta consulta contiene una subconsulta para contar la cantidad de fotos de evidencia asociadas a la reserva y devuelve la información en forma objeto con clave photo_count
        const sqlReservation = `SELECT
                                    r.id_reservation, r.reservation_date, r.entry_date, r.exit_date, r.status, r.total_price, r.is_paid, r.payment_method, r.notes, r.cod_parking_spot,
                                    (SELECT COUNT (*) FROM photo_evidence pe WHERE pe.id_reservation = r.id_reservation) :: int AS photo_count, 
                                    v.license_plate, v.brand, v.model, v.color, v.type,
                                    c.full_name AS customer_name, c.phone, c.email,
                                    ms.id_main_service, ms.name AS main_service_name
                                FROM reservation r
                                JOIN vehicle v ON r.license_plate = v.license_plate
                                JOIN customer c ON v.id_customer = c.id_customer
                                JOIN main_service ms ON r.id_main_service = ms.id_main_service
                                WHERE r.id_reservation = $1; 
        `;

        const sqlAdditionalServices = `SELECT
                                            ads.id_additional_service,
                                            ads.name AS additional_service_name,
                                            ads.price AS additional_service_price
                                        FROM additional_service ads
                                        JOIN reservation_additional_service ras ON ads.id_additional_service = ras.id_additional_service
                                        WHERE ras.id_reservation = $1
        `;

        const sqlPhotos = `SELECT
                            id_photo, file_path, taken_at
                        FROM photo_evidence
                        WHERE id_reservation = $1
        `;

        const sqlNotifications = `SELECT
                                    type, sent_at
                                FROM notification
                                WHERE id_reservation = $1
                                ORDER BY sent_at DESC
        `;

        try {

            const resultReservation = await db.query(sqlReservation, [id]);

            if (resultReservation.rows.length === 0) return null;

            const reservationData = resultReservation.rows[0];

            const resultAdditionalServices = await db.query(sqlAdditionalServices, [id]);
            const resultPhotos = await db.query(sqlPhotos, [id]);
            const resultNotifications = await db.query(sqlNotifications, [id]);

            reservationData.additional_services = resultAdditionalServices.rows; // agregamos un nuevo campo al objeto reservationData con el array de servicios adicionales
            reservationData.photos = resultPhotos.rows; // agregamos un nuevo campo al objeto reservationData con el array de fotos de evidencia
            reservationData.notifications = resultNotifications.rows; // agregamos un nuevo campo al objeto reservationData con el array de notificaciones

            return reservationData;

        }catch (error) {

            console.error('Error al obtener la reserva por ID:', error);
            throw new Error('Error al obtener el detalle de la reserva', { cause: error });

        }

    }

    /**
     * Obtiene todas las plazas de parking con su estado actual.
     * Para cada plaza, busca si tiene una reserva activa (EN CURSO, CONFIRMADA o PENDIENTE)
     * y devuelve la información del cliente y vehículo asociado.
     * @returns {Object} - Objeto con stats y array de plazas
     */
    async getParkingSpotsWithStatus() {

        const sql = `SELECT
                        ps.cod_parking_spot,
                        ps.is_available,
                        r.id_reservation,
                        r.entry_date,
                        r.exit_date,
                        r.status AS reservation_status,
                        v.license_plate,
                        c.full_name AS customer_name
                    FROM parking_spot ps
                    LEFT JOIN reservation r 
                        ON r.cod_parking_spot = ps.cod_parking_spot
                        AND r.status IN ('EN CURSO', 'CONFIRMADA', 'PENDIENTE')
                    LEFT JOIN vehicle v ON r.license_plate = v.license_plate
                    LEFT JOIN customer c ON v.id_customer = c.id_customer
                    ORDER BY ps.cod_parking_spot ASC;
        `;

        try {

            const result = await db.query(sql);
            const spots = result.rows;

            // Calcular estadísticas
            const total = spots.length;
            const enCurso = spots.filter(s => s.reservation_status === 'EN CURSO').length;
            const reservadas = spots.filter(s => s.reservation_status === 'CONFIRMADA' || s.reservation_status === 'PENDIENTE').length;
            const noDisponibles = spots.filter(s => !s.is_available).length;
            const libres = total - enCurso - reservadas - noDisponibles;

            return {
                stats: {
                    total,
                    en_curso: enCurso,
                    reservadas,
                    libres,
                    no_disponibles: noDisponibles
                },
                spots
            };

        } catch (error) {

            console.error('Error al obtener las plazas de parking:', error);
            throw new Error('Error al obtener las plazas de parking', { cause: error });

        }

    }
}

module.exports = new ReservationDAO();