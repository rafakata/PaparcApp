var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Inicio' });
});

/* GET register page */
router.get('/register', function(req, res, next) {
  res.render('register', { title: 'Register' });
});

/* GET login page */
router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Login' });
});

/* GET privacy page */
router.get('/privacy', function(req, res, next) {
  res.render('privacy', { title: 'Privacy' });
});

/* GET Services page */
router.get('/service', function(req, res, next) {
  res.render('service', { title: 'Services' });
});


module.exports = router;
