/**
 * RUTEADOR PARA EL PANEL DE ADMINISTRACIÓN
 */

var express = require('express');
var router = express.Router();
var { isAdmin } = require('../middlewares/auth'); // importar el middleware para verificar si el usuario es admin
var reservationDAO = require('../models/reservation-dao'); // importar el DAO de reservas

router.use(isAdmin); // usar el middleware para proteger todas las rutas de este ruteador

/* GET dashboard page */
router.get('/dashboard', async function(req, res, next) {
    console.log('Accediendo al panel de administración por el usuario:', req.session.user.email);
    
    try {
        // Obtener datos dinámicos desde la base de datos
        const upcomingReservations = await reservationDAO.getUpcomingReservations();
        const completedReservations = await reservationDAO.getCompletedReservations();
        const parkingStats = await reservationDAO.getParkingStats();

        res.render('dashboard', { 
            title: 'Dashboard',
            upcomingReservations,
            completedReservations,
            parkingStats
        });
    } catch (error) {
        console.error('Error al cargar el dashboard:', error);
        // Si hay error, renderizar con datos vacíos
        res.render('dashboard', { 
            title: 'Dashboard',
            upcomingReservations: [],
            completedReservations: [],
            parkingStats: { total: 0, available: 0, occupied: 0, reserved: 0 }
        });
    }
});

/* POST cancelar reserva */
router.post('/cancel-reservation/:id', async function(req, res, next) {
    try {
        const reservationId = req.params.id;
        await reservationDAO.cancelReservation(reservationId);
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error('Error al cancelar reserva:', error);
        res.redirect('/admin/dashboard');
    }
});


module.exports = router;         