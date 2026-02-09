/**
 * Ruteador de la API, aqui se definen la direccion de la URL 
 * y el controlador que se encargara de manejar la peticion.
*/

var express = require('express');
var router = express.Router();
const apiController = require('../controllers/apiController');
const { isAdmin } = require('../middlewares/auth');

router.use(isAdmin);

/* GET API info by date*/
router.get('/reservations', apiController.getReservationsByDate);





module.exports = router;