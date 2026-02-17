//app.js configuración principal de nuestro servidor

// 1. Cargar las variables de entorno desde el archivo .env
require('dotenv').config();
console.log("Probando entorno:", process.env.DB_NAME);

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session'); // importar el módulo express-session

// 2. Importamos las rutas existentes
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');
var apiRouter = require('./routes/api');

// importamos el servicio de precios
var PricingService = require('./services/pricingService');

// 3. Midlewares propios
var { authLocalsMiddleware } = require('./middlewares/auth'); // importar el middleware de autenticación

// 4. Crear la aplicación Express. Aquí se configura el servidor
var app = express();

// -- CONFIGURACIÓN DE LAS VISTAS --
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// -- CONFIGURACIÓN DE MIDDLEWARES GLOBALES -- (se ejecutan en cada petición)
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// -- CONFIGURACIÓN DE LA SESIÓN --
/**
 * Por cada peticion la sesión permite guardar datos en el servidor asociados a un usuario concreto.
 * Estos datos se guardan en req.session y persisten entre peticiones.
 * La sesión se identifica mediante una cookie que se envía al cliente (nuestro frontend).
 */
app.use(session({ 
  secret: process.env.SESSION_SECRET || 'clave_secreta', // clave secreta para firmar la cookie de sesión
  resave: false, // no guardar la sesión si no se ha modificado
  saveUninitialized: false, //para no guardar sesiones vacías
  cookie: {
    maxAge: 1000*60*60, // duración de la cookie en milisegundos (aquí 1 hora)
    secure: process.env.NODE_ENV === 'production' // solo true si estamos en producción y usamos HTTPS
  } 
}));

// -- MIDDLEWARES PERSONALIZADOS --
// si el usuario está autenticado, prepara las variables globales para las vistas
app.use(authLocalsMiddleware); 

// -- RUTAS (ENDPOINTS) --
// aqui se definen las rutas de la aplicación, si quiero acceder a /users, se usará usersRouter
// si dentro de users voy al login, la ruta completa será /users/login
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/admin', adminRouter);
app.use('/api', apiRouter);

// -- MANEJO DE ERRORES --

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

PricingService.initCache()
  .then(()=> {
    console.log("Cache de precios inicializada correctamente");
  })
  .catch((err) => {
    console.error("No se pudo cargar la cache de precio");
    console.error(err);
    process.exit(1); // salir del proceso con código de error
  });

module.exports = app;