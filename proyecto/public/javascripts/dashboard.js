/**
 * Aqui vamos a controlar la lógica Fetch/AJAX para actualizar las tablas de entradas y salidas en el dashboard.
 * Y la lógica para que el calendario funcione y muestre los datos seleccionando la fecha que queramos. 
*/

// Esperamos a que el DOM esté completamente cargado para ejecutar nuestro código
//usamos $(document).ready porque el calendario se carga con una librería externa y queremos asegurarnos de que todo el DOM esté listo antes de ejecutar nuestro código
$(document).ready(function() {

    console.log('Iniciando dashboard.js');
    initCalendar(); //configuramos el calendario visual

    const localDate = new Date();
    localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset()); // Ajustamos la fecha a la zona horaria local 
    const today = localDate.toISOString().split('T')[0]; // Obtenemos la fecha en formato YYYY-MM-DD para usarla en la API

    // Cargamos los datos para la fecha actual al iniciar la página
    updateHeaderDate(today);

    loadDashboardData(today); //pedimos los datos iniciales
})

/********** FUNCIONES DE CALENDARIO **********/

/**
 * Función para inicializar el calendario visual utilizando la librería flatpickr
 * Configuramos el formato de fecha, los nombres de los meses y días, y la función que se ejecuta al seleccionar una fecha
*/
function initCalendar() {

    $('.calendario_widget').datepicker({
        dateFormat: 'yy-mm-dd', // Formato de fecha compatible con nuestra API
        firstDay: 1, // Comenzar la semana en lunes
        monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        dayNamesMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'], // Day initials in English

        // esta es la lógica que usamos para actualizar el dashboard cada vez que se selecciona una fecha en el calendario
        onSelect: function(dateText) {
            console.log(`Fecha cambiada a: ${dateText}`);

            $('#date-picker').val(dateText);
            updateHeaderDate(dateText); // Actualizamos la fecha en el encabezado del dashboard
            loadDashboardData(dateText); // Cargamos los datos para la fecha seleccionada
        }
    });

    $('.calendario_widget').datepicker('setDate', new Date()); //marca el dia visualmente 
;}

//*********** FUNCIONES PARA MOSTRAR DATOS EN EL DASHBOARD **********//

/**
 * Funcion para actualizar la fecha que se muestra en el encabezado
 * Esta función formatea la fecha seleccionada en el calendario y la muestra en el encabezado del dashboard
 * El formato de fecha es "Día de la semana, Día de Mes de Año" (por ejemplo, "Lunes, 1 de Enero de 2024")
 * @param {*} date 
 */
function updateHeaderDate(date) {

    const dateObj = new Date(date);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

    const formattedLocalDate = dateObj.toLocaleDateString('es-ES', options);

    const formattedDate = formattedLocalDate.charAt(0).toUpperCase() + formattedLocalDate.slice(1);

    $('#current-date-display').html(`<i class="bi bi-calendar3 me-2"></i>${formattedDate}`);
}

/**
 * Funcion que utilizamos para pedir datos  a la API y enviamos datos según sean entradas o salidas
 * @param {string} date - La fecha para la cual queremos cargar los datos (formato YYYY-MM-DD) 
*/
async function loadDashboardData(date) {

    try {

        // pedimos los datos a nuestra API interna y esperamos la respuesta
        const response = await fetch(`/api/reservations?date=${date}`);

        //controlamos el error.
        if (!response.ok) throw new Error(`Error de conectividad: ${response.statusText}`); 

        // en data recibimos la respuesta
        const data = await response.json();

        console.log('Datos recibidos del servidor:', data);
        
        // actualizamos las estadísticas que mostraros en el dashboard
        if (data.stats) {

            let entradasTotales = Number(data.stats.total_entries) + Number(data.stats.total_exits);
        
            $('#stat-entries').text(data.stats.total_entries);
            $('#stat-exits').text(data.stats.total_exits);
            $('#stat-total').text(entradasTotales);
        }

        // actualizamos la tabla de entradas
        renderTable('entries-table-body',data.entries, 'entry');
        // actualizamos la tabla de salidas
        renderTable('exits-table-body',data.exits, 'exit');

    } catch (error) {
        console.error('Error :', error);
    }
}

/**
 * Funcion que se encarga de renderizar las tablas de entradas y salidas
 * @param {string} table - El ID del cuerpo de la tabla que queremos actualizar
 * @param {Array} data - Un array de objetos con los datos a mostrar en la tabla
 * @param {string} type - Para saber que dato mostrar según sea una entrada o una salida
*/
function renderTable(table,data,type) {

    const tbody = document.querySelector(`#${table}`);
    const template = document.querySelector('#row-template'); // Obtenemos la plantilla de fila

    tbody.innerHTML = ''; // Limpiamos el cuerpo de la tabla antes de agregar nuevas filas

    if (!data || data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7">No hay movimientos previstos para esta fecha.</td></tr>`;
        return;
    }
    
    data.forEach(reservation =>{

        const useTemplate = template.content.cloneNode(true); // Clonamos la plantilla
        const row = useTemplate.querySelector('tr');
        const btn = useTemplate.querySelector('.column-btn'); // Obtenemos el botón de la fila para agregarle el enlace

        // -- Lógica de estados -- //
        switch (reservation.status) {

            case 'CANCELADA':
                row.classList.add('row-status-cancelled')
                btn.classList.replace('btn-outline-primary', 'btn-outline-secondary');
                btn.textContent = 'Cancelled';
            break;

            case 'FINALIZADA':
                row.classList.add('row-status-finished')
                btn.classList.replace('btn-outline-primary', 'btn-outline-success');
                btn.textContent = 'Finished';
            break;
        }

        const rawTime = type === 'entry' ? reservation.entry_date : reservation.exit_date;
        const time = new Date(rawTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // hora formato español

        useTemplate.querySelector('.column-time').textContent = time;
        useTemplate.querySelector('.column-license').textContent = reservation.license_plate;
        useTemplate.querySelector('.column-brand').textContent = reservation.brand;
        useTemplate.querySelector('.column-color').textContent = reservation.color;
        useTemplate.querySelector('.column-customer').textContent = reservation.customer_name;
        useTemplate.querySelector('.column-phone').textContent = reservation.phone;
        useTemplate.querySelector('.column-service').textContent = reservation.service_name;

        btn.href = `/admin/reservations/details/${reservation.id_reservation}`; // Enlace a la página de detalles de la reserva
        btn.target = '_blank'; // Abrir en nueva pestaña
        btn.rel = 'opener'; // Permitir que la nueva pestaña acceda a la página original

        tbody.appendChild(useTemplate); // Agregamos la nueva fila al cuerpo de la tabla
    })
}