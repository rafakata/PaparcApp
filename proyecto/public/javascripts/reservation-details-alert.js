/**
 * Aqui vamos a gestionar las alertas de reservation-details.ejs.
*/

document.addEventListener('DOMContentLoaded', () => {

    // delegacion de eventos para los cliks de la pagina
    document.body.addEventListener('click', async function(event) {

        // boton volver atras (cierra la ventana actual y recarga el padre para mostrar los cambios)
        if (event.target.closest('#btn_go_back')) {

            if (window.opener) window.close();
            else window.location.href = '/admin/dashboard';
        }

        // boton cancelar reserva (soft delete, cambia el estado a 'CANCELADA')
        const btnDelete = event.target.closest('#btn_delete_reservation');
        if (btnDelete) {

            const reservationId = btnDelete.getAttribute('data-id');

            Swal.fire({
                title: 'Are you sure you want to cancel this booking?',
                text: "This booking will be set to 'CANCELLED' and this action cannot be undone.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, cancel booking',
                cancelButtonText: 'No, keep booking'
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
                                'Booking cancelled',
                                'The booking has been successfully cancelled.',
                                'Back to dashboard'
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
                                'Error cancelling booking',
                                data.message || 'An error occurred while trying to cancel the booking. Please try again.',
                                'Back'
                            );
                        }

                    } catch (error) {
                        console.error('Error en la solicitud:', error);
                        showInteractiveAlert(
                            'error',
                            'Network error',
                            'Could not connect to the server. Please check your internet connection and try again.',
                            'Back'
                        );

                    } finally {
                        btnDelete.textContent = originalText;
                        btnDelete.disabled = false;
                    }

                } 

            })

        }

        // boton para subir fotos de las reservas
        const btnUploadPhoto = event.target.closest('#btn_upload_photo');
        if (btnUploadPhoto) {

            const reservationId = btnUploadPhoto.getAttribute('data-id');
            const inputUrl = document.querySelector('#photo_url_input');
            const inputDescription = document.querySelector('#photo_desc_input');

            const fileUrl = inputUrl.value.trim();
            const fileDesc = inputDescription ? inputDescription.value.trim() : ''; // Extraemos el texto 

            if (!fileUrl) {
                showInteractiveAlert(
                    'error',
                    'Empty URL',
                    'Please enter the URL of the photo you want to upload.',
                    'OK'
                );
                return;
            }

            const originalNodes = Array.from(btnUploadPhoto.childNodes); // guardamos los nodos originales para restaurarlos luego
            btnUploadPhoto.textContent = 'Uploading...';
            btnUploadPhoto.disabled = true;

            const spinner = document.createElement('span');
            spinner.className = 'spinner-border spinner-border-sm me-2';
            btnUploadPhoto.appendChild(spinner);

            try {

                const response = await fetch(`/admin/reservations/${reservationId}/photos`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ file_path: fileUrl, description: fileDesc })
                });

                const data = await response.json();

                if (response.ok && data.success) {

                    window.location.reload(); // recarga la pagina para mostrar la nueva foto

                } else {

                    showInteractiveAlert(
                        'error',
                        'Error uploading photo',
                        data.message || 'An error occurred while trying to upload the photo. Please try again.',
                        'Back'
                    );

                    btnUploadPhoto.textContent = '';
                    originalNodes.forEach(node => btnUploadPhoto.appendChild(node)); // restauramos los nodos originales
                    btnUploadPhoto.disabled = false;
                }

            } catch (error) {

                console.error('Error al subir foto:', error);
                showInteractiveAlert(
                    'error',
                    'Network error',
                    'Could not connect to the server. Please check your internet connection and try again.',
                    'Back'
                );

                btnUploadPhoto.textContent = '';
                originalNodes.forEach(node => btnUploadPhoto.appendChild(node)); // restauramos los nodos originales
                btnUploadPhoto.disabled = false;
            }

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
                    'Missing evidence',
                    `You need to upload at least 5 photos of the vehicle before checking it in. Currently there are ${photoCount}.`,
                    'OK'
                );
                return; // Cortamos la ejecución aquí
            }

            Swal.fire({
                title: 'You are about to check in this booking',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#198754',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Yes, check in',
                cancelButtonText: 'Cancel'
            }).then(async (result) => {

                if (result.isConfirmed) {
                    
                    const originalText = btnStart.textContent;
                    btnStart.textContent = 'Processing...';
                    btnStart.disabled = true;

                    try {

                        const response = await fetch(`/admin/reservations/${reservationId}/start`, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        });

                        const data = await response.json();

                        if (response.ok && data.success) {

                            showInteractiveAlert(
                                'success',
                                'Vehicle checked in',
                                'The booking status has changed to "IN PROGRESS".',
                                'Continue'
                            ) .then (() =>  window.location.reload());

                        } else {

                            showInteractiveAlert(
                                'error',
                                'Error checking in',
                                data.message || 'An error occurred while trying to check in the booking. Please try again.',
                                'Back'
                            );
                        }

                    } catch (error) {
                        console.error('Error en la solicitud:', error);
                        showInteractiveAlert(
                            'error',
                            'Network error',
                            'Could not connect to the server. Please check your internet connection and try again.',
                            'Back'
                        );

                    } finally {
                        btnStart.textContent = originalText;
                        btnStart.disabled = false;
                    }
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
                title: 'Finalize Stay',
                html: `
                    <p class="text-muted mb-3">Confirm the payment method to check out the vehicle.</p>
                    <select id="swal-payment-method" class="form-select form-select-lg mb-3">
                        <option value="" disabled selected>Select payment method...</option>
                        <option value="TARJETA">Credit/Debit Card</option>
                        <option value="EFECTIVO">Cash</option>
                    </select>
                `,
                icon: 'info',
                showCancelButton: true,
                confirmButtonColor: '#0d6efd',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Confirm Payment and Checkout',
                cancelButtonText: 'Cancel',
                preConfirm: () => {
                    const method = document.querySelector('#swal-payment-method').value;
                    if (!method) {
                        Swal.showValidationMessage('You must select a payment method');
                    }
                    return { paymentMethod: method };
                }
            }).then(async (result) => {

                if (result.isConfirmed) {

                    const paymentMethod = result.value.paymentMethod;
                    const originalText = btnFinalize.textContent;
                    btnFinalize.textContent = 'Finalizing...';
                    btnFinalize.disabled = true;

                    try {

                        const response = await fetch(`/admin/reservations/${reservationId}/finalize`, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ paymentMethod })
                        });

                        const data = await response.json();

                        if (response.ok && data.success) {

                            showInteractiveAlert(
                                'success',
                                'Booking finalized',
                                `The booking has been successfully finalized. Payment method: ${paymentMethod}.`,
                                'Back to dashboard'
                            ) .then (() =>  window.location.reload());

                        } else {

                            showInteractiveAlert(
                                'error',
                                'Error finalizing',
                                data.message || 'An error occurred while trying to finalize the booking. Please try again.',
                                'Back'
                            );
                        }

                    } catch (error) {

                        console.error('Error en la solicitud:', error);
                        showInteractiveAlert(
                            'error',
                            'Network error',
                            'Could not connect to the server. Please check your internet connection and try again.',
                            'Back'
                        );

                    } finally {
                        btnFinalize.textContent = originalText;
                        btnFinalize.disabled = false;
                    }
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
            'Booking successfully updated!',
            'The changes have been saved successfully.',
            'OK'
        ) .then ((result) => {
            if (result.isConfirmed) {
                if (window.opener) {
                    window.opener.location.reload(); // recarga la pagina del padre para mostrar los cambios
                }
            }
        });

        // Limpiar los parámetros de la URL para evitar que la alerta se muestre nuevamente al recargar
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (urlParams.has('error')) {
        const errorMessage = urlParams.get('error');
        
        showInteractiveAlert(
            'error',
            'Could not save changes',
            errorMessage,
            'Review'
        );

        // Limpiamos la URL para que la alerta no vuelva a saltar si el usuario recarga la página
        window.history.replaceState({}, document.title, window.location.pathname);
    }

})