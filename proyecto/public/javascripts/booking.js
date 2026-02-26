/**
 * Lógica de Experiencia de Usuario (UX) para la creación de Nueva Reserva
 */
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. LÓGICA DEL RESUMEN EN VIVO ---
    const updateSummary = () => {
        // Elementos del formulario
        const nameInput = document.querySelector('#full_name');
        const plateInput = document.querySelector('#license_plate');
        const entryInput = document.querySelector('#calc_entry_date');
        const exitInput = document.querySelector('#calc_exit_date');

        // Elementos del resumen
        const sumName = document.querySelector('#sum-nombre');
        const sumPlate = document.querySelector('#sum-matricula');
        const sumEntry = document.querySelector('#sum-entrada');
        const sumExit = document.querySelector('#sum-salida');

        // Actualizamos texto (si el input está vacío, ponemos un guión '-')
        if (nameInput && sumName) sumName.textContent = nameInput.value || '-';
        if (plateInput && sumPlate) sumPlate.textContent = plateInput.value || '-';
        
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

});