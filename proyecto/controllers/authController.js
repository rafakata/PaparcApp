/**
 * Desde aqui vamos a controlar toda la lógica de autenticación. 
*/

//1. Importamos las dependencias necesarias
const customerDAO = require('../models/customer-dao')
const bcrypt = require('bcrypt')

//2. Creamos la funcion encargada de controlar el login/logout/register
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
    }

}

//5. Exportamos el controlador
module.exports = authController