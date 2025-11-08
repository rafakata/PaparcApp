var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Inicio' });
});

/* GET register page */
router.get('/register', function(req, res, next) {
  res.render('register', { title: 'Registro' });
});

/* GET privacy page */
router.get('/privacy', function(req, res, next) {
  res.render('privacy', { title: 'Privacy' });
});


module.exports = router;
