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



module.exports = router;
