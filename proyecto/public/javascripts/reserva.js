// Script para la página de reserva
window.addEventListener('DOMContentLoaded', () => {
  // Obtener parámetros de la URL
  const params = new URLSearchParams(window.location.search);
  const entrada = params.get('entrada');
  const salida = params.get('salida');

  // Rellenar los campos ocultos del formulario
  document.getElementById('entrada').value = entrada;
  document.getElementById('salida').value = salida;

  // Calcular precio
  const precioDiv = document.getElementById('precio');
  if (entrada && salida) {
    const fechaEntrada = new Date(entrada);
    const fechaSalida = new Date(salida);
    const msPorDia = 1000 * 60 * 60 * 24;
    const msPorHora = 1000 * 60 * 60;
    let dias = Math.floor((fechaSalida - fechaEntrada) / msPorDia);
    let horas = Math.ceil(((fechaSalida - fechaEntrada) % msPorDia) / msPorHora);
    if (dias < 0 || (dias === 0 && horas <= 0)) {
      precioDiv.textContent = 'Fechas no válidas';
      return;
    }
    // Precio ejemplo: 10€/día + 2€/hora extra
    let precio = dias * 10 + horas * 2;
    precioDiv.textContent = `${precio} €`;
    // Mostrar fechas en la columna derecha
    const spanIda = document.getElementById('fecha-ida');
    const spanVuelta = document.getElementById('fecha-vuelta');
    if (spanIda && spanVuelta) {
      // Formato legible
      spanIda.textContent = fechaEntrada.toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' });
      spanVuelta.textContent = fechaSalida.toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' });
    }
  } else {
    precioDiv.textContent = 'Selecciona fechas válidas';
    // Limpiar fechas si no hay datos
    const spanIda = document.getElementById('fecha-ida');
    const spanVuelta = document.getElementById('fecha-vuelta');
    if (spanIda && spanVuelta) {
      spanIda.textContent = '';
      spanVuelta.textContent = '';
    }
  }
  // Función para generar código aleatorio de 8 caracteres
  function generarCodigoReserva() {
    const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numeros = '0123456789';
    let codigo = '';
    // Garantizar al menos 3 letras y 3 números
    for (let i = 0; i < 3; i++) {
      codigo += letras.charAt(Math.floor(Math.random() * letras.length));
    }
    for (let i = 0; i < 3; i++) {
      codigo += numeros.charAt(Math.floor(Math.random() * numeros.length));
    }
    // Los 2 restantes pueden ser cualquiera
    const chars = letras + numeros;
    for (let i = 0; i < 2; i++) {
      codigo += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // Mezclar el código para que no sea predecible
    return codigo.split('').sort(() => Math.random() - 0.5).join('');
  }

  // Función para generar QR usando una API pública
  function generarQR(texto) {
    // Color principal del proyecto (hex): #0968ef
    // API permite color en formato R,G,B o HEX sin #
    const colorHex = '0968ef'; // var(--color-primary)
    // Fondo blanco
    return `<img src='https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(texto)}&color=${colorHex}&bgcolor=ffffff' alt='QR Reserva'/>`;
  }

  // Manejar el envío del formulario
  const form = document.getElementById('carForm');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      // Obtener datos del formulario
      const nombre = form.querySelector('input[placeholder="Nombre y Apellidos"]').value;
      const telefono = form.querySelector('input[placeholder="+XX XXXXXXXXXX"]').value;
      const matricula = form.querySelector('#matricula').value;
      const marca = form.querySelector('#marca').value;
      const modelo = form.querySelector('#modelo').value;
      // Generar código y QR
      const codigo = generarCodigoReserva();
      // Mostrar datos en el contenedor de confirmación
      document.getElementById('codigo-reserva').textContent = codigo;
      document.getElementById('qr-reserva').innerHTML = generarQR(codigo);
      document.getElementById('conf-nombre').textContent = nombre;
      document.getElementById('conf-telefono').textContent = telefono;
      document.getElementById('conf-matricula').textContent = matricula;
      document.getElementById('conf-marca').textContent = marca;
      document.getElementById('conf-modelo').textContent = modelo;
      // Ocultar formulario y mostrar confirmación
      form.style.display = 'none';
      document.getElementById('confirmacion-reserva').style.display = 'block';
    });
  }
});
