/**
 * Este archivo contiene el controlador para manejar las solicitudes relacionadas con la API.
 * Aquí se reciben los datos enviados desde el cliente, se envían al DAO que correponda
 * se procesan los datos para organizarlos antes enviarlos  y finalmente se envían al cliente. 
*/
const reservationDAO = require('../models/reservation-dao')
const pricingService = require('../services/pricingService');

const apiController = {

    // Obtener reservas por fecha
    getReservationsByDate: async (req,res) => {

        try {

            // si la respuesta no tiene fecha (la url no tiene el query date) se asigna la fecha actual.
            const queryDate = req.query.date || new Date().toISOString().split('T')[0]

            console.log(`Solicitud de reservas para la fecha: ${queryDate}`)

            //enviamos la fecha al DAO para obtener las reservas de esa fecha
            const reservations = await reservationDAO.getReservationsByDate(queryDate)

            //montamos un objeto de respuesta separando las reservas para facilidad de uso en el cliente.
            const response = {
                date: queryDate,
                stats: {
                    total_entries: 0,
                    total_exits: 0,
                },
                entries: [],
                exits: []
            }

            //Recorremos las reservas obtenidas en nuestra consulta y llenamos de datos el objetod response
            reservations.forEach(reservation=> {

                const entryDate = new Date(reservation.entry_date).toLocaleDateString('en-CA') //usamos en formato de canada porque es el que coincide con el formato informatico ISO

                const exitDate = reservation.exit_date ? new Date(reservation.exit_date).toLocaleDateString('en-CA') : null //entendemos que exit date puede ser null porque hay clientes que pueden no indicar la fecha de salida

                if (entryDate === queryDate) response.entries.push(reservation); //si la fecha de entrada coincide con la fecha de la query entonces es una entrada

                if (exitDate === queryDate) response.exits.push(reservation); //si la fecha de salida coincide con la fecha de la query entonces es una salida

            });

            //llenamos las estadisticas de la respuesta con el total de entradas y salidas
            response.stats.total_entries = response.entries.length; 
            response.stats.total_exits = response.exits.length;

            res.json(response);

        } catch (error) {

            console.error('Error al obtener las reservas por fecha:', error);
            res.status(500).json({ error: 'Error en el servidor, por favor intente más tarde.' });

        }
    },

    calculatePriceDynamic : async (req, res) => {

        try {

            const { entry_date, exit_date, vehicle_type, id_main_service, additional_services } = req.body;

            if (!entry_date || !exit_date ) {
                return res.status(400).json({
                    success: false,
                    message: 'Las fechas de entrada y salida son requeridas para calcular el precio.'
                })
            }

            const entryDate = new Date(entry_date);
            const exitDate = new Date(exit_date);

            const extra_additional_services = additional_services ? additional_services : [];

            const newTotalPrice = pricingService.calculateTotalPrice(
                entryDate, 
                exitDate, 
                vehicle_type, 
                parseInt(id_main_service), 
                extra_additional_services.map(id => parseInt(id))
            );

            res.json({
                success: true,
                total_price: newTotalPrice
            })

        } catch (error) {

            console.error('Error al calcular el precio dinámico:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Error en el servidor al calcular el precio dinámico.'
            })
        }


    },

    // Crear reserva pública
    createPublicReservation: async (req, res) => {

        try {

            const data = req.body;

            // Validaciones mínimas de seguridad
            if (!data.entry_date || !data.phone || !data.license_plate) {
                return res.status(400).json({ success: false, message: 'Faltan datos obligatorios.' });
            }

            //datos del Cliente
            const customerData = {
                full_name: data.full_name,
                phone: data.phone,
                email: data.email || null,
                type: 'NO-REGISTRADO' // Etiquetamos al cliente para saber que vino de la web pública sin cuenta
            };

            //datos del Vehículo
            const vehicleData = {
                license_plate: data.license_plate,
                brand: data.brand || 'Desconocida',
                model: data.model || 'Desconocido',
                color: 'No color', 
                vehicle_type: data.vehicle_type
            };

            // recalculamos el precio de nuevo en el servidor
            const pricingService = require('../services/pricingService'); 
            const totalPrice = pricingService.calculateTotalPrice(
                new Date(data.entry_date),
                new Date(data.exit_date),
                data.vehicle_type,
                parseInt(data.id_main_service),
                (data.additional_services || []).map(id => parseInt(id))
            );

            //datos de la Reserva
            const reservationData = {
                entry_date: data.entry_date,
                exit_date: data.exit_date,
                total_price: totalPrice,
                id_main_service: parseInt(data.id_main_service),
                additional_services: data.additional_services || []
            };

            // creamos la reserva
            const newReservationId = await reservationDAO.createReservationTransaction(
                customerData, 
                vehicleData, 
                reservationData
            );

            //devolvemos los datos al frontend para mostrar un resumen de la reserva al cliente
            res.status(201).json({
                success: true,
                message: 'Reserva creada con éxito',
                data: {
                    id_reservation: newReservationId,
                    customer_name: customerData.full_name,
                    phone: customerData.phone,
                    license_plate: vehicleData.license_plate,
                    brand: vehicleData.brand,
                    model: vehicleData.model,
                    total_price: totalPrice
                }
            });

        } catch (error) {

            console.error('Error al crear reserva pública:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al procesar tu reserva.'
            });

        }
    }

}

module.exports = apiController;