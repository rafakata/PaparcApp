window.addEventListener("scroll", () => {
  const coche = document.querySelector(".coche");
  const scrollY = window.scrollY;
  const movimiento = Math.min(scrollY / 2, window.innerWidth * 0.6);
  if (coche) coche.style.transform = `translateX(${movimiento}px)`;
});

// Redirigir a la página de reserva con fechas seleccionadas
document.addEventListener('DOMContentLoaded', function () {
  const boton = document.querySelector('#reserva_boton');
  
  if (boton) {
    boton.addEventListener('click', function (e) {
      e.preventDefault();
      
      const entradaInput = document.querySelector('#entrada');
      const salidaInput = document.querySelector('#salida');
      
      const entrada = entradaInput ? entradaInput.value : '';
      const salida = salidaInput ? salidaInput.value : '';
      
      if (!entrada || !salida) {
        // SWEET ALERT TEMPORAL DE 1.5seg
        Swal.fire({
            icon: 'warning',
            title: 'Missing dates',
            text: 'Please select both entry and exit dates.',
            timer: 1500,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });
        return;
      }
      
      window.location.href = `/booking?entrada=${encodeURIComponent(entrada)}&salida=${encodeURIComponent(salida)}`;
    });
  }

  // FAQ Acordeón
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-question');
    if (btn) {
      btn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        // Cerrar todos
        faqItems.forEach(i => i.classList.remove('active'));
        // Abrir el clickeado si no estaba abierto
        if (!isActive) item.classList.add('active');
      });
    }
  });
});