/**
 *  Desde este ccontrolador vamos a manejar toda la lógica relacionada con el panel de administración.
 *  Aquí se manejarán las rutas y la lógica para el dashboard.
*/

const reservationDAO = require('../models/reservation-dao');
const serviceCatalogDAO = require('../models/service-catalog-dao');
const pricingService = require('../services/pricingService');

const adminController = {

    getDashboard: async (req, res) => {
        console.log('Accediendo al panel de administración por el usuario:', req.session.user.email);
        res.render('dashboard', { title: 'Dashboard' });
    },

    getParking: (req, res) => {
        console.log('Accediendo al parking en tiempo real por el usuario:', req.session.user.email);
        res.render('dashboard_parking', { title: 'Parking en Tiempo Real' });
    },

    getReservationInfo: async (req, res) => {

        try {

            const { id } = req.params;

            const reservation = await reservationDAO.getInfoReservationByIdReservation(id);

            if (!reservation) return res.redirect('/admin/dashboard');

            const [vehicleTypes, mainServices, additionalServices] = await Promise.all([
                serviceCatalogDAO.getVehicleTypes(),
                serviceCatalogDAO.getMainServices(),
                serviceCatalogDAO.getAllAdditionalServices()
            ]);
            
            res.render('reservation-details', {
                title : `Gestión Reserva #${id}`,
                reservation : reservation ,
                vehicleTypes : vehicleTypes,
                mainServices : mainServices,
                additionalServices : additionalServices
            });

        } catch (error) {

            console.error('Error al obtener la información de la reserva:', error);
            res.status(500).send('Error al obtener la información de la reserva');
        }
    },

    /**
     * POST /reservations/:id/edit
     * Esta función se encarga de actualizar una reserva existente. 
     * Recibe los datos del formulario de edición de la reserva, 
     * valida las fechas, recalcula el precio total y luego actualiza la reserva en la base de datos.
    */
    updateReservation: async (req, res) => {

        try {

            //extraemos el id de la reserva
            const id_reservation = req.params.id;

            // extraemos los datos del formulario
            const { entry_date, exit_date, license_plate, 
                    brand, model, color, vehicle_type, 
                    id_main_service, additionalServices
            } = req.body;

            // normalizamos los servicios adicionales para que siempre sea un array
            let arrayAdditionalServices = [];

            if (additionalServices) {
                if (Array.isArray(additionalServices)) {
                    arrayAdditionalServices = additionalServices.map( id => parseInt(id) );
                } else {
                    arrayAdditionalServices = [parseInt(additionalServices)];
                }
            }

            const entryDate = new Date(entry_date);
            const exitDate = new Date(exit_date);

            // validamos que la fecha de entrada sea anterior a la fecha de salida
            if (entryDate >= exitDate) {
                return res.status(400).send('La fecha de entrada debe ser anterior a la fecha de salida');
            }

            // volvemos a calcular el precio para comprobar que el precio calculado coincide con el precio enviado desde el formulario
            const newTotalPrice = pricingService.calculateTotalPrice(
                entry_date,
                exit_date,
                vehicle_type,
                parseInt(id_main_service),
                arrayAdditionalServices
            );

            // preparamos en paquete de datos que enviamos al dao
            const updateData = {
                entry_date : entry_date,
                exit_date : exit_date,
                id_main_service : parseInt(id_main_service),
                total_price : newTotalPrice,
                brand : brand,
                model : model,
                color : color,
                vehicle_type : vehicle_type,
                additional_services : arrayAdditionalServices
            };

            // ejecutamos la actualización de la reserva en la base de datos
            await reservationDAO.updateReservationTransaction(id_reservation, updateData);

            // redirigimos a la página de detalles de la reserva con un mensaje de éxito
            res.redirect(`/admin/reservations/details/${id_reservation}?updated=true`);

        } catch (error) {

            console.error('Error al actualizar la reserva:', error);
            res.status(500).send('Error al actualizar la reserva');
        }

    }

}

module.exports = adminController;