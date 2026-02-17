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



/* -- RUTAS PRIVADAS (solo usuarios logueados) -- */

/*GET profile page: muestra el perfil del usuario logueado MIRAR MAS ADELANTE FUNCIONALIDAD Y LIMPIAR RUTA*/
// usamos getLoggedIn. Si no está logueado, redirige a login
router.get('/profile', isLoggedIn, function(req, res, next) {
  res.render('profile', { 
    title: 'Perfil de Usuario',
    reservaActual: null, //aqui se podria mostrar la reserva actual del usuario, pero por ahora lo dejamos en null
    historial: null //aqui se podria mostrar el historial de reservas del usuario, pero por ahora lo dejamos en null
  })
});


module.exports = router;