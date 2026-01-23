/**
 * RUTEADOR PARA AUTENTICACIÓN Y PANEL DEL CLIENTE. (login, registro, perfil del cliente)
*/
var express = require('express');
var router = express.Router(); 
var { isLoggedIn } = require('../middlewares/auth'); // importar el middleware para verificar si el usuario está autenticado
/*const Database = require('../database/database');
const UserDAO = require('../database/users-dao');
const WorkerDAO = require('../database/workers-dao');

const userDAO = new UserDAO(Database.getInstance());
const workerDAO = new WorkerDAO(Database.getInstance());*/

/* GET register page */
router.get('/register', function(req, res, next) {
  res.render('register', { title: 'Registro de usuario' });
});

/* GET login page */
router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Login' });
});

/* POST login */
router.post('/login', function(req, res, next) {
  const { worker,user, password, employee_id} = req.body;
  console.log(`Datos recibidos en /login: worker=${worker}, user=${user},employee_id=${employee_id}`);

  try {

    // login trabajador
    if (worker) {

      const workerData = workerDAO.getWorkerByEmployee_id(employee_id);
      console.log('Datos del trabajador obtenidos de la base de datos:', workerData);

      if (workerData && workerData.password === password) {

        console.log('Autenticación de trabajador exitosa');

        req.session.user = {
          id : workerData.id,
          nombre: workerData.workername,
          role: workerData.role
        }

        return res.redirect('/admin/dashboard');

      }else {
        console.log('Error de autenticación de trabajador: credenciales incorrectas');
        return res.render('login', { title: 'Login', error: 'Credenciales incorrectas para trabajador' });
      }
    }

    // login usuario normal
    if (user) {

      const userData = userDAO.getUserByUsername(user);
      console.log('Datos del usuario obtenidos de la base de datos:', userData);

      if (userData && userData.password === password) {

        console.log('Autenticación de usuario exitosa');

        req.session.user = {
          id : userData.id,
          nombre: userData.username,
          role: 'user'
        };

        return  res.redirect('/users/profile');

      } else {
        console.log('Error de autenticación de usuario: credenciales incorrectas');
        return res.render('login', { title: 'Login', error: 'Credenciales incorrectas para usuario' });
      }
    }

  } catch (error) {
    console.error('Error durante el proceso de login:', error);
    return res.render('login', { title: 'Login', error: 'Error interno del servidor' });
  }

  // Si no se proporcionaron datos de login
  res.render('login', { title: 'Login', error: 'Introduce tus datos' });

});


/* GET profile page */
router.get('/profile',isLoggedIn, function(req, res, next) {
  res.send(`
    <h1>Bienvenido al perfil de ${req.session.user.nombre}</h1>
    <p>Esta es tu área personal.</p>
    <p>Tu rol es: <strong>${req.session.user.role}</strong></p>
    <a href="/users/logout">Cerrar sesión</a>
  `);
});

/* GET logout */
router.get('/logout', function(req, res, next) {
  req.session.destroy();
  res.redirect(`/`);
});

module.exports = router;
