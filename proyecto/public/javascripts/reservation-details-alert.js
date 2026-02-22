/**
 * Aqui vamos a gestionar las alertas de reservation-details.ejs.
*/

document.addEventListener('DOMContentLoaded', () => {

    // delegacion de eventos para los cliks de la pagina
    document.body.addEventListener('click', function(event) {

        // boton descartar cambios
        if (event.target.closest('#btn_cancel_changes')) {

            if (window.opener) window.close();
            else window.location.href = '/admin/dashboard';
        }
    });

    // delegacion de eventos para el cambio visual de los checkboxes
    const extraContainer = document.querySelector('#additional_services_container');
    if (extraContainer) {
        extraContainer.addEventListener('change' , (event) => {
            if (event.target.matches('.calc_extra_service')) {
                event.target.closest('.extra-checkbox-card').classList.toggle('checked', event.target.checked);
            }
        });
    }

    // comprobar url y lanzar la alerta usando la utilidad global de flash-alert.js
    const urlParams = new URLSearchParams(window.location.search); // obtenemos los parametros de la url
    if (urlParams.has('updated')) {

        showInteractiveAlert(
            'success',
            '¡Reserva actualizada con éxito!',
            'Los cambios se han guardado correctamente.',
            'Volver al panel'
        ) .then ((result) => {
            if (result.isConfirmed) {
                if (window.opener) {
                    window.opener.location.reload(); // recarga la pagina del padre para mostrar los cambios
                    window.close(); // cierra la ventana actual
                } else {
                    window.location.href = '/admin/dashboard'; // redirige al dashboard si no hay ventana padre
                }
            }
        });

        // Limpiar los parámetros de la URL para evitar que la alerta se muestre nuevamente al recargar
        window.history.replaceState({}, document.title, window.location.pathname);
    }

})