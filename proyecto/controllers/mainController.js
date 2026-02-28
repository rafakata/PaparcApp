/**
 * Desde aquí se pueden controlar las rutas principales de la aplicación.
 * Aquí se manejarán las rutas y la lógica para la página de inicio, el proceso de reserva, etc. 
*/

const serviceCatalogDAO = require('../models/service-catalog-dao');

const mainController = {

    // GET home page. Renderiza la página de inicio con los servicios principales.
    renderIndex : async (req, res, next) => {

        try {
            
            const mainServices = await serviceCatalogDAO.getMainServices(true); // Solo servicios activos para la web pública
            
            res.render('index', {
                title : 'PaparcApp - Reserva tu parking de forma fácil y rápida',
                mainServices
            });

        } catch (error) {

            console.error('Error al renderizar la página de inicio:', error);
            next(error); // Pasamos el error al manejador de errores global

        }

    },

    // GET price page. Renderiza la página de tarifas con toda la información de servicios y planes.
    renderPricing : async (req, res, next) => {

        try {

            const [ vehicleTypes, mainServices, additionalServices, contractPlans, serviceRates] = await Promise.all([
                serviceCatalogDAO.getVehicleTypes(),
                serviceCatalogDAO.getMainServices(true),
                serviceCatalogDAO.getAllAdditionalServices(true),
                serviceCatalogDAO.getContractPlans(true),
                serviceCatalogDAO.getServiceRates()
            ]);

            res.render('price', {
                title : 'PaparcApp - Tarifas y planes de servicio',
                vehicleTypes,
                mainServices,
                additionalServices,
                contractPlans,
                serviceRates
            });

        } catch (error) {

            console.error('Error al renderizar la página de tarifas:', error);
            next(error);

        }

    },

    // GET service page. Renderiza la página de servicios con toda la información de servicios disponibles.
    renderServices : async (req,res,next) => {
        
        try {

            const mainServices = await serviceCatalogDAO.getMainServices(true); // Solo servicios activos para la web pública

            res.render('service', {
                title : 'PaparcApp - Nuestros servicios de parking',
                mainServices
            });

        } catch (error) {

            console.error('Error al renderizar la página de servicios:', error);
            next(error);

        }
        
    },

    // GET privacy page. Renderiza la página de política de privacidad.
    renderPrivacy : (req,res) => {
        res.render('privacy', { title : 'PaparcApp - Política de privacidad' });
    },

    // GET booking page. Renderiza la página de reserva (frontend)
    renderBooking : async (req, res, next) => {
        
        try {
            // Traemos los catálogos necesarios de la BD (solo los activos para la web pública)
            const [vehicleTypes, mainServices, additionalServices] = await Promise.all([
                serviceCatalogDAO.getVehicleTypes(),
                serviceCatalogDAO.getMainServices(true), 
                serviceCatalogDAO.getAllAdditionalServices(true)
            ]);

            // Pasamos las variables a la vista
            res.render('booking', { 
                title : 'PaparcApp - Reserva tu parking',
                vehicleTypes,
                mainServices,
                additionalServices
            });

        } catch (error) {
            
            console.error('Error al renderizar la página de reservas:', error);
            next(error); // Pasamos el error al manejador global

        }
    }

};

module.exports = mainController;