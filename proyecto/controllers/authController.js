/**
 * Desde aqui vamos a controlar toda la lógica de autenticación. 
*/

//1. Importamos las dependencias necesarias
const customerDAO = require('../models/customer-dao')
const bcrypt = require('bcrypt')

//2. Creamos la funcion encargada de controlar el login/logout/register
const authController = {

    // Login
    login: async(req,res) => {
        
        // extraemo email, password y el tipo de formulario que se usó
        const { email, password, loginType } = req.body
        console.log(`Intento de login con email: ${email}, tipo de login: ${loginType}`)

        try {

            //buscamos el mail en la base de datos
            const user = await customerDAO.getCustomerByEmail(email);

            // verificamos que el usuario exista, si no existe mostramos un error
            if (!user) return res.render('login', { error: 'Usuario no encontrado' })

            // verificamos la constraseña, si no coincide mostramos un error
            const passwordMatch = await bcrypt.compare(password, user.password_hash)
            if (!passwordMatch) return res.render('login', { error: 'Contraseña incorrecta' })

            // ----- LÓGICA PARA SIMULACIÓN DE DOBLE ACCESO -----------------

            //Caso: Si el loginType es 'worker'. Recordar que el login type viene dado por el campo hidden del formulario
            if (loginType === 'worker') {

                if (user.type !== 'ADMIN') {

                    console.warn(`Cliente ${user.full_name} intentó acceder desde acceso de empleados.`)
                    return res.render('login', { error: 'Acceso denegado. No tienes permisos para acceder como empleado.' })

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
            console.error(error)
            res.render('login', { error: 'Error en el servidor. Inténtalo de nuevo más tarde.' })
        }

    },

    // Logout
    logout: (req, res) => {

        // Destruimos la sesión del usuario
        req.session.destroy()
        res.redirect('/')

    },

    // Register
    register: async (req, res) => {

        const { username, email, password, confirm_password } = req.body

        try {

            // Verificamos que las contraseñas coincidan
            if (password !== confirm_password) {
                return  res.render('register', { error: 'Las contraseñas no coinciden' })
            }

            // encriptamos la contraseña
            const saltRounds = 10 // número de rondas de salting, tiempo de procesamiento 10 = 100ms = 0.1s aprox. que tarda en hashear
            const password_hash = await bcrypt.hash(password, saltRounds)

            // Creamos el nuevo usuario en la base de datos
            const newUserId = await customerDAO.createCustomer({
                nombre: username,
                email: email,
                passwordHash: password_hash
            })

            console.log(`Nuevo usuario registrado con ID: ${newUserId}`)

            // Redirigimos al usuario a la página de login tras el registro
            res.redirect('/users/login')

        } catch (error) {

            console.error('Error al registrar el usuario:', error)

            res.render('register', { error: error.message})

        }
    }

}

//5. Exportamos el controlador
module.exports = authController