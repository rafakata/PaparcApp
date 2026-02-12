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

/* GET booking page (dentro del panel dashboard) */
router.get('/dashboard/dashboard_booking', function(req, res) {
  res.render('dashboard_booking', { title: 'Nueva Reserva' });
});

/* GET reservation details page */  
router.get('/reservations/details/:id', adminController.getReservationInfo);

module.exports = router;         