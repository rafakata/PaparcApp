/**
 * RUTEADOR PARA LAS PÁGINAS PRINCIPALES
*/
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Valet Parking - Inicio' });
});

/* GET Services page */
router.get('/service', function(req, res, next) {
  res.render('service', { title: 'Nuestros Servicios' });
});

/* GET privacy page */
router.get('/privacy', function(req, res, next) {
  res.render('privacy', { title: 'Política de Privacidad' });
});

/* !! Comentario de Satori: !!
He ayadido nuevas rutas para las páginas de dashboard, register y login que se se habían borrado
*/

/* GET dashboard page */
router.get('/dashboard', function(req, res, next) {
  res.render('dashboard', { title: 'Dashboard' });
});

/* GET register page */
router.get('/register', function(req, res, next) {
  res.render('register', { title: 'Register' });
});

/* GET login page */
router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Login' });
});



module.exports = router;
