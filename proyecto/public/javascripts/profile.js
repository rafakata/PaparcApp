/**
 * Lógica para la vista de Perfil del Cliente
 * Controla modales, pestañas y envío de formularios.
 */

document.addEventListener('DOMContentLoaded', () => {

    //modales para editar datos y cambiar contraseña
    const editModal = document.querySelector('#editModal');
    const btnOpenModal = document.querySelector('#btn-open-edit-modal');
    const btnCloseModal = document.querySelector('#btn-close-edit-modal');
    const btnCancelMods = document.querySelectorAll('.cancel-edit-btn');

    // logica para controlar la apertura y cierre del modal
    const openModal = () => {
        if(editModal) {
            editModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    };

    const closeModal = () => {
        if(editModal) {
            editModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    };

    if (btnOpenModal) btnOpenModal.addEventListener('click', openModal);
    if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
    btnCancelMods.forEach(btn => btn.addEventListener('click', closeModal));

    
    if (editModal) {
        editModal.addEventListener('click', (e) => {
            if (e.target === editModal) closeModal();
        });
    }

    // Cerrar con la tecla Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });


    // lógica para controlar las pestañas dentro del modal
    const tabs = document.querySelectorAll('.modal-tab');
    const forms = {
        'form-datos': document.querySelector('#form-datos'),
        'form-password': document.querySelector('#form-password')
    };

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // 1. Quitar 'active' de todos los tabs y ocultar todos los forms
            tabs.forEach(t => t.classList.remove('active'));
            Object.values(forms).forEach(f => { if(f) f.style.display = 'none'; });

            // 2. Activar el tab clicado y mostrar su form correspondiente
            tab.classList.add('active');
            const targetId = tab.getAttribute('data-target');
            if (forms[targetId]) {
                forms[targetId].style.display = 'flex';
            }
        });
    });

    // --- ENVÍO DE FORMULARIOS ---

    // actrualizar datos del perfil
    const formDatos = document.querySelector('#form-datos');
    if (formDatos) {

        formDatos.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const payload = {
                nombre: document.querySelector('#edit-nombre').value,
                email: document.querySelector('#edit-email').value,
                telefono: document.querySelector('#edit-telefono').value
            };

            try {
                const res = await fetch('/users/profile/update', {
                    method: 'PUT', // PUT, metodo usado para actaulizar recursos existentes
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                
                const data = await res.json();
                
                if (data.success) {

                    document.querySelector('#display-nombre').textContent = payload.nombre;
                    document.querySelector('#display-email').textContent = payload.email;
                    document.querySelector('#display-telefono').textContent = payload.telefono;
                    
                    Swal.fire({ 
                        icon: 'success', 
                        title: '¡Actualizado!', 
                        text: data.message, 
                        timer: 2000, 
                        showConfirmButton: false 
                    });

                    closeModal(); // Cerramos el modal de edición

                } else {

                    Swal.fire({ icon: 'error', title: 'Error', text: data.message });

                }

            } catch (error) {

                Swal.fire({ 
                    icon: 'error', 
                    title: 'Error de conexión', 
                    text: 'Inténtalo de nuevo más tarde.' 
                });
            }

        });
    }

    // actualizar contraseña
    const formPassword = document.querySelector('#form-password');
    if (formPassword) {

        formPassword.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const payload = {
                currentPassword: document.querySelector('#current-password').value,
                newPassword: document.querySelector('#new-password').value,
                confirmPassword: document.querySelector('#confirm-password').value
            };

            try {

                const res = await fetch('/users/profile/password', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                
                const data = await res.json();
                
                if (data.success) {

                    Swal.fire({ icon: 'success', 
                        title: '¡Contraseña cambiada!', 
                        text: data.message, 
                        timer: 2000, 
                        showConfirmButton: false 
                    });

                    formPassword.reset();
                    closeModal(); 

                } else {

                    Swal.fire({ 
                        icon: 'error', 
                        title: 'Error', 
                        text: data.message 
                    });

                }

            } catch (error) {

                Swal.fire({ icon: 'error', 
                    title: 'Error de conexión', 
                    text: 'Inténtalo de nuevo más tarde.' 
                });

            }
        });
    }

    // --- 4. GESTIÓN DE DETALLES Y CANCELACIÓN DE RESERVAS ---
    const detailsModal = document.querySelector('#reservaDetailsModal');
    const btnCloseDetails = document.querySelector('#btn-close-details-modal');
    const clickableReservations = document.querySelectorAll('.reserva-clickable');
    
    // Variables para las acciones
    let currentReservaId = null;
    const btnCancelRes = document.querySelector('#btn-cancel-reservation');
    const btnEditRes = document.querySelector('#btn-edit-reservation');
    const actionContainer = document.querySelector('#detail-actions');

    const closeDetailsModal = () => {
        if(detailsModal) {
            detailsModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    };

    if (btnCloseDetails) btnCloseDetails.addEventListener('click', closeDetailsModal);

    // Al hacer clic en cualquier reserva (activa o historial)
    clickableReservations.forEach(card => {
        card.addEventListener('click', function() {
            // 1. Extraer datos del HTML
            currentReservaId = this.getAttribute('data-id');
            const status = this.getAttribute('data-status');
            
            // 2. Poblar el modal
            document.querySelector('#detail-id').textContent = `ID: #${currentReservaId}`;
            document.querySelector('#detail-entry').textContent = this.getAttribute('data-entry');
            document.querySelector('#detail-exit').textContent = this.getAttribute('data-exit');
            document.querySelector('#detail-service').textContent = this.getAttribute('data-service');
            document.querySelector('#detail-vehicle').textContent = this.getAttribute('data-vehicle');
            document.querySelector('#detail-price').textContent = `${this.getAttribute('data-price')} €`;
            
            const statusBadge = document.querySelector('#detail-status');
            statusBadge.textContent = status;
            statusBadge.className = `badge badge-${status.toLowerCase()}`; // Para heredar los colores CSS

            // 3. Mostrar u ocultar botones de acción
            if (status === 'PENDIENTE') {
                actionContainer.style.display = 'flex';
                btnCancelRes.style.display = 'block';
                btnEditRes.style.display = 'block';
            } else if (status === 'EN CURSO') {
                actionContainer.style.display = 'flex';
                btnCancelRes.style.display = 'none'; // No se puede cancelar
                btnEditRes.style.display = 'block'; // Sí se puede editar
            } else {
                actionContainer.style.display = 'none'; // FINALIZADA o CANCELADA
            }

            // 4. Abrir modal
            detailsModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    // Acción: CANCELAR RESERVA
    if (btnCancelRes) {
        btnCancelRes.addEventListener('click', async () => {

            closeDetailsModal(); // Cerramos el modal de detalles para evitar conflictos con SweetAlert

            const result = await Swal.fire({
                title: '¿Estás seguro?',
                text: "Vas a cancelar esta reserva. Esta acción no se puede deshacer.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#dc3545',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Sí, cancelar reserva'
            });

            if (result.isConfirmed) {
                try {
                    const res = await fetch(`/users/profile/reservations/${currentReservaId}/cancel`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' }
                    });
                    const data = await res.json();
                    
                    if (data.success) {
                        await Swal.fire('Cancelada', data.message, 'success');
                        window.location.reload(); // Aquí sí recargamos para actualizar las listas
                    } else {
                        Swal.fire('Error', data.message, 'error');
                    }
                } catch (error) {
                    Swal.fire('Error', 'Problema de conexión.', 'error');
                }
            }
        });
    }

// --- ACCIÓN: ABRIR MODAL PARA EDITAR RESERVA ---
    const editResModal = document.querySelector('#editReservaModal');
    let currentMainServiceId = null;
    
    const closeEditResModal = () => {
        if(editResModal) editResModal.classList.remove('active');
    };

    if (btnEditRes) {
        btnEditRes.addEventListener('click', () => {
            closeDetailsModal(); // Cerramos el de detalles
            
            // Poblar el modal de edición
            document.querySelector('#edit-res-id').value = currentReservaId;
            
            // Encontrar el elemento de la tarjeta para sacar el data-id-service
            const card = document.querySelector(`.reserva-clickable[data-id="${currentReservaId}"]`);
            if (card) {
                currentMainServiceId = card.getAttribute('data-id-service');
                const selectService = document.querySelector('#edit-res-service');
                if (selectService && currentMainServiceId) {
                    selectService.value = currentMainServiceId;
                }
            }
            
            // Limpiamos los checkboxes adicionales para que el usuario los vuelva a elegir
            document.querySelectorAll('.edit-extra-serv').forEach(cb => cb.checked = false);

            editResModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    // Botones para cerrar el modal de edición
    document.querySelector('#btn-close-edit-reserva-modal')?.addEventListener('click', closeEditResModal);
    document.querySelector('#btn-cancel-edit-res')?.addEventListener('click', closeEditResModal);

    // Evento Submit de la edición
    document.querySelector('#form-edit-reserva')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btnSubmit = e.target.querySelector('button[type="submit"]');
        const originalText = btnSubmit.innerHTML;
        btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
        btnSubmit.disabled = true;

        const id = document.querySelector('#edit-res-id').value;

        // Recogemos todos los nuevos datos seleccionados
        const updateData = {
            entry_date: document.querySelector('#edit-res-entrada').value,
            exit_date: document.querySelector('#edit-res-exit').value,
            id_main_service: document.querySelector('#edit-res-service').value,
            additional_services: Array.from(document.querySelectorAll('.edit-extra-serv:checked')).map(cb => cb.value)
        };

        try {
            const res = await fetch(`/users/profile/reservations/${id}/edit`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            });
            const data = await res.json();
            
            if (data.success) {
                closeEditResModal();
                await Swal.fire({ icon: 'success', title: '¡Actualizada!', text: data.message, timer: 2000, showConfirmButton: false });
                window.location.reload(); // Recargamos para ver las nuevas fechas y precios
            } else {
                Swal.fire('Error', data.message, 'error');
            }
        } catch (error) {
            Swal.fire('Error', 'Problema de conexión.', 'error');
        } finally {
            btnSubmit.innerHTML = originalText;
            btnSubmit.disabled = false;
        }
    });

});