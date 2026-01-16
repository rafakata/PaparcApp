/** Código que se ejecutara en cada solicitud HTTP, es decir:
 * preparo datos globales que luego podre usar en las distintas vistas EJS
 * res.locals es un objeto que express a añade a res en cada solicitud, la vida útil es de una única solicitud,
 * por eso se ejecuta cada vez que llega una solicitud, para validar la variables globales que necesitamos
*/

// MIDDLEWARE PARA AÑADIR INFORMACIÓN DE AUTENTICACIÓN A res.locals
const authLocalsMiddleware = (req, res, next) => {

    if (req.session.user) {
        // Si el usuario está autenticado, establecemos las variables en res.locals
        res.locals.isLoggedIn = true;
        res.locals.user = req.session.user;
        res.locals.isAdmin = req.session.user.role === 'admin'; // Ejemplo adicional: verificar si el usuario es admin

    } else {
        // Si no está autenticado, establecemos las variables en consecuencia
        res.locals.isLoggedIn = false;
        res.locals.user = null;
        res.locals.isAdmin = false;
    }

    next(); // Pasar al siguiente middleware o ruta
};

// MIDDLEWARE PARA PROTEGER RUTAS QUE REQUIEREN AUTENTICACIÓN (RUTAS PRIVADAS)
const isLoggedIn = (req, res, next) => {

    if (req.session.user) {
        next(); // El usuario está autenticado, continuar
    } else {
        res.redirect('/users/login'); // Redirigir al login si no está autenticado
    }
};

const isAdmin = (req, res, next) => {

    if (req.session.user && req.session.user.role === 'admin') {
        next(); // El usuario es admin, continuar
    } else {
        res.redirect('/'); // Redirigir a la página principal si no es admin
    }
};

module.exports = {
    authLocalsMiddleware,
    isLoggedIn,
    isAdmin
}