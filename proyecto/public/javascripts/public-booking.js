/**
 * Lógica para el embudo de reserva pública
 */

// --- FUNCIÓN GLOBAL PARA ERRORES VISUALES (IS-INVALID) ---
// La definimos fuera para que cualquier función pueda usarla
const mostrarError = (input) => {
    if (!input) return;
    input.classList.add('is-invalid');
    // En cuanto el usuario interactúa (escribe o cambia), le quitamos el borde rojo
    input.addEventListener('input', () => input.classList.remove('is-invalid'), { once: true });
    input.addEventListener('change', () => input.classList.remove('is-invalid'), { once: true });
};

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. RECOGER DATOS DE LA URL ---
    const params = new URLSearchParams(window.location.search);
    const entradaParam = params.get('entrada');
    const salidaParam = params.get('salida');

    // Inputs
    const entryInput = document.querySelector('#book-entrada');
    const exitInput = document.querySelector('#book-salida');
    const serviceSelect = document.querySelector('#book-main-service');
    const vehicleTypeSelect = document.querySelector('#book-tipo-vehiculo');
    
    const nameInput = document.querySelector('#book-nombre');
    const phoneInput = document.querySelector('#book-telefono');
    const plateInput = document.querySelector('#book-matricula');
    const brandInput = document.querySelector('#book-marca');
    const modelInput = document.querySelector('#book-modelo');

    const priceText1 = document.querySelector('#price-display-text');
    const priceText2 = document.querySelector('#price-display-text-2');
    const finalPriceText = document.querySelector('#sum-precio-final');
    const spinner = document.querySelector('#price-spinner');

    // Inicializar fechas si vienen del index
    if (entradaParam && entryInput) entryInput.value = entradaParam;
    if (salidaParam && exitInput) exitInput.value = salidaParam;

    // --- 2. MOTOR DE PRECIO DINÁMICO ---
    async function updateDynamicPrice() {
        if (!entryInput.value || !exitInput.value) {
            priceText1.textContent = 'Select dates to see the price';
            priceText2.textContent = 'Total: 0.00 €';
            return;
        }

        spinner.style.display = 'inline-block';

        const isEstimating = !serviceSelect.value;
        const mainServiceId = serviceSelect.value || document.querySelector('#cheapest_service_id').value;
        const vehicleType = vehicleTypeSelect.value || document.querySelector('#default_vehicle_type').value;

        const selectedExtras = Array.from(document.querySelectorAll('.extra-serv:checked'))
                                    .map(cb => parseInt(cb.value));

        const payLoad = {
            entry_date: entryInput.value,
            exit_date: exitInput.value,
            vehicle_type: vehicleType,
            id_main_service: parseInt(mainServiceId),
            additional_services: selectedExtras
        };

        try {
            const response = await fetch('/api/pricing/dynamic', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payLoad)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                const priceFormatted = parseFloat(data.total_price).toFixed(2);
                const prefix = isEstimating ? 'From ' : 'Total: ';
                
                priceText1.textContent = `${prefix}${priceFormatted} €`;
                priceText2.textContent = `Total: ${priceFormatted} €`;
                finalPriceText.textContent = `${priceFormatted} €`;
                priceText1.style.color = '';
            } else {
                priceText1.textContent = 'Error calculating price';
                priceText1.style.color = '#dc3545';
            }
        } catch (error) {
            priceText1.textContent = 'Connection error';
            priceText1.style.color = '#dc3545';
        } finally {
            spinner.style.display = 'none';
        }
    }

    // Escuchamos a los elementos para recalcular el precio
    document.querySelectorAll('.dyn-trigger').forEach(el => {
        el.addEventListener('change', updateDynamicPrice);
        el.addEventListener('input', updateDynamicPrice);
    });

    if (entryInput.value && exitInput.value) updateDynamicPrice();

    // --- 3. RESUMEN EN TIEMPO REAL ---
    function updateSummary() {
        const formatDate = (val) => val ? new Date(val).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' }) : '-';

        document.querySelector('#sum-entrada').textContent = formatDate(entryInput.value);
        document.querySelector('#sum-salida').textContent = formatDate(exitInput.value);
        document.querySelector('#sum-nombre').textContent = nameInput.value || '-';
        document.querySelector('#sum-telefono').textContent = phoneInput.value || '-';
        document.querySelector('#sum-matricula').textContent = (plateInput.value || '-').toUpperCase();
        
        const vehicleStr = `${brandInput.value} ${modelInput.value}`.trim();
        document.querySelector('#sum-vehiculo').textContent = vehicleStr || '-';
    }

    document.querySelectorAll('.sum-trigger, .dyn-trigger').forEach(el => {
        el.addEventListener('input', updateSummary);
        el.addEventListener('change', updateSummary);
    });
});

// --- 4. CONTROL DE PASOS DEL EMBUDO (CON VALIDACIÓN VISUAL) ---
function goToStep(step) {
    let errores = false;

    // Validación Paso 1 -> Paso 2
    if (step === 2) {
        const entry = document.querySelector('#book-entrada');
        const exit = document.querySelector('#book-salida');
        const service = document.querySelector('#book-main-service');

        if (!entry.value) { mostrarError(entry); errores = true; }
        if (!exit.value) { mostrarError(exit); errores = true; }
        if (!service.value) { mostrarError(service); errores = true; }

        if (!errores && new Date(entry.value) >= new Date(exit.value)) {
            mostrarError(exit);
            Swal.fire({ icon: 'error', title: 'Invalid Dates', text: 'The exit date must be after the entry date.' });
            return;
        }
    }

    // Validación Paso 2 -> Paso 3 (SOLO DATOS MÍNIMOS REQUERIDOS)
    if (step === 3) {
        const name = document.querySelector('#book-nombre');
        const phone = document.querySelector('#book-telefono');
        const plate = document.querySelector('#book-matricula');
        const type = document.querySelector('#book-tipo-vehiculo');

        if (!name.value.trim()) { mostrarError(name); errores = true; }
        if (!phone.value.trim()) { mostrarError(phone); errores = true; }
        if (!plate.value.trim()) { mostrarError(plate); errores = true; }
        if (!type.value) { mostrarError(type); errores = true; }
        // Nota: Email, Marca y Modelo NO son obligatorios aquí.
    }

    if (errores) {
        // Alerta amigable temporal
        Swal.fire({ 
            icon: 'warning', 
            title: 'Missing data', 
            text: 'Please fill in the fields marked in red.',
            timer: 2000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });
        return;
    }

    // Si todo está bien, navegamos visualmente al siguiente paso
    document.querySelectorAll('.booking-body').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.step').forEach(el => el.classList.remove('active'));
    
    const activeStep = document.querySelector(`#booking-step-${step}`);
    if (activeStep) activeStep.style.display = 'block';
    
    for (let i = 1; i <= step; i++) {
        const stepInd = document.querySelector(`#step-ind-${i}`);
        if (stepInd) stepInd.classList.add('active');
    }
}

// --- 5. CONFIRMAR Y GUARDAR RESERVA ---
async function confirmBooking() {
    const btnConfirm = document.querySelector('#btn-final-confirm');
    
    // 1. Recolectar datos de los inputs
    const data = {
        full_name: document.querySelector('#book-nombre').value,
        phone: document.querySelector('#book-telefono').value,
        // Usamos un condicional por si el input de email no existe o está vacío
        email: document.querySelector('#book-email') ? document.querySelector('#book-email').value : null,
        license_plate: document.querySelector('#book-matricula').value.toUpperCase(),
        vehicle_type: document.querySelector('#book-tipo-vehiculo').value,
        brand: document.querySelector('#book-marca').value || 'Desconocida',
        model: document.querySelector('#book-modelo').value || 'Desconocido',
        entry_date: document.querySelector('#book-entrada').value,
        exit_date: document.querySelector('#book-salida').value,
        id_main_service: parseInt(document.querySelector('#book-main-service').value),
        additional_services: Array.from(document.querySelectorAll('.extra-serv:checked')).map(cb => parseInt(cb.value))
    };

    // 2. UX: Estado de "Procesando"
    const originalText = btnConfirm.innerHTML;
    btnConfirm.disabled = true;
    btnConfirm.innerHTML = '<span class="fas fa-spinner fa-spin me-2"></span>Procesando...';

    try {
        // 3. Enviar datos al servidor (Ruta pública que vamos a crear)
        const response = await fetch('/api/reservations/public-new', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.status === 201 && result.success) {
            
            // 4. ÉXITO: Ocultar los pasos y mostrar el ticket
            document.querySelectorAll('.booking-body').forEach(el => el.style.display = 'none');
            const stepsNav = document.querySelector('.booking-steps');
            if (stepsNav) stepsNav.style.display = 'none';
            
            const successStep = document.querySelector('#booking-step-success');
            if (successStep) successStep.style.display = 'block';

            // Rellenar los datos del ticket
            const elId = document.querySelector('#codigo-reserva');
            const elNombre = document.querySelector('#conf-nombre');
            const elTlf = document.querySelector('#conf-telefono');
            const elMat = document.querySelector('#conf-matricula');
            const elVeh = document.querySelector('#conf-vehiculo');
            const elPrecio = document.querySelector('#conf-precio');

            if (elId) elId.textContent = `ID: #${result.data.id_reservation}`;
            if (elNombre) elNombre.textContent = result.data.customer_name;
            if (elTlf) elTlf.textContent = result.data.phone;
            if (elMat) elMat.textContent = result.data.license_plate;
            if (elVeh) elVeh.textContent = `${result.data.brand} ${result.data.model}`;
            if (elPrecio) elPrecio.textContent = `${parseFloat(result.data.total_price).toFixed(2)} €`;

            Swal.fire({
                icon: 'success',
                title: 'Booking Confirmed!',
                text: 'Your spot is secured.',
                timer: 3000,
                showConfirmButton: false
            });

        } else {
            throw new Error(result.message || 'Error al guardar la reserva');
        }

    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: error.message || 'A connection error occurred. Please try again.'
        });
    } finally {
        btnConfirm.disabled = false;
        btnConfirm.innerHTML = originalText;
    }
}

// Vinculamos la función al botón usando DOMContentLoaded para asegurarnos de que el botón existe
document.addEventListener('DOMContentLoaded', () => {
    const btnFinal = document.querySelector('#btn-final-confirm');
    if (btnFinal) {
        btnFinal.addEventListener('click', confirmBooking);
    }
});