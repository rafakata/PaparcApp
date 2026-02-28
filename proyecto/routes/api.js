/**
 * Ruteador de la API, aqui se definen la direccion de la URL 
 * y el controlador que se encargara de manejar la peticion.
*/

var express = require('express');
var router = express.Router();
const apiController = require('../controllers/apiController');
const { isAdmin } = require('../middlewares/auth');

/* GET API info by date*/
router.get('/reservations', isAdmin, apiController.getReservationsByDate);

/* POST Calculate dynamic price, ruta api pública*/
router.post('/pricing/dynamic', apiController.calculatePriceDynamic);

/* POST Crear reserva desde la web pública (SIN middleware de protección) */
router.post('/reservations/public-new', apiController.createPublicReservation);


module.exports = router;