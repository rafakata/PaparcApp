/**
 * RUTEADOR PARA LAS PÁGINAS PRINCIPALES
*/
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Valet Parking - Index' });
});

/* GET Services page */
router.get('/service', function(req, res, next) {
  res.render('service', { title: 'Our Services' });
});

/* GET privacy page */
router.get('/privacy', function(req, res, next) {
  res.render('privacy', { title: 'Privacy Policy' });
});

// Página de reserva (frontend)
router.get('/booking', function(req, res, next) {
  res.render('booking', { title: 'Parking reservation' });
});



module.exports = router;
