/**
 * Lógica de Experiencia de Usuario (UX) para la creación de Nueva Reserva
 */
document.addEventListener('DOMContentLoaded', () => {

    // --- 0. LÓGICA DEL BOTÓN GO BACK ---
    document.body.addEventListener('click', function(event) {
        if (event.target.closest('#btn_go_back')) {
            if (window.opener) window.close();
            else window.location.href = '/admin/dashboard';
        }
    });

    const bookingForm = document.querySelector('#createReservationForm');
    const btnSubmit = document.querySelector('#btn_confirm_booking');

    // Elementos del formulario
    const nameInput = document.querySelector('#full_name');
    const plateInput = document.querySelector('#license_plate');
    const phoneInput = document.querySelector('#phone');
    const entryInput = document.querySelector('#calc_entry_date');
    const exitInput = document.querySelector('#calc_exit_date');
    const mainServiceInput = document.querySelector('#calc_main_service');

    // Elementos del resumen
    const sumName = document.querySelector('#sum-nombre');
    const sumPlate = document.querySelector('#sum-matricula');
    const sumEntry = document.querySelector('#sum-entrada');
    const sumExit = document.querySelector('#sum-salida');

    // --- 1. LÓGICA DEL RESUMEN EN VIVO ---
    const updateSummary = () => {

        // Actualizamos texto (si el input está vacío, ponemos un guión '-')
        if (nameInput && sumName) sumName.textContent = nameInput.value || '-';
        if (plateInput && sumPlate) sumPlate.textContent = plateInput.value.toUpperCase() || '-';
        
        // Formateador de fechas
        const formatDateTime = (val) => {
            if (!val) return '-';
            return new Date(val).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' });
        };

        if (entryInput && sumEntry) sumEntry.textContent = formatDateTime(entryInput.value);
        if (exitInput && sumExit) sumExit.textContent = formatDateTime(exitInput.value);
    };

    // Le enchufamos el evento a todos los inputs que tengan la clase 'form-listener'
    document.querySelectorAll('.form-listener').forEach(input => {
        input.addEventListener('input', updateSummary);
        input.addEventListener('change', updateSummary);
    });

    // --- 2. LÓGICA VISUAL DE LOS CHECKBOXES (EXTRAS) ---
    const extraContainer = document.querySelector('#additional_services_container');
    if (extraContainer) {
        extraContainer.addEventListener('change', (event) => {
            if (event.target.matches('.calc_extra_service')) {
                // Alterna la clase 'checked' en el contenedor del checkbox para cambiarle el borde/color
                event.target.closest('.extra-checkbox-card').classList.toggle('checked', event.target.checked);
            }
        });
    }

    // --- 3. FUNCIÓN PARA MOSTRAR ERRORES VISUALES SILENCIOSOS ---
    // Esta función añade la clase 'is-invalid' al input para mostrar el borde rojo, y se la quita automáticamente cuando el usuario vuelve a escribir o cambiar el valor
    const mostrarError = (input) => {
        input.classList.add('is-invalid');
        // Quitamos la clase roja en cuanto el usuario vuelve a escribir ahí
        input.addEventListener('input', () => input.classList.remove('is-invalid'), { once: true });
        input.addEventListener('change', () => input.classList.remove('is-invalid'), { once: true });
    }

    // --- 4 Interceptar el envío del formulario para mostrar un mensaje de confirmación ---
    if (bookingForm) {
        bookingForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid')); // Limpiamos errores anteriores

            //validaciones visuales de los campos minimos antes de enviar la solicitud
            let errores = false;
            if (!phoneInput || !phoneInput.value.trim()) { mostrarError(phoneInput); errores = true; }
            if (!plateInput || !plateInput.value.trim()) { mostrarError(plateInput); errores = true; }
            if (!entryInput || !entryInput.value) { mostrarError(entryInput); errores = true; }
            if (!mainServiceInput || !mainServiceInput.value) { mostrarError(mainServiceInput); errores = true; }

            // Validación lógica de fechas: la fecha de entrada debe ser anterior a la fecha de salida
            if (exitInput && exitInput.value && entryInput.value) {
                if (new Date(entryInput.value) >= new Date(exitInput.value)) {
                    mostrarError(exitInput);
                    errores = true;
                }
            }

            if (errores) return; // Si hay errores, no enviamos la solicitud

            // bloqueamos el botón y mostramos un spinner para indicar que se está procesando UX
            btnSubmit.disabled = true;
            btnSubmit.textContent = ' Processing...';

            const spinner = document.createElement('span');
            spinner.className = 'spinner-border spinner-border-sm me-2';
            btnSubmit.prepend(spinner);

            // envio de datos con fetch
            try {

                const formData = new FormData(this);
                const data = Object.fromEntries(formData.entries());

                data.additional_services = formData.getAll('additional_services'); // Para los checkboxes múltiples

                const response = await fetch(this.action, {
                    method: this.method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();
                
                if (response.status === 201 && result.success) {

                    Swal.fire({
                        title : result.message || 'Booking created successfully',
                        icon : 'success',
                        html : `
                            <div class="text-start bg-light p-3 rounded mt-3 border">
                                <p class="mb-2 fw-bold">Ticket ID: #${result.data.id_reservation}</p>
                                <p class="mb-2"><b>Customer:</b> ${result.data.customer_name}</p>
                                <p class="mb-2"><b>License Plate:</b> <span class="badge bg-secondary font-monospace fs-6">${result.data.license_plate}</span></p>
                                <p class="mb-2"><b>Entry:</b> ${result.data.entry_date}</p>
                                <hr class="my-2">
                                <p class="mb-0 fs-5 text-success"><b>Total:</b> ${result.data.total_price} €</p>
                            </div>
                        `,
                        confirmButtonText: '<i class="bi bi-box-arrow-up-right me-1"></i> Go to booking',
                        showCancelButton: true,
                        cancelButtonText: 'New booking',
                        confirmButtonColor: '#198754',
                        cancelButtonColor: '#6c757d',
                        allowOutsideClick: false

                    }) .then ((sweetResult) => {
                        
                        // En cualquier caso, si hay una pestaña padre, la actualizamos para que refleje la nueva reserva
                        if (window.opener) {
                            window.opener.location.reload();
                        }

                        if (sweetResult.isConfirmed) {
                            // Abrir los detalles en una pestaña nueva
                            window.open(`/admin/reservations/details/${result.data.id_reservation}`, '_blank', 'opener');
                            // Limpiar el formulario actual para seguir trabajando
                            window.location.reload();
                        } else if (sweetResult.dismiss === Swal.DismissReason.cancel) {
                            // Solo limpiar el formulario para crear otra
                            window.location.reload();
                        }
                    })

                } else {

                    Swal.fire({
                        title: 'Attention',
                        text: result.message || 'Error processing the booking.',
                        icon: 'warning',
                        confirmButtonColor: '#f39c12'
                    });

                } 

            } catch (error) {

                console.error('Error en la solicitud:', error);
                Swal.fire({
                    title: 'Error',
                    text: 'An error occurred while processing the booking. Please try again.',
                    icon: 'error',
                    confirmButtonColor: '#e74c3c'
                });

            } finally {

                btnSubmit.disabled = false;
                btnSubmit.textContent = ' Confirm Booking';

                const icon = document.createElement('i');
                icon.className = 'bi bi-check-circle-fill me-1';
                btnSubmit.prepend(icon);
                
            }
        })
    }

});