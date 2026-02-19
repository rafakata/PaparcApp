// SweetAlert2 para mensajes de éxito o error
function showFlashAlert() {
  let flash = document.getElementById('flash-msg');
  if (flash) {
    let type = flash.getAttribute('data-type');
    let bgColor = type === 'success' ? '#eafaf1' : '#fdecea';
    let textColor = type === 'success' ? '#2e7d32' : '#c62828';
    Swal.fire({
      toast: true,
      position: 'bottom-end',
      icon: type,
      title: type === 'success' ? '¡Bien hecho!' : 'Error',
      text: flash.getAttribute('data-text'),
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: true,
      width: '520px',
      background: bgColor,
      color: textColor,
      didOpen: function(toast) {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', showFlashAlert);