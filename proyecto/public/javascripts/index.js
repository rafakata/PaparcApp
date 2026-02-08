window.addEventListener("scroll", () => {
  const coche = document.querySelector(".coche");
  const scrollY = window.scrollY;
  const movimiento = Math.min(scrollY / 2, window.innerWidth * 0.6);
  coche.style.transform = `translateX(${movimiento}px)`;
});

// Redirigir a la página de reserva con fechas seleccionadas
document.addEventListener('DOMContentLoaded', function () {
  const boton = document.getElementById('reserva_boton');
  if (boton) {
    boton.addEventListener('click', function (e) {
      e.preventDefault();
      const entrada = document.getElementById('entrada').value;
      const salida = document.getElementById('salida').value;
      if (!entrada || !salida) {
        alert('Por favor, selecciona fecha y hora de entrada y salida.');
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
