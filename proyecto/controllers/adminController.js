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
            ]);;
            
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
            const { 
                customer_name, phone, email,
                entry_date, exit_date, 
                brand, model, color, vehicle_type, 
                id_main_service, additional_services, cod_parking_spot
            } = req.body;

            // limpieamos la plaza quitando espacios en blanco y convirtiendo a mayúsculas para mantener un formato consistente
            const normalizedCodParkingSpot  = 
                cod_parking_spot && cod_parking_spot.trim() !== '' 
                ? cod_parking_spot.trim().toUpperCase()
                : null
            ;

            // restricion de seguridad, solo permitimos actualizar reservas que estén en estado EN CURSO o FINALIZADA
            const currentReservation = await reservationDAO.getInfoReservationByIdReservation(id_reservation);

            if (!currentReservation) {
                return res.redirect('/admin/dashboard');
            }

            const requireStatus = ['EN CURSO','FINALIZADA'];

            if (requireStatus.includes(currentReservation.status) && !normalizedCodParkingSpot) {
                const errMsg = `Para actualizar una reserva que está en estado '${currentReservation.status}' es necesario asignar una plaza de parking. Por favor, asigna una plaza de parking para continuar con la actualización.`;
                return res.redirect(`/admin/reservations/details/${id_reservation}?error=${encodeURIComponent(errMsg)}`);
            }

            // normalizamos los servicios adicionales para que siempre sea un array
            let arrayAdditionalServices = [];

            if (additional_services) {
                if (Array.isArray(additional_services)) { // si es un array, lo mapeamos a enteros
                    arrayAdditionalServices = additional_services.map( id => parseInt(id) );
                } else { // si es un solo valor, lo convertimos a entero y lo ponemos en un array
                    arrayAdditionalServices = [parseInt(additional_services)];
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
                additional_services : arrayAdditionalServices,
                cod_parking_spot : normalizedCodParkingSpot
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
                title: 'Booking History',
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
     * 
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

            // validamos que no hay incogruencias entre el tipo de vehiculo ya registrado con esa matricula y el tipo de vehiculo que se intenta registrar en la reserva
            const existingVehicle = await vehicleDAO.getVehicleByLicensePlate(license_plate.toUpperCase());

            if (existingVehicle && existingVehicle.type !== vehicle_type) {
                return res.status(400).json({ success: false, message: `La matrícula ${license_plate.toUpperCase()} ya está registrada para un vehículo de tipo ${existingVehicle.type}. Por favor, corrige el tipo de vehículo o verifica la matrícula.` });
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

    },

    /**
     * PATCH /admin/reservations/:id/cancel
     * Esta función se encarga de cancelar una reserva existente. 
     * Realiza una eliminación lógica (soft delete) cambiando el estado de la reserva a "CANCELADA".
     * Solo permite cancelar reservas que no hayan empezado o terminado.
     * @param {*} req 
     * @param {*} res 
     * @returns JSON con el resultado de la operación
     */
    cancelReservation: async (req, res) => {

        try {

            const idReservation = parseInt(req.params.id);

            // Buscamos la reserva actual para comprobar su estado
            const currentReservation = await reservationDAO.getInfoReservationByIdReservation(idReservation);

            if (!currentReservation) {
                return res.status(404).json({ success: false, message: 'Reserva no encontrada.' });
            }

            // Solo se puede cancelar si aun no ha entrado
            const allowStatus = ['PENDIENTE'];
            if (!allowStatus.includes(currentReservation.status)) {
                return res.status(400).json({ 
                    success: false, 
                    message: `No se puede cancelar una reserva que está en estado '${currentReservation.status}'.` 
                });
            }

            const isCancelled = await reservationDAO.cancelReservation(idReservation);

            if (isCancelled) {
                return res.status(200).json({ success: true, message: 'Reserva cancelada correctamente.' });
            } else {
                return res.status(500).json({ success: false, message: 'No se pudo actualizar la base de datos.' });
            }

        } catch (error) {

            console.error('Error en el controlador cancelReservation:', error);
            return res.status(500).json({ success: false, message: 'Error interno del servidor.' });

        }
    },

    /**
     * PATCH /admin/reservations/:id/start
     * Cambia el estado de una reserva a "EN CURSO" para indicar que el cliente ha entrado al parking.
     * Solo permite iniciar reservas que estén en estado "PENDIENTE", minimo 5 fotos y una plaza asignada.
     * @param {*} req 
     * @param {*} res 
     * @returns JSON con el resultado de la operación
    */ 
    startReservation: async (req, res) => {

        try {

            const idReservation = parseInt(req.params.id); // extraemos el id de la reserva de los parámetros de la ruta

            // traemos toda la info de la reserva y validamos.
            const reservationInfo = await reservationDAO.getInfoReservationByIdReservation(idReservation);

            if (!reservationInfo) return res.status(404).json({ success: false, message: 'Reserva no encontrada.' });

            //solo reservas pendientes
            if (reservationInfo.status !== 'PENDIENTE') return res.status(400).json({ success: false, message: `Solo se pueden iniciar reservas que estén en estado 'PENDIENTE'. El estado actual es '${reservationInfo.status}'.` });

            // minimo 5 fotos
            if (!reservationInfo.photos || reservationInfo.photos.length < 5) return res.status(400).json({ success: false, message: 'Para iniciar la reserva es necesario tomar al menos 5 fotos del vehículo.' });

            //plaza asignada
            if (!reservationInfo.cod_parking_spot) return res.status(400).json({ success: false, message: 'Para iniciar la reserva es necesario asignar una plaza de parking.' });

            const isStarted = await reservationDAO.startReservation(idReservation);

            if (isStarted) {
                return res.status(200).json({ success: true, message: 'Reserva iniciada correctamente.' });
            } else {
                return res.status(500).json({ success: false, message: 'No se pudo actualizar la base de datos.' });
            }

        } catch (error) {

            console.error('Error en el controlador startReservation:', error);
            return res.status(500).json({ success: false, message: 'Error interno del servidor.' });

        }
    },

    /**
     * PATCH /admin/reservations/:id/finalize
     * Cambia el estado de una reserva a "FINALIZADA" para indicar que el cliente ha salido del parking.
     * Solo permite finalizar reservas que estén en estado "EN CURSO" y que hayan pagado el total de la reserva.
     * @param {*} req 
     * @param {*} res 
     * @returns JSON con el resultado de la operación
    */ 
    finalizeReservation: async (req, res) => {

        try {

            const idReservation = parseInt(req.params.id); // extraemos el id de la reserva de los parámetros de la ruta
            const  { paymentMethod } = req.body; // extraemos el método de pago del cuerpo de la solicitud

            // traemos toda la info de la reserva y validamos.
            const reservationInfo = await reservationDAO.getInfoReservationByIdReservation(idReservation);

            if (!reservationInfo) return res.status(404).json({ success: false, message: 'Reserva no encontrada.' });

            //solo reservas en curso
            if (reservationInfo.status !== 'EN CURSO') return res.status(400).json({ success: false, message: `Solo se pueden finalizar reservas que estén en estado 'EN CURSO'. El estado actual es '${reservationInfo.status}'.` });

            // validamos que el método de pago sea válido
            const validPaymentMethods = ['EFECTIVO', 'TARJETA'];
            if (!validPaymentMethods.includes(paymentMethod)) {
                return res.status(400).json({ success: false, message: 'Método de pago no válido. Los métodos de pago aceptados son: EFECTIVO, TARJETA.' });
            }

            const isFinalized = await reservationDAO.finishReservationAndPayment(idReservation, paymentMethod);

            if (isFinalized) {
                return res.status(200).json({ success: true, message: 'Reserva finalizada correctamente.' });
            } else {
                return res.status(500).json({ success: false, message: 'No se pudo actualizar la base de datos.' });
            }

        } catch (error) {

            console.error('Error en el controlador finalizeReservation:', error);
            return res.status(500).json({ success: false, message: 'Error interno del servidor.' });

        }

    },

    /**
     * POST /admin/reservations/:id/photos
     * Añade una nueva foto de evidencia a la reserva.
     * Valida que la URL de la foto no esté vacía, que la reserva exista y que su estado permita añadir fotos (no se pueden añadir fotos a reservas ya finalizadas o canceladas).
     * @param {*} req 
     * @param {*} res 
     * @returns JSON con el resultado de la operación
     */
    addPhoto: async (req, res) => {

        try {

            const id_reservation = parseInt(req.params.id);
            const { file_path, description } = req.body;

            // validar si la URL de la foto no está vacía
            if (!file_path || file_path.trim() === '') {
                return res.status(400).json({ success: false, message: 'La URL de la foto es obligatoria.' });
            }

            //Validar que la reserva exista
            const reservation = await reservationDAO.getInfoReservationByIdReservation(id_reservation);
            if (!reservation) {
                return res.status(404).json({ success: false, message: 'Reserva no encontrada.' });
            }

            // Solo se pueden añadir fotos si la reserva no está finalizada o cancelada
            if (['FINALIZADA', 'CANCELADA'].includes(reservation.status)) {
                return res.status(400).json({ 
                    success: false, 
                    message: `No se pueden añadir evidencias a una reserva en estado '${reservation.status}'.` 
                });
            }

            const isSaved = await reservationDAO.addPhotoEvidence(id_reservation, file_path, description);

            if (isSaved) {
                return res.status(201).json({ success: true, message: 'Evidencia añadida correctamente.' });
            } else {
                return res.status(500).json({ success: false, message: 'No se pudo registrar la evidencia en la base de datos.' });
            }

        } catch (error) {

            console.error('Error en addPhoto:', error);
            res.status(500).json({ success: false, message: 'Error interno del servidor al añadir la evidencia.' });
            
        }
    }
    
}

module.exports = adminController;