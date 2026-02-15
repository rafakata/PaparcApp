/**
 * Logica para el cálculo de precios dinámicos en el cliente, aquí se define la función que se encargará 
 * de enviar los datos al servidor para obtener el precio calculado y actualizar la interfaz del usuario 
 * con el nuevo precio. 
 * Esta función se invocará cada vez que el usuario modifique las fechas, el tipo de vehículo o los servicios adicionales en el formulario de reserva.
 * El objetivo es proporcionar al usuario una experiencia interactiva y en tiempo real, permitiéndole ver cómo sus elecciones afectan el precio total de su reserva antes de finalizarla.
*/ 

document.addEventListener('DOMContentLoaded', () => {

    // traemos todos los elementos del DOM que vamos a necesitar para el cálculo dinámico de precios
    const entryDateInput = document.querySelector('#calc_entry_date');
    const exitDateInput = document.querySelector('#calc_exit_date');
    const vehicleTypeSelect = document.querySelector('#calc_vehicle_type');
    const mainServiceSelect = document.querySelector('#calc_main_service');
    const additonalServicesCheckboxes = document.querySelectorAll('.calc_extra_service');
    const dynamicPriceDisplay = document.querySelector('#dynamic_total_price');
    const spiner = document.querySelector('#recalculating_indicator');
    const btnSave = document.querySelector('#btn_save_changes');

    async function updatePrice() {

        if (!entryDateInput.value || !exitDateInput.value) return;

        spiner.style.display = 'inline';
        btnSave.disabled = true;
        dynamicPriceDisplay.style.opacity = '0.5';

        const selectedAdditionalServices = Array.from(document.querySelectorAll('.calc_extra_service:checked'))
                                            .map(checkbox => parseInt(checkbox.value));

        const payLoad = {
            entry_date: entryDateInput.value,
            exit_date: exitDateInput.value,
            vehicle_type: vehicleTypeSelect.value,
            id_main_service: parseInt(mainServiceSelect.value),
            additional_services: selectedAdditionalServices
        }

        try {

            // fetch al endpoint de la API para obtener el precio dinámico calculado en el servidor
            const response = await fetch('/api/pricing/dynamic', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payLoad)
            });

            //aqui recibimos la respuesta del servidor
            const data = await response.json();

            // si la respuesta no es ok o el servidor devuelve un error, lanzamos una excepción para mostrar un mensaje de error al usuario
            if (!response.ok || !data.success) throw new Error(data.message || 'Error devuelto por el servidor.');

            dynamicPriceDisplay.textContent = parseFloat(data.total_price).toFixed(2);
            dynamicPriceDisplay.style.color = '#27ae60'; // verde para indicar que el precio se ha actualizado correctamente

            setTimeout(() => { dynamicPriceDisplay.style.color = '' }, 2000); // después de 2 segundos volvemos al color original
            
        } catch (error) {

            console.error('Error al actualizar el precio dinámico:', error);
            dynamicPriceDisplay.textContent = ' Error';
            dynamicPriceDisplay.style.color = '#c0392b'; // rojo para indicar que ha habido un error

        } finally { //en cualquier caso, restauramos la interfaz

            spiner.style.display = 'none';
            dynamicPriceDisplay.style.opacity = '1';
            btnSave.disabled = false;

        }
    }

    // añadimos event listeners a los campos relevantes para que cada vez que el usuario cambie algo se actualice el precio dinámico
    entryDateInput.addEventListener('change', updatePrice);
    exitDateInput.addEventListener('change', updatePrice);
    vehicleTypeSelect.addEventListener('change', updatePrice);
    mainServiceSelect.addEventListener('change', updatePrice);

    additonalServicesCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updatePrice);
    })

});