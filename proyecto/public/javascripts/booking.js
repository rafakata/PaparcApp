// Script para la página de reserva (rediseñada con pasos)
window.addEventListener('DOMContentLoaded', () => {
  // Leer parámetros de la URL (si vienen del index)
  const params = new URLSearchParams(window.location.search);
  const entradaParam = params.get('entrada');
  const salidaParam = params.get('salida');

  if (entradaParam) document.getElementById('book-entrada').value = entradaParam;
  if (salidaParam) document.getElementById('book-salida').value = salidaParam;

  // Calcular precio si ya hay fechas
  calcPrice();

  // Listeners para calcular precio al cambiar fechas
  document.getElementById('book-entrada').addEventListener('change', calcPrice);
  document.getElementById('book-salida').addEventListener('change', calcPrice);
});

/* ========== NAVEGACIÓN POR PASOS ========== */
function goToStep(step) {
  // Validar antes de avanzar
  if (step === 2) {
    const entrada = document.getElementById('book-entrada').value;
    const salida = document.getElementById('book-salida').value;
    if (!entrada || !salida) {
      alert('Por favor, selecciona las fechas de entrada y salida.');
      return;
    }
    if (new Date(salida) <= new Date(entrada)) {
      alert('La fecha de salida debe ser posterior a la de entrada.');
      return;
    }
  }
  if (step === 3) {
    const matricula = document.getElementById('book-matricula').value;
    const marca = document.getElementById('book-marca').value;
    const modelo = document.getElementById('book-modelo').value;
    if (!matricula || !marca || !modelo) {
      alert('Por favor, completa todos los datos del vehículo.');
      return;
    }
    updateSummary();
  }

  document.getElementById('booking-step-1').style.display = step === 1 ? 'flex' : 'none';
  document.getElementById('booking-step-2').style.display = step === 2 ? 'flex' : 'none';
  document.getElementById('booking-step-3').style.display = step === 3 ? 'flex' : 'none';
  const success = document.getElementById('booking-step-success');
  if (success) success.style.display = 'none';

  for (let i = 1; i <= 3; i++) {
    document.getElementById('step-ind-' + i).classList.toggle('active', i <= step);
  }
}

/* ========== CÁLCULO DE PRECIO ========== */
function calcPrice() {
  const entradaVal = document.getElementById('book-entrada').value;
  const salidaVal = document.getElementById('book-salida').value;
  const preview = document.getElementById('booking-price-preview');

  if (entradaVal && salidaVal) {
    const entrada = new Date(entradaVal);
    const salida = new Date(salidaVal);
    if (salida > entrada) {
      const dias = Math.ceil((salida - entrada) / (1000 * 60 * 60 * 24));
      const precio = (dias * 8.50).toFixed(2);
      preview.innerHTML = '<i class="fas fa-tag"></i> <span>' + dias + ' día(s) — <strong>' + precio + ' €</strong> (IVA incl.)</span>';
      preview.classList.add('has-price');
      return;
    }
  }
  preview.innerHTML = '<i class="fas fa-tag"></i> <span>Selecciona las fechas para ver el precio</span>';
  preview.classList.remove('has-price');
}

/* ========== RESUMEN ========== */
function updateSummary() {
  const entrada = document.getElementById('book-entrada').value;
  const salida = document.getElementById('book-salida').value;
  const nombre = document.getElementById('book-nombre') ? document.getElementById('book-nombre').value : '';
  const matricula = document.getElementById('book-matricula').value;
  const marca = document.getElementById('book-marca').value;
  const modelo = document.getElementById('book-modelo').value;
  const telefono = document.getElementById('book-telefono') ? document.getElementById('book-telefono').value : '';

  document.getElementById('sum-entrada').textContent = entrada ? new Date(entrada).toLocaleString('es-ES') : '-';
  document.getElementById('sum-salida').textContent = salida ? new Date(salida).toLocaleString('es-ES') : '-';
  document.getElementById('sum-nombre').textContent = nombre || '-';
  document.getElementById('sum-matricula').textContent = matricula || '-';
  document.getElementById('sum-vehiculo').textContent = (marca + ' ' + modelo).trim() || '-';
  document.getElementById('sum-telefono').textContent = telefono || '-';

  const e = new Date(entrada), s = new Date(salida);
  if (e && s && s > e) {
    const dias = Math.ceil((s - e) / (1000 * 60 * 60 * 24));
    document.getElementById('sum-precio').textContent = (dias * 8.50).toFixed(2) + ' €';
  }
}

/* ========== CONFIRMACIÓN ========== */
function generarCodigoReserva() {
  const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numeros = '0123456789';
  let codigo = '';
  for (let i = 0; i < 3; i++) codigo += letras.charAt(Math.floor(Math.random() * letras.length));
  for (let i = 0; i < 3; i++) codigo += numeros.charAt(Math.floor(Math.random() * numeros.length));
  const chars = letras + numeros;
  for (let i = 0; i < 2; i++) codigo += chars.charAt(Math.floor(Math.random() * chars.length));
  return codigo.split('').sort(() => Math.random() - 0.5).join('');
}

function generarQR(texto) {
  const colorHex = '0968ef';
  return `<img src='https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(texto)}&color=${colorHex}&bgcolor=ffffff' alt='QR Reserva'/>`;
}

function confirmBooking() {
  const codigo = generarCodigoReserva();
  const nombre = document.getElementById('book-nombre') ? document.getElementById('book-nombre').value : '';
  const telefono = document.getElementById('book-telefono') ? document.getElementById('book-telefono').value : '';
  const matricula = document.getElementById('book-matricula').value;
  const marca = document.getElementById('book-marca').value;
  const modelo = document.getElementById('book-modelo').value;

  document.getElementById('codigo-reserva').textContent = codigo;
  document.getElementById('qr-reserva').innerHTML = generarQR(codigo);
  document.getElementById('conf-nombre').textContent = nombre;
  document.getElementById('conf-telefono').textContent = telefono;
  document.getElementById('conf-matricula').textContent = matricula;
  document.getElementById('conf-vehiculo').textContent = marca + ' ' + modelo;

  // Ocultar pasos y mostrar éxito
  document.getElementById('booking-step-1').style.display = 'none';
  document.getElementById('booking-step-2').style.display = 'none';
  document.getElementById('booking-step-3').style.display = 'none';
  document.getElementById('booking-step-success').style.display = 'flex';

  // Desactivar steps visual
  for (let i = 1; i <= 3; i++) {
    document.getElementById('step-ind-' + i).classList.add('active');
  }
}
