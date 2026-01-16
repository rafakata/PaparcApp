var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session'); // importar el módulo express-session

var Database = require('./database/database');
var { authLocalsMiddleware } = require('./middlewares/auth'); // importar el middleware de autenticación

const dbPath = path.join(__dirname, 'database', 'paparcapp.db');
Database.getInstance(dbPath);

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');

var app = express();

// VIEW ENGINE SETUP
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// CONFIGURACIÓN DE LA SESIÓN
app.use(session({ // para cada peticón del servidor pasa por este middleware, permitiendo guardar datos en la sesión haciendo uso de req.session
  secret: 'clave_secreta', // reemplazar con una clave en produccion. Frase secreta para firmar la cookie de sesión
  resave: false, // no guardar la sesión si no se ha modificado
  saveUninitialized: true, //para no guardar sesiones vacías
  cookie: {maxAge: 1000*60*60} // duración de la cookie en milisegundos (aquí 1 hora)
}));

// USO DEL MIDDLEWARE DE AUTENTICACIÓN
app.use(authLocalsMiddleware); // usar el middleware para preparar variables globales de autenticación

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/admin', adminRouter);

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

module.exports = app;
