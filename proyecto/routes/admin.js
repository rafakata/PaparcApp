/**
 * RUTEADOR PARA EL PANEL DE ADMINISTRACIÓN
 */

var express = require('express');
var router = express.Router();
const adminController = require('../controllers/adminController');
var { isAdmin } = require('../middlewares/auth'); // importar el middleware para verificar si el usuario es admin

router.use(isAdmin); // usar el middleware para proteger todas las rutas de este ruteador

/* GET dashboard page */
router.get('/dashboard', adminController.getDashboard);

/* GET booking page (dentro del panel dashboard) LIMPIAR RUTA MAS ADELANTE CUANDO TOQUE*/
router.get('/dashboard/dashboard_booking', function(req, res) {
  res.render('dashboard_booking', { title: 'Nueva Reserva' });
});

/* GET parking real-time page MIRAR MAS ADELANTE ESTA FUNCIONALIDAD*/
router.get('/dashboard/parking', adminController.getParking);

/* GET reservation details page */  
router.get('/reservations/details/:id', adminController.getReservationInfo);

/* POST /reservations/:id/edit */
router.post('/reservations/:id/edit', adminController.updateReservation);

module.exports = router;         