/**
 *  Desde este ccontrolador vamos a manejar toda la lógica relacionada con el panel de administración.
 *  Aquí se manejarán las rutas y la lógica para el dashboard.
*/

const reservationDAO = require('../models/reservation-dao');
const serviceCatalogDAO = require('../models/service-catalog-dao');
const pricingService = require('../services/pricingService');
const customerDAO = require('../models/customer-dao');
const vehicleDAO = require('../models/vehicle-dao');

const adminController = {

    getDashboard: async (req, res) => {
        console.log('Accediendo al panel de administración por el usuario:', req.session.user.email);
        res.render('dashboard', { title: 'Dashboard' });
    },

    getParking: (req, res) => {
        console.log('Accediendo al parking en tiempo real por el usuario:', req.session.user.email);
        res.render('dashboard_parking', { title: 'Parking en Tiempo Real' });
    },

    /**
     * Busca la información de una reserva específica por su ID y la muestra en una página de detalles.
     * + trae también la información de los tipos de vehículos, servicios principales y servicios adicionales 
     * para mostrarla en la página de detalles de la reserva.
     * @param {*} req 
     * @param {*} res 
     * @returns renderiza la página de detalles de la reserva o redirige al dashboard si no se encuentra la reserva
    */
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

    },

    /**
     * GET /admin/history
     * Muestra el historial completo de reservas con filtros y paginación.
     */
    getHistory: async (req, res) => {

        try {

            const page = parseInt(req.query.page) || 1;
            const limit = 15;
            const offset = (page - 1) * limit;

            const filters = {
                status: req.query.status || '',
                search: req.query.search || '',
                dateFrom: req.query.dateFrom || '',
                dateTo: req.query.dateTo || ''
            };

            const { reservations, totalCount } = await reservationDAO.getReservationsHistory(filters, limit, offset);
            const totalPages = Math.ceil(totalCount / limit);

            res.render('history', {
                title: 'Historial de Reservas',
                reservations,
                filters,
                pagination: { page, totalPages, totalCount }
            });

        } catch (error) {
            console.error('Error al obtener el historial:', error);
            res.status(500).send('Error al cargar el historial de reservas');
        }

    },

    /**
     * Renderiza el formulario para crear una nueva reserva desde el dashboard de administración.
     * Trae la información de los tipos de vehículos, servicios principales y servicios adicionales 
     * para mostrarla en el formulario.
     * @param {*} req 
     * @param {*} res 
    */
    getNewReservationForm: async (req, res) => {

        try {

            const [vehicleTypes, mainServices, additionalServices] = await Promise.all([
                serviceCatalogDAO.getVehicleTypes(),
                serviceCatalogDAO.getMainServices(),
                serviceCatalogDAO.getAllAdditionalServices()
            ]);

            res.render('dashboard_booking', {
                title: 'Nueva Reserva',
                user: req.session.user,
                vehicleTypes,
                mainServices,
                additionalServices
            })

        } catch (error) {

            console.error('Error al cargar el formulario de nueva reserva:', error);
            res.status(500).send('Error al cargar el formulario de nueva reserva');

        }

    },

    /**
     * POST /admin/reservations/new
     * Procesa el formulario del mostrador para crear una reserva nueva.
     * Orquesta la creación/búsqueda del cliente, del coche y la inserción final.
     * @param {*} req 
     * @param {*} res 
    */
    createNewReservation: async (req, res) => {

        try {
            //extraemos los datos del formulario
            const  {
                phone, full_name, email,
                license_plate, brand, model, color, vehicle_type,
                entry_date, exit_date, id_main_service, additional_services
            } = req.body;

            // VALIDACIONES LOGICA DE NEGOCIO
            //Telefono y matricula no pueden estar vacíos
            if  (!phone || phone.trim() === '') {
                return res.status(400).json({ success: false, message: 'El teléfono es obligatorio' });
            }

            if (!license_plate || license_plate.trim() === '') {
                return res.status(400).json({ success: false, message: 'La matrícula es obligatoria' });
            }

            //validamos que la fecha de entrada sea anterior a la fecha de salida
            const entryDate = new Date(entry_date);
            const exitDate = exit_date ? new Date(exit_date) : null; // exit_date puede ser null si el cliente no lo ha proporcionado
            if (exitDate && entryDate >= exitDate) {
                return res.status(400).json({ success: false, message: 'La fecha de entrada debe ser anterior a la fecha de salida' });
            }   

            // PREPARAMOS LOS DATOS
            let arrayAdditionalServices = [];
            if (additional_services) {
                if (Array.isArray(additional_services)) { // si es un array, lo mapeamos a enteros
                    arrayAdditionalServices = additional_services.map( id => parseInt(id) );
                } else {
                    arrayAdditionalServices = [parseInt(additional_services)]; // si es un solo valor, lo convertimos a entero y lo ponemos en un array
                }
            }

            // calculamos el precio total de la reserva
            const totalPrice = pricingService.calculateTotalPrice(
                entry_date,
                exit_date,
                vehicle_type,
                parseInt(id_main_service),
                arrayAdditionalServices
            );

            // PREPARAMOS EL PAQUETE DE DATOS PARA LA INSERCIÓN
            const customerData = {
                full_name,
                phone,
                email
            }

            const vehicleData = {
                license_plate: license_plate.toUpperCase(),
                brand,
                model,
                color,
                vehicle_type
            };

            const reservationData = {
                entry_date,
                exit_date : exit_date || null, // si no se proporciona fecha de salida, se guarda como null
                id_main_service: parseInt(id_main_service),
                total_price: totalPrice,
                additional_services: arrayAdditionalServices
            }

            const newReservationId = await reservationDAO.createReservationTransaction(
                customerData,
                vehicleData,
                reservationData
            );

            // respondemos con un mensaje de éxito y los datos de la nueva reserva para el sweetalert del frontend
            return res.status(201).json({
                success: true,
                message: 'Reserva guardada correctamente',
                data: {
                    id_reservation: newReservationId,
                    customer_name: full_name,
                    license_plate: license_plate.toUpperCase(),
                    entry_date: entryDate.toLocaleString('es-ES'),
                    total_price: totalPrice
                }
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Error en el servidor, revisa los datos proporcionados' });
        }

    }

}

module.exports = adminController;