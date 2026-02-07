const axios = require('axios');

const sendEmailConfirmation = async (datosReserva) => {
    try {
        // PEGA AQUÍ LA URL QUE COPIASTE DEL WEBHOOK DE n8n
        const url = 'http://localhost:5678/webhook-test/reserva-confirmada'; 
        await axios.post(url, datosReserva);
        console.log('Datos enviados a n8n con éxito');
    } catch (error) {
        console.error('Error al contactar con n8n:', error);
    }
};

module.exports = { sendEmailConfirmation };