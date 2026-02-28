/**
 * RUTEADOR DE USUARIOS
 * Su funcion es conectar direcciones URL con las funciones correspondientes en los controladores
*/

var express = require('express')
var router = express.Router()

//1. Importamos el middleware de seguridad.
// Lo usamos para proteger la ruta /profile (solo usuarios logueados)
let { isLoggedIn } = require('../middlewares/auth')

//2. Importamos el controlador de usuarios
// Lo usamos para manejar la lógica de la ruta /profile
const authController = require('../controllers/authController')


/* -- RUTAS PUBLICAS (cualquiera puede entrar) -- */

/*GET  register page: muestra el formulario de registro */
router.get('/register', authController.formRegister);

/*POST register: procesa el formulario de registro */
router.post('/register', authController.register);

/*GET  login page: muestra el formulario de login */
router.get('/login', authController.formLogin);

/*POST login: procesa el formulario de login */
router.post('/login', authController.login); //el enrutador recibe los datos del formulario y los pasa al controlador

/*POST auth/social: procesa login con Google/Facebook via Firebase */
router.post('/auth/social', authController.socialLogin);

/** GET logout: cerramos sesión */
router.get('/logout', authController.logout)

/* -- RUTA PRIVADA (solo usuarios logueados) -- */

/* GET profile page: Muestra el perfil del usuario logueado */
router.get('/profile', isLoggedIn, authController.renderProfile)

/* PUT Actualizar datos del perfil */
router.put('/profile/update', isLoggedIn, authController.updateProfile);

/* PUT Cambiar contraseña */
router.put('/profile/password', isLoggedIn, authController.updatePassword);

/* PUT Cancelar reserva */
router.put('/profile/reservations/:id/cancel', isLoggedIn, authController.cancelReservation);

/* PUT Editar reserva */
router.put('/profile/reservations/:id/edit', isLoggedIn, authController.editReservation);


module.exports = router;