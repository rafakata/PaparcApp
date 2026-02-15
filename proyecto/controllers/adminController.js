/**
 *  Desde este ccontrolador vamos a manejar toda la lógica relacionada con el panel de administración.
 *  Aquí se manejarán las rutas y la lógica para el dashboard.
*/

const reservationDAO = require('../models/reservation-dao');
const serviceCatalogDAO = require('../models/service-catalog-dao');

const adminController = {

    getDashboard: async (req, res) => {
        console.log('Accediendo al panel de administración por el usuario:', req.session.user.email);
        res.render('dashboard', { title: 'Dashboard' });
    },

    getParking: (req, res) => {
        console.log('Accediendo al parking en tiempo real por el usuario:', req.session.user.email);
        res.render('dashboard_parking', { title: 'Parking en Tiempo Real' });
    },

    getReservationInfo: async (req, res) => {

        try {

            const { id } = req.params;

            const reservation = await reservationDAO.getInfoReservationByIdReservation(id);

            if (!reservation) return res.redirect('admin/dashboard');

            const [vehicleTypes, mainServices, additionalServices] = await Promise.all([
                serviceCatalogDAO.getVehicleTypes(),
                serviceCatalogDAO.getMainServices(),
                serviceCatalogDAO.getAllAdditionalServices()
            ]);
            
            res.render('reservation-details', {
                title : `Gestión Reserva #${id}`,
                reservation : reservation ,
                vehicleTypes : vehicleTypes,
                mainServices : mainServices,
                additionalServices : additionalServices
            });

        } catch (error) {

            console.error('Error al obtener la información de la reserva:', error);
            res.status(500).send('Error al obtener la información de la reserva');
        }
    }

}

module.exports = adminController;