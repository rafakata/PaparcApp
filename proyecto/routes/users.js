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
router.get('/register', function(req, res, next) {
  res.render('register', { title: 'Registro de Usuario' })
});

/*GET  login page: muestra el formulario de login */
router.get('/login', function(req, res, next) {
  //pasamos error=null para que no muestre error al cargar la página
  res.render('login', { title: 'Login de Usuario', error: null })
});


/*POST login: procesa el formulario de login */
router.post('/login', authController.login); //el enrutador recibe los datos del formulario y los pasa al controlador

/*POST register: procesa el formulario de registro */
router.post('/register', authController.register);

/** GET logout: cerramos sesión */
router.get('/logout', authController.logout, function(req, res, next) {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.redirect('/users/login');
  });
});



/* -- RUTAS PRIVADAS (solo usuarios logueados) -- */

/*GET profile page: muestra el perfil del usuario logueado */
// usamos getLoggedIn. Si no está logueado, redirige a login
router.get('/profile', isLoggedIn, function(req, res, next) {
  res.render('profile', { title: 'Perfil de Usuario'})
});


module.exports = router;