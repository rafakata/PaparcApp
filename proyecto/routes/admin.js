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

/* GET booking page (formulario para crear nueva reserva desde el dashboard) */
router.get('/dashboard/dashboard_booking', adminController.getNewReservationForm);

/* GET reservation details page */  
router.get('/reservations/details/:id', adminController.getReservationInfo);

/* GET history page */
router.get('/history', adminController.getHistory);

/* POST /reservations/:id/edit */
router.post('/reservations/:id/edit', adminController.updateReservation);

/* POST /reservations/new */
router.post('/reservations/new', adminController.createNewReservation);

/* PATCH /reservations/:id/cancel (soft delete) */
router.patch('/reservations/:id/cancel', adminController.cancelReservation);

module.exports = router;         