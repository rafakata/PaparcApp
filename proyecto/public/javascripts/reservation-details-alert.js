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

        // boton cancelar reserva (soft delete, cambia el estado a 'CANCELADA')
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

        // botón para recepcionar vehículo (cambia el estado a 'EN CURSO')
        const btnStart = event.target.closest('#btn_start_reservation');
        if (btnStart) {
            const reservationId = btnStart.getAttribute('data-id');
            const photoCount = parseInt(btnStart.getAttribute('data-photos'));

            // REGLA DE NEGOCIO: Mínimo 5 fotos
            if (photoCount < 5) {
                showInteractiveAlert(
                    'error',
                    'Faltan Evidencias',
                    `Necesitas subir al menos 5 fotos del vehículo antes de recepcionarlo. Actualmente hay ${photoCount}.`,
                    'Entendido'
                );
                return; // Cortamos la ejecución aquí
            }

            Swal.fire({
                title: 'Va a recepcionar esta reserva',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#198754',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Sí, recepcionar',
                cancelButtonText: 'Cancelar'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    // Aquí iría el fetch a /admin/reservations/:id/start
                    // Te lo prepararé en el siguiente paso cuando configuremos el backend
                    console.log('Haciendo fetch para Iniciar...');
                }
            });
        }

        // botón para finalizar reserva (cambia el estado a 'FINALIZADA') + confirmación de pago
        const btnFinalize = event.target.closest('#btn_finalize_reservation');
        if (btnFinalize) {
            const reservationId = btnFinalize.getAttribute('data-id');

            // REGLA DE NEGOCIO: Cobrar antes de salir
            // En lugar de una simple alerta, lanzamos un modal interactivo para cobrar
            Swal.fire({
                title: 'Finalizar Estancia',
                html: `
                    <p class="text-muted mb-3">Confirma el método de pago para dar salida al vehículo.</p>
                    <select id="swal-payment-method" class="form-select form-select-lg mb-3">
                        <option value="" disabled selected>Selecciona método de pago...</option>
                        <option value="TARJETA">Tarjeta de Crédito/Débito</option>
                        <option value="EFECTIVO">Efectivo</option>
                    </select>
                `,
                icon: 'info',
                showCancelButton: true,
                confirmButtonColor: '#0d6efd',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Confirmar Pago y Salida',
                cancelButtonText: 'Cancelar',
                preConfirm: () => {
                    const method = document.querySelector('#swal-payment-method').value;
                    if (!method) {
                        Swal.showValidationMessage('Debes seleccionar un método de pago');
                    }
                    return { paymentMethod: method };
                }
            }).then(async (result) => {
                if (result.isConfirmed) {
                    const paymentMethod = result.value.paymentMethod;
                    // Aquí iría el fetch a /admin/reservations/:id/finalize
                    // Enviando { payment_method: paymentMethod, is_paid: true }
                    console.log('Haciendo fetch para Finalizar con método:', paymentMethod);
                }
            });
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