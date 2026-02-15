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

    // Obtener plazas de parking con su estado actual
    getParkingSpots: async (req, res) => {

        try {

            const data = await reservationDAO.getParkingSpotsWithStatus();
            res.json(data);

        } catch (error) {

            console.error('Error al obtener las plazas de parking:', error);
            res.status(500).json({ error: 'Error al obtener las plazas de parking.' });

        }
    }

}

module.exports = apiController;