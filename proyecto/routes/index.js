/**
 * RUTEADOR PARA LAS PÁGINAS PRINCIPALES (públicas)
*/
const express = require('express');
const router = express.Router();

const mainController = require('../controllers/mainController');

/* GET home page */
router.get('/', mainController.renderIndex);

/* GET Services page */
router.get('/service', mainController.renderServices);

/* GET privacy page */
router.get('/privacy', mainController.renderPrivacy);

/* GET price page */
router.get('/price', mainController.renderPricing);

/* GET booking page (frontend) */
router.get('/booking', mainController.renderBooking);

module.exports = router;