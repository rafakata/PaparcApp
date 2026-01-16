/**
 * RUTEADOR PARA EL PANEL DE ADMINISTRACIÓN
 */

var express = require('express');
var router = express.Router();
var { isAdmin } = require('../middlewares/auth'); // importar el middleware para verificar si el usuario es admin

router.use(isAdmin); // usar el middleware para proteger todas las rutas de este ruteador

/* GET dashboard page */
router.get('/dashboard', function(req, res, next) {
    console.log('Accediendo al panel de administración por el usuario:', req.session.user.email);
  res.render('dashboard', { title: 'Dashboard' });
});


module.exports = router;         