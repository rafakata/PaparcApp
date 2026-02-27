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

        // delegacion de eventos para el boton de eliminar reserva (sof delete), no se elimina de la base de datos solo se cambia su estado
        const btnDelete = event.target.closest('#btn_delete_reservation');
        if (btnDelete) {

            const reservationId = btnDelete.getAttribute('data-id');

            Swal.fire({

                title: '¿Estás seguro de cancelar esta reserva?',
                text: "Esta reservara pasara a estado 'CANCELADA' y no se podrá revertir esta acción.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sí, cancelar reserva',
                cancelButtonText: 'No, mantener reserva'

            }) .then(async (result) => {

                if (result.isConfirmed) {
                    const originalText = btnDelete.textContent;
                    btnDelete.textContent = 'Cancelando...';
                    btnDelete.disabled = true;

                    const spinner = document.createElement('span');
                    spinner.className = 'spinner-border spinner-border-sm me-2';
                    btnDelete.prepend(spinner);

                    try {

                        const response = await fetch(`/admin/reservations/${reservationId}/cancel`, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        });

                        const data = await response.json();

                        if (response.ok && data.success) {

                            showInteractiveAlert(
                                'success',
                                'Reserva cancelada',
                                'La reserva ha sido cancelada exitosamente.',
                                'Volver al panel'

                            ) .then ((alertResult) => {

                                if (alertResult.isConfirmed) {
                                    if (window.opener) {
                                        window.opener.location.reload(); // recarga la pagina del padre para mostrar los cambios
                                        window.close(); // cierra la ventana actual
                                    } else {
                                        window.location.href = '/admin/dashboard'; // redirige al dashboard si no hay ventana padre
                                    }
                                }
                            });

                        } else {
                            showInteractiveAlert(
                                'error',
                                'Error al cancelar reserva',
                                data.message || 'Ocurrió un error al intentar cancelar la reserva. Por favor, inténtalo de nuevo.',
                                'Volver'
                            );
                        }

                    } catch (error) {
                        console.error('Error en la solicitud:', error);
                        showInteractiveAlert(
                            'error',
                            'Error de red',
                            'No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet e inténtalo de nuevo.',
                            'Volver'
                        );

                    } finally {
                        btnDelete.textContent = originalText;
                        btnDelete.disabled = false;
                    }

                } 

            })

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