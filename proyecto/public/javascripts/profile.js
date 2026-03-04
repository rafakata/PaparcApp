/**
 * Lógica para la vista de Perfil del Cliente
 * Controla modales, pestañas, visualización de reservas y actualizaciones (Fetch).
 */

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================================
    // 1. CONTROL DEL MODAL DE EDICIÓN DE PERFIL (DATOS/CONTRASEÑA)
    // ==========================================================
    const editModal = document.querySelector('#editModal');
    const btnOpenModal = document.querySelector('#btn-open-edit-modal');
    const btnCloseModal = document.querySelector('#btn-close-edit-modal');
    const btnCancelMods = document.querySelectorAll('.cancel-edit-btn');

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

    // Cerrar al hacer clic en el fondo o Escape
    if (editModal) {
        editModal.addEventListener('click', (e) => {
            if (e.target === editModal) closeModal();
        });
    }

    // Tabs del perfil
    const tabs = document.querySelectorAll('.modal-tab');
    const forms = {
        'form-datos': document.querySelector('#form-datos'),
        'form-password': document.querySelector('#form-password')
    };

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            Object.values(forms).forEach(f => { if(f) f.style.display = 'none'; });

            tab.classList.add('active');
            const targetId = tab.getAttribute('data-target');
            if (forms[targetId]) forms[targetId].style.display = 'flex';
        });
    });

    // Enviar formulario de Datos Personales
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
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                
                if (data.success) {
                    // Actualizamos DOM sin recargar
                    document.querySelector('#display-nombre').textContent = payload.nombre;
                    document.querySelector('#display-email').textContent = payload.email;
                    document.querySelector('#display-telefono').textContent = payload.telefono;
                    
                    Swal.fire({ icon: 'success', title: 'Updated!', text: data.message, timer: 2000, showConfirmButton: false });
                    closeModal(); 
                } else {
                    Swal.fire({ icon: 'error', title: 'Error', text: data.message });
                }
            } catch (error) {
                Swal.fire({ icon: 'error', title: 'Connection error', text: 'Please try again later.' });
            }
        });
    }

    // Enviar formulario de Contraseña
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
                    Swal.fire({ icon: 'success', title: 'Password changed!', text: data.message, timer: 2000, showConfirmButton: false });
                    formPassword.reset(); 
                    closeModal(); 
                } else {
                    Swal.fire({ icon: 'error', title: 'Error', text: data.message });
                }
            } catch (error) {
                Swal.fire({ icon: 'error', title: 'Connection error', text: 'Please try again later.' });
            }
        });
    }

    // ==========================================================
    // 2. GESTIÓN DE DETALLES Y CANCELACIÓN DE RESERVAS
    // ==========================================================
    const detailsModal = document.querySelector('#reservaDetailsModal');
    const btnCloseDetails = document.querySelector('#btn-close-details-modal');
    const clickableReservations = document.querySelectorAll('.reserva-clickable');
    
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

    // Abrir detalles de cualquier reserva
    clickableReservations.forEach(card => {
        card.addEventListener('click', function() {
            currentReservaId = this.getAttribute('data-id');
            const status = this.getAttribute('data-status');
            
            // Poblar el modal
            document.querySelector('#detail-id').textContent = `ID: #${currentReservaId}`;
            document.querySelector('#detail-entry').textContent = this.getAttribute('data-entry');
            document.querySelector('#detail-exit').textContent = this.getAttribute('data-exit');
            document.querySelector('#detail-service').textContent = this.getAttribute('data-service');
            document.querySelector('#detail-vehicle').textContent = this.getAttribute('data-vehicle');
            document.querySelector('#detail-price').textContent = `${this.getAttribute('data-price')} €`;
            
            const statusBadge = document.querySelector('#detail-status');
            statusBadge.textContent = status;
            statusBadge.className = `badge badge-${status.toLowerCase()}`; 

            // Lógica de botones
            if (status === 'PENDIENTE') {
                actionContainer.style.display = 'flex';
                btnCancelRes.style.display = 'block';
                btnEditRes.style.display = 'block';
            } else if (status === 'EN CURSO') {
                actionContainer.style.display = 'flex';
                btnCancelRes.style.display = 'none';
                btnEditRes.style.display = 'block';
            } else {
                actionContainer.style.display = 'none';
            }

            detailsModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    // Acción: CANCELAR RESERVA
    if (btnCancelRes) {
        btnCancelRes.addEventListener('click', async () => {
            closeDetailsModal(); // Cerramos modal para evitar problemas de z-index

            const result = await Swal.fire({
                title: 'Are you sure?',
                text: "You are about to cancel this booking. This action cannot be undone.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#dc3545',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Yes, cancel booking'
            });

            if (result.isConfirmed) {
                try {
                    const res = await fetch(`/users/profile/reservations/${currentReservaId}/cancel`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' }
                    });
                    const data = await res.json();
                    
                    if (data.success) {
                        await Swal.fire('Cancelled', data.message, 'success');
                        window.location.reload(); 
                    } else {
                        Swal.fire('Error', data.message, 'error');
                    }
                } catch (error) {
                    Swal.fire('Error', 'Connection problem.', 'error');
                }
            }
        });
    }

    // ==========================================================
    // 3. EDICIÓN COMPLETA DE RESERVAS
    // ==========================================================
    const editResModal = document.querySelector('#editReservaModal');
    
    const closeEditResModal = () => {
        if(editResModal) {
            editResModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    };

    document.querySelector('#btn-close-edit-reserva-modal')?.addEventListener('click', closeEditResModal);
    document.querySelector('#btn-cancel-edit-res')?.addEventListener('click', closeEditResModal);

    // Abrir modal de edición
    if (btnEditRes) {
        btnEditRes.addEventListener('click', () => {
            closeDetailsModal(); // Cerramos el de detalles
            
            const card = document.querySelector(`.reserva-clickable[data-id="${currentReservaId}"]`);
            if (!card) return;

            // Extraer datos
            const status = card.getAttribute('data-status');
            const entryIso = card.getAttribute('data-entry-iso');
            const exitIso = card.getAttribute('data-exit-iso');
            const extras = JSON.parse(card.getAttribute('data-extras') || '[]');
            const mainServiceId = card.getAttribute('data-id-service');

            // Setear ID
            document.querySelector('#edit-res-id').value = currentReservaId;
            
            // Setear Servicio Principal
            const selectService = document.querySelector('#edit-res-service');
            if (selectService && mainServiceId) selectService.value = mainServiceId;

            // Setear Extras
            document.querySelectorAll('.edit-extra-serv').forEach(cb => {
                cb.checked = extras.includes(parseInt(cb.value));
            });

            // Setear y formatear fechas
            const inputEntry = document.querySelector('#edit-res-entrada');
            const inputExit = document.querySelector('#edit-res-exit');

            const formatLocal = (isoString) => {
                if (!isoString) return '';
                const d = new Date(isoString);
                d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); // Ajuste de zona horaria local
                return d.toISOString().slice(0, 16);
            };

            inputEntry.value = formatLocal(entryIso);
            inputExit.value = formatLocal(exitIso);

            // Bloqueo Inteligente si está EN CURSO
            if (status === 'EN CURSO') {
                inputEntry.readOnly = true;
                inputEntry.style.backgroundColor = '#e9ecef';
                inputEntry.style.cursor = 'not-allowed';
                inputEntry.title = "You cannot change the entry date of a booking that's already in progress.";
            } else {
                inputEntry.readOnly = false;
                inputEntry.style.backgroundColor = '';
                inputEntry.style.cursor = '';
                inputEntry.title = "";
            }

            // Abrir el nuevo modal
            editResModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    // Evento Submit de la Edición
    document.querySelector('#form-edit-reserva')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btnSubmit = e.target.querySelector('button[type="submit"]');
        const originalText = btnSubmit.innerHTML;
        btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
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
                await Swal.fire({ icon: 'success', title: 'Updated!', text: data.message, timer: 2000, showConfirmButton: false });
                window.location.reload(); 
            } else {
                Swal.fire('Error', data.message, 'error');
            }
        } catch (error) {
            Swal.fire('Error', 'Connection problem.', 'error');
        } finally {
            btnSubmit.innerHTML = originalText;
            btnSubmit.disabled = false;
        }
    });

    // Cerrar modales con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
            closeDetailsModal();
            closeEditResModal();
        }
    });
});