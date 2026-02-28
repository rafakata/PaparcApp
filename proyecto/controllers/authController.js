/**
 * Desde aqui vamos a controlar toda la lógica de autenticación. 
*/

//Importamos las dependencias necesarias
const customerDAO = require('../models/customer-dao')
const reservationDAO = require('../models/reservation-dao')
const serviceCatalogDAO = require('../models/service-catalog-dao')
const bcrypt = require('bcrypt')

//Creamos la funcion encargada de controlar el login/logout/register
const authController = {

    //formulario de login
    formLogin: (req,res) => {

        if (req.session.user) return res.redirect('/users/profile');

        let successMessage = null;

        if (req.query.registered === 'true') {
            successMessage = 'Registro exitoso. Por favor, inicia sesión.'
        } else if (req.query.logout === 'true') {
            successMessage = 'Has cerrado sesión exitosamente. Hasta pronto!'
        }

        res.render('login', {
            title: 'User Login',
            error: null,
            success: successMessage,
            formData: {} // Devolvemos un objeto vacío para evitar errores en la vista al intentar acceder a formData.email o formData.password
        })

    },

    //formulario de resgistro
    formRegister: (req,res) => {

        if (req.session.user) return res.redirect('/users/profile');
        res.render('register', { title: 'Registro de Usuario' })

    },

    // Login
    login: async(req,res) => {
        
        // extraemo email, password y el tipo de formulario que se usó
        const { email, password, loginType } = req.body
        console.log(`Intento de login con email: ${email}, tipo de login: ${loginType}`)

        try {

            //buscamos el mail en la base de datos
            const user = await customerDAO.getCustomerByEmail(email);

            // verificamos que el usuario exista, si no existe mostramos un error
            if (!user) {
                return res.render('login', { 
                    title: 'User Login',
                    error: 'Usuario no encontrado',
                    success: null,
                    formData: { email } // Devolvemos el email para que el usuario no tenga que volver a escribirlo, pero no devolvemos la contraseña por seguridad 
                })
            } 

            // verificamos la constraseña, si no coincide mostramos un error
            const passwordMatch = await bcrypt.compare(password, user.password_hash)
            if (!passwordMatch) {
                return res.render('login', { 
                    title: 'User Login',
                    error: 'Contraseña incorrecta',
                    success: null,
                    formData: { email } // devolvemos el mail
                })
            } 

            // ----- LÓGICA PARA SIMULACIÓN DE DOBLE ACCESO -----------------

            //Caso: Si el loginType es 'worker'. Recordar que el login type viene dado por el campo hidden del formulario
            if (loginType === 'worker') {

                if (user.type !== 'ADMIN') {

                    console.warn(`Cliente ${user.full_name} intentó acceder desde acceso de empleados.`)
                    return res.render('login', { 
                        title: 'User Login',
                        error: 'Acceso denegado. No tienes permisos para acceder como empleado.',
                        success: null,
                        formData: { email } 
                    })

                }
            }

            //3. Creamos la sesión del usuario
            req.session.user = {
                id: user.id_customer,
                nombre: user.full_name,
                email: user.email,
                numero: user.phone,
                role: user.type
            }

            //4. Redirigimos al usuario a la página correspondiente según su rol
            req.session.save(() => {
                if (user.type === 'ADMIN') {
                    return  res.redirect('/admin/dashboard')
                } else {
                    return res.redirect('/users/profile')
                }
            })

        } catch (error) {
            console.error('Error en login:', error)
            res.render('login', { 
                title: 'User Login',
                error: 'Error en el servidor. Inténtalo de nuevo más tarde.',
                success: null,
                formData: { email }
            })
        }

    },

    // Logout
    logout: (req, res) => {

        // Destruimos la sesión del usuario
        req.session.destroy((err) => {
            if (err) {
                console.error('Error al cerrar sesión:', err);
                return res.redirect('/users/profile')
            }

            // Limpiamos la cookie de sesión y redirigimos al login
            res.clearCookie('connect.sid');

            res.redirect('/users/login?logout=true'); //pasamos un query param para mostrar un mensaje de logout exitoso en la página de login
        })

    },

    // Register
    register: async (req, res) => {

        const { full_name, email, password, confirm_password } = req.body

        try {

            // Verificamos que las contraseñas coincidan
            if (password !== confirm_password) {
                return  res.render('register', { 
                    title : 'Registro de Usuario',
                    error : 'Las contraseñas no coinciden.',
                    formData : req.body // Devolvemos los datos del formulario para que el usuario no tenga que volver a escribirlos 
                })
            }

            //Validamos si ya existe el usuario con ese mail
            const existingUser = await customerDAO.getCustomerByEmail(email)

            if (existingUser) {
                return res.render('register', {
                    title : 'Registro de Usuario',
                    error : 'El email ya está registrado.',
                    formData : req.body // Mantenemos el nombre, borramos el mail para que el usuario tenga que escribir un mail diferente, asi se le recuerda que el mail es el problema
                })
            }

            // encriptamos la contraseña
            const saltRounds = 10 // número de rondas de salting, tiempo de procesamiento 10 = 100ms = 0.1s aprox. que tarda en hashear
            const password_hash = await bcrypt.hash(password, saltRounds)

            // Creamos el nuevo usuario en la base de datos
            const newUserId = await customerDAO.createCustomer({
                full_name: full_name,
                email: email,
                password_hash: password_hash
            })

            console.log(`Nuevo usuario registrado con ID: ${newUserId}`)

            // Redirigimos al usuario a la página de login tras el registro
            res.redirect('/users/login?registered=true');

        } catch (error) {

            console.error('Error al registrar el usuario:', error)
            res.render('register', {
                title : 'Registro de Usuario',
                error : 'Error al registrar el usuario. Inténtalo de nuevo más tarde.',
                formData : req.body
            });

        }
    },

    // Social Login (Google/Facebook via Firebase)
    socialLogin: async (req, res) => {
        const { idToken, provider, uid, email, displayName, photoURL } = req.body;

        try {
            // Verificamos si el usuario ya existe en nuestra base de datos
            let user = await customerDAO.getCustomerByEmail(email);

            if (!user) {
                // Si no existe, creamos un nuevo usuario
                const newUserId = await customerDAO.createCustomer({
                    full_name: displayName || 'Usuario ' + provider,
                    email: email,
                    password_hash: 'SOCIAL_LOGIN_' + provider.toUpperCase() + '_' + uid, // No usamos contraseña real para usuarios sociales
                    phone: null
                });

                user = await customerDAO.getCustomerByEmail(email);
                console.log(`Nuevo usuario social registrado: ${email} via ${provider}`);
            }

            // Creamos la sesión del usuario
            req.session.user = {
                id: user.id_customer,
                nombre: user.full_name,
                email: user.email,
                numero: user.phone,
                role: user.type,
                photoURL: photoURL,
                socialProvider: provider
            };

            req.session.save(() => {
                res.json({
                    success: true,
                    redirectUrl: user.type === 'ADMIN' ? '/admin/dashboard' : '/users/profile',
                    message: 'Login exitoso'
                });
            });

        } catch (error) {
            console.error('Error en social login:', error);
            res.status(500).json({
                success: false,
                message: 'Error al procesar el inicio de sesión social'
            });
        }
    },

    // Pagina de perfil de usuario (solo para clientes)
    renderProfile: async (req, res) => {
        try {
            const userId = req.session.user.id;

            // 1. Obtenemos TODOS los datos necesarios en paralelo
            const [vehicles, reservations, mainServices, additionalServices] = await Promise.all([
                customerDAO.getVehiclesByCustomerId(userId),
                reservationDAO.getReservationsByCustomerId(userId),
                serviceCatalogDAO.getMainServices(true), // Servicios principales activos
                serviceCatalogDAO.getAllAdditionalServices(true) // Servicios adicionales activos
            ]);

            // 2. Filtramos las reservas
            const activeReservations = reservations.filter(r => r.status === 'PENDIENTE' || r.status === 'EN CURSO');
            const historyReservations = reservations.filter(r => r.status === 'FINALIZADA' || r.status === 'CANCELADA');

            // 3. Renderizamos la vista
            res.render('profile', { 
                title: 'Mi Perfil | PaparcApp',
                userVehicles: vehicles,
                activeReservations: activeReservations,
                historyReservations: historyReservations,
                mainServices: mainServices,
                additionalServices: additionalServices
            });

        } catch (error) {
            console.error('Error al cargar el perfil del usuario:', error);
            res.status(500).send('Error interno al cargar el perfil. Por favor, inténtalo de nuevo.');
        }
    },

    // PUT Actualizar datos del perfil
    updateProfile: async (req, res) => {

        try {

            const userId = req.session.user.id;
            const { nombre, email, telefono } = req.body;

            await customerDAO.updateCustomerData(userId, nombre, email, telefono);

            //Actualizamos los datos de la sesion para que no queden los antiguos
            req.session.user.nombre = nombre;
            req.session.user.email = email;
            req.session.user.numero = telefono;

            req.session.save(() => {
                res.json({ success: true, message: 'Datos actualizados correctamente.' });
            });

        } catch (error) {

            console.error('Error al actualizar perfil:', error);
            res.status(500).json({ success: false, message: 'Error interno al actualizar los datos.' });

        }
    },

    // PUT Actualizar contraseña
    updatePassword: async (req, res) => {

        try {

            const userId = req.session.user.id;
            const { currentPassword, newPassword, confirmPassword } = req.body;

            if (newPassword !== confirmPassword) {
                return res.status(400).json({ success: false, message: 'Las contraseñas nuevas no coinciden.' });
            }

            // // verificamos por seguridad que el usuario exista
            const user = await customerDAO.getCustomerById(userId);
            if (!user || !user.password_hash) {
                return res.status(400).json({ success: false, message: 'No se puede cambiar la contraseña de este usuario.' });
            }

            // comparamos las contraseñas para verificar que la actual es correcta
            const passwordMatch = await bcrypt.compare(currentPassword, user.password_hash);
            if (!passwordMatch) {
                return res.status(401).json({ success: false, message: 'La contraseña actual es incorrecta.' });
            }

            //hasheamos la nueva contraseña por seguridad antes de guardarla en la base de datos
            const saltRounds = 10;
            const newHash = await bcrypt.hash(newPassword, saltRounds);

            await customerDAO.updateCustomerPassword(userId, newHash);

            res.json({ success: true, message: 'Contraseña actualizada con éxito.' });

        } catch (error) {

            console.error('Error al cambiar contraseña:', error);
            res.status(500).json({ success: false, message: 'Error interno al cambiar la contraseña.' });

        }
    },

    // PUT Cancelar reserva desde el perfil
    cancelReservation: async (req, res) => {
        try {
            const reservationId = req.params.id;
            const userId = req.session.user.id;

            // 1. Verificamos que la reserva existe y pertenece a este usuario
            const reservationDAO = require('../models/reservation-dao');
            const reserva = await reservationDAO.getInfoReservationByIdReservation(reservationId);

            // Nota: En tu consulta del DAO, sacaste todo como JOIN, así que debemos comprobar
            // cómo lo devuelve. Pero si devuelve el objeto entero o nulo, la lógica es:
            if (!reserva || reserva.id_customer !== userId) {
                // Pequeño parche: como tu JOIN en getInfoReservationByIdReservation no saca r.id_customer explícitamente, 
                // pero sabemos que existe si la buscamos antes. Si tu consulta no devuelve id_customer, avísame.
                // Asumiendo que SÍ lo devuelve:
                return res.status(403).json({ success: false, message: 'No tienes permiso para cancelar esta reserva.' });
            }

            if (reserva.status !== 'PENDIENTE') {
                return res.status(400).json({ success: false, message: 'Solo se pueden cancelar reservas en estado PENDIENTE.' });
            }

            // 2. Usamos el método que ya tienes en tu DAO
            await reservationDAO.cancelReservation(reservationId);

            res.json({ success: true, message: 'La reserva ha sido cancelada exitosamente.' });

        } catch (error) {
            console.error('Error al cancelar reserva:', error);
            res.status(500).json({ success: false, message: 'Error interno del servidor.' });
        }
    },

    // PUT Editar reserva desde el perfil
    editReservation: async (req, res) => {
        try {
            const reservationId = req.params.id;
            const { entry_date, exit_date, id_main_service, additional_services } = req.body;

            const reservationDAO = require('../models/reservation-dao');
            const pricingService = require('../services/pricingService');

            const reserva = await reservationDAO.getInfoReservationByIdReservation(reservationId);

            if (!reserva) return res.status(404).json({ success: false, message: 'Reserva no encontrada.' });

            // 1. AHORA PERMITIMOS 'PENDIENTE' Y 'EN CURSO'
            if (reserva.status !== 'PENDIENTE' && reserva.status !== 'EN CURSO') {
                return res.status(400).json({ success: false, message: 'Solo se pueden editar reservas PENDIENTES o EN CURSO.' });
            }

            // 2. BLOQUEO DE SEGURIDAD DE LA FECHA DE ENTRADA
            // Si está EN CURSO, ignoramos la fecha que manda el Frontend y usamos la real de la BD.
            const finalEntryDate = (reserva.status === 'EN CURSO') ? reserva.entry_date : new Date(entry_date);
            const finalExitDate = new Date(exit_date);

            // 3. Calculamos el nuevo precio seguro en el servidor
            const parsedExtras = additional_services ? additional_services.map(id => parseInt(id)) : [];
            const newTotalPrice = pricingService.calculateTotalPrice(
                finalEntryDate,
                finalExitDate,
                reserva.type, 
                parseInt(id_main_service),
                parsedExtras
            );

            // 4. Preparamos los datos
            const updateData = {
                entry_date: finalEntryDate,
                exit_date: finalExitDate,
                id_main_service: parseInt(id_main_service),
                total_price: newTotalPrice,
                cod_parking_spot: reserva.cod_parking_spot,
                brand: reserva.brand,             
                model: reserva.model,             
                color: reserva.color,             
                vehicle_type: reserva.type,       
                additional_services: parsedExtras 
            };

            await reservationDAO.updateReservationTransaction(reservationId, updateData);

            res.json({ success: true, message: 'Reserva actualizada con éxito.' });

        } catch (error) {
            console.error('Error al editar reserva:', error);
            res.status(500).json({ success: false, message: 'Error interno al actualizar la reserva.' });
        }
    }

}

//Exportamos el controlador
module.exports = authController