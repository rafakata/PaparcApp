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
                    JOIN vehicle v ON r.id_vehicle = v.id_vehicle
                    JOIN customer c ON r.id_customer = c.id_customer
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
                                JOIN vehicle v ON r.id_vehicle = v.id_vehicle
                                JOIN customer c ON r.id_customer = c.id_customer
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

            const [resultAdditionalServices, resultPhotos, resultNotifications] = await Promise.all([
                db.query(sqlAdditionalServices, [id]),
                db.query(sqlPhotos, [id]),
                db.query(sqlNotifications, [id])
            ]);

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
                    LEFT JOIN vehicle v ON r.id_vehicle = v.id_vehicle
                    LEFT JOIN customer c ON r.id_customer = c.id_customer
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

    /**
     * Actualiza una reserva y su vehículo asociado dentro de una transacción para asegurar la consistencia de los datos.
     * Se abre una nueva transacción para asegurarnos que si ocurre algún error durante el proceso no se queden datos
     * guardados a medias en la BD. 
     * @param {number} id_reservation - ID de la reserva a actualizar 
     * @param {Object} updateData - Objetodo con todos los datos validados
     * @returns - Devuelve tru si todo fue bien, lanza error si hubo algún fallo y en todo caso se asegura de liberar la conexión del pool al finalizar la transacción
    */
    async updateReservationTransaction( id_reservation, updateData) {

        // obtenemos una conexion del pool para realizar una transaccion
        const client = await db.connect();

        try {

            await client.query('BEGIN'); // iniciamos la transaccion

            // actualizamos primero los datos de la reserva
            const updateReservationSql = `UPDATE reservation
                                            SET entry_date = $1,
                                                exit_date = $2,
                                                id_main_service = $3,
                                                total_price = $4
                                            WHERE id_reservation = $5
                                            RETURNING id_vehicle;
            `;

            // valores $ para la consulta de actualizacion de la reserva
            const resValues = [
                updateData.entry_date,
                updateData.exit_date,
                updateData.id_main_service,
                updateData.total_price,
                id_reservation
            ];

            const resResult = await client.query(updateReservationSql, resValues);

            if (resResult.rowCount === 0) throw new Error('No se encontró la reserva para actualizar');
            const id_vehicle = resResult.rows[0].id_vehicle;

            // luego actualizamos los datos del vehiculo asociado a la reserva
            const updateVehicleSql = `UPDATE vehicle
                                        SET brand = $1,
                                            model = $2,
                                            color = $3,
                                            type = $4
                                        WHERE id_vehicle = $5;
            `;

            const vehValues = [
                updateData.brand,
                updateData.model,
                updateData.color,
                updateData.vehicle_type,
                id_vehicle
            ];
            await client.query(updateVehicleSql, vehValues);

            // para actualizar los extras primero borramos los servicios e insertamos los nuevos que han sido marcados
            await client.query('DELETE FROM reservation_additional_service WHERE id_reservation = $1', [id_reservation]); // eliminamos los servicios adicionales actuales de la reserva

            // insertamos los nuevos servicios adicionales seleccionados para la reserva
            if (updateData.additional_services && updateData.additional_services.length > 0) {

                const insertAdditionalServiceSql = `INSERT INTO reservation_additional_service
                                                        (id_reservation, id_additional_service)
                                                    VALUES
                                                        ($1, $2)
                `;

                for (const id_additional_service of updateData.additional_services) {
                    await client.query(insertAdditionalServiceSql, [id_reservation, id_additional_service]);
                }

            }

            //confirmamos la transaccion si todo ha ido bien
            await client.query('COMMIT');
            return true;

        } catch(error){

            await client.query('ROLLBACK'); // si ocurre un error, hacemos rollback para no dejar la base de datos en un estado inconsistente
            console.error('Error al actualizar la reserva:', error);
            throw new Error('Error al actualizar la reserva en la BD', { cause: error });

        } finally {

            client.release(); // liberamos la conexion del pool

        }


    }

    /**
     * Crea CLIENTE, VEHÍCULO y RESERVA en una sola operación atómica.
     * Si algo falla en cualquier punto, se hace ROLLBACK y no se guarda nada.
     * * @param {Object} customerData - { phone, full_name, email }
     * @param {Object} vehicleData - { license_plate, brand, model, color, vehicle_type }
     * @param {Object} reservationData - { entry_date, exit_date, total_price, id_main_service, additional_services }
     * @returns {number} - El ID de la nueva reserva
     * @throws - Error si ocurre algún problema durante el proceso
     */
    async createReservationTransaction (customerData, vehicleData, reservationData) {

        const client = await db.connect();

        try {

            await client.query('BEGIN');
            
            //gestion del cliente
            let customerId;
            let sql = `SELECT id_customer FROM customer WHERE phone = $1`;
            let result = await client.query(sql, [customerData.phone]);

            if (result.rows.length > 0) {

                customerId = result.rows[0].id_customer; // cliente ya existe, obtenemos su ID

            } else {

                sql = `INSERT INTO customer (full_name, email, phone, type)
                        VALUES ($1, $2, $3, $4) RETURNING id_customer
                `;

                result = await client.query(sql, [
                    customerData.full_name, 
                    customerData.email || null, // email es opcional, si no se proporciona se guarda como null
                    customerData.phone,
                    'NO-REGISTRADO' // tipo de cliente por defecto para clientes que no se han registrado en la app
                ]);

                customerId = result.rows[0].id_customer; // nuevo cliente creado, obtenemos su ID
            }

            // gestión del vehiculo
            let vehicleId;
            sql = `SELECT id_vehicle FROM vehicle WHERE license_plate = $1`;
            result = await client.query(sql, [vehicleData.license_plate]);

            if (result.rows.length > 0) {

                vehicleId = result.rows[0].id_vehicle; // vehículo ya existe, obtenemos su ID

            } else {

                sql = `INSERT INTO vehicle (license_plate, brand, model, color, type)
                        VALUES ($1, $2, $3, $4, $5) RETURNING id_vehicle
                `;

                result = await client.query( sql, [
                    vehicleData.license_plate,
                    vehicleData.brand || 'Desconocida',
                    vehicleData.model || 'Desconocido',
                    vehicleData.color || 'No color',
                    vehicleData.vehicle_type
                ]);

                vehicleId = result.rows[0].id_vehicle; // nuevo vehículo creado, obtenemos su ID
            }

            // enlace cliente y coche
            sql = `INSERT INTO customer_vehicle (id_customer, id_vehicle) 
                    VALUES ($1, $2) ON CONFLICT DO NOTHING
            `;
            
            await client.query(sql, [customerId, vehicleId]);

            //Crear la reserva
            sql = ` INSERT INTO reservation (
                    entry_date, exit_date, status, total_price,
                    id_customer, id_vehicle, id_main_service
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7) 
                    RETURNING id_reservation
            `;

            const resValues = [
                reservationData.entry_date,
                reservationData.exit_date || null,
                'PENDIENTE', // nueva reserva siempre empieza con estado PENDIENTE
                reservationData.total_price,
                customerId,
                vehicleId,
                reservationData.id_main_service
            ];

            result = await client.query(sql, resValues);
            const newReservationId = result.rows[0].id_reservation;

            // añadir servicios adicionales
            if (reservationData.additional_services && reservationData.additional_services.length > 0) {

                const insertAdditionalServiceSql = `INSERT INTO reservation_additional_service (
                                                        id_reservation, id_additional_service
                                                    ) VALUES (
                                                        $1, $2
                                                    )
                `;

                for (const id_additional_service of reservationData.additional_services) {
                    await client.query(insertAdditionalServiceSql, [newReservationId, id_additional_service]);
                }
            }

            await client.query('COMMIT');
            return newReservationId;

        } catch (error) {

            await client.query('ROLLBACK');
            console.error('Error al crear la reserva con transacción:', error);
            throw new Error('Error al crear la reserva en la BD', { cause: error });

        } finally {

            client.release();   
        }
    }
    
    /**
     * Obtiene el historial completo de reservas con paginación y filtros opcionales.
     * @param {Object} filters - Filtros opcionales: status, search (nombre/matrícula), dateFrom, dateTo
     * @param {number} limit - Número de resultados por página
     * @param {number} offset - Desplazamiento para paginación
     * @returns {Object} - { reservations: Array, totalCount: number }
     */
    async getReservationsHistory(filters = {}, limit = 15, offset = 0) {

        let whereClauses = [];
        let values = [];
        let paramIndex = 1;

        if (filters.status) {
            whereClauses.push(`r.status = $${paramIndex++}`);
            values.push(filters.status);
        }

        if (filters.search) {
            whereClauses.push(`(c.full_name ILIKE $${paramIndex} OR v.license_plate ILIKE $${paramIndex})`);
            values.push(`%${filters.search}%`);
            paramIndex++;
        }

        if (filters.dateFrom) {
            whereClauses.push(`r.entry_date >= $${paramIndex++}`);
            values.push(filters.dateFrom);
        }

        if (filters.dateTo) {
            whereClauses.push(`r.exit_date <= $${paramIndex++}`);
            values.push(filters.dateTo);
        }

        const whereSQL = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

        const countSQL = `SELECT COUNT(*) AS total
                          FROM reservation r
                          JOIN vehicle v ON r.id_vehicle = v.id_vehicle
                          JOIN customer c ON r.id_customer = c.id_customer
                          ${whereSQL}`;

        const dataSQL = `SELECT
                            r.id_reservation, r.reservation_date, r.entry_date, r.exit_date,
                            r.status, r.total_price, r.is_paid, r.payment_method,
                            v.license_plate, v.brand, v.model, v.color, v.type AS vehicle_type,
                            c.full_name AS customer_name, c.phone, c.email,
                            ms.name AS service_name
                         FROM reservation r
                         JOIN vehicle v ON r.id_vehicle = v.id_vehicle
                         JOIN customer c ON r.id_customer = c.id_customer
                         JOIN main_service ms ON r.id_main_service = ms.id_main_service
                         ${whereSQL}
                         ORDER BY r.reservation_date DESC
                         LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;

        try {

            const countResult = await db.query(countSQL, values);
            const totalCount = parseInt(countResult.rows[0].total);

            const dataValues = [...values, limit, offset];
            const dataResult = await db.query(dataSQL, dataValues);

            return {
                reservations: dataResult.rows,
                totalCount
            };

        } catch (error) {
            console.error('Error al obtener el historial de reservas:', error);
            throw new Error('Error al obtener el historial de reservas', { cause: error });
        }
    }

    /**
     * Cancela una reserva cambiando su estado a 'CANCELADA'.
     * También libera la plaza de aparcamiento asociada (cod_parking_spot a NULL) 
     * por si se le había asignado una previamente.
     * @param {number} id_reservation - ID de la reserva a cancelar
     * @returns {boolean} - true si se actualizó, false si no se encontró
     */
    async cancelReservation(id_reservation) {

        const sql = `
            UPDATE reservation
            SET status = 'CANCELADA',
                cod_parking_spot = NULL
            WHERE id_reservation = $1
            RETURNING id_reservation;
        `;

        try {

            const result = await db.query(sql, [id_reservation]);
            return result.rowCount > 0; // Devuelve true si afectó a alguna fila

        } catch (error) {

            console.error(`Error al cancelar la reserva ${id_reservation}:`, error);
            throw new Error('Error al cancelar la reserva en la BD', { cause: error });
            
        }
    }

}

module.exports = new ReservationDAO();