/**
 * Script de autenticación social con Firebase
 * Maneja login con Google y Facebook
 */

// Proveedores de autenticación
const googleProvider = new firebase.auth.GoogleAuthProvider();
const facebookProvider = new firebase.auth.FacebookAuthProvider();

// Configuración adicional de proveedores
googleProvider.addScope('email');
googleProvider.addScope('profile');
facebookProvider.addScope('email');
facebookProvider.addScope('public_profile');

/**
 * Login con Google
 */
function loginWithGoogle() {
  auth.signInWithPopup(googleProvider)
    .then((result) => {
      handleAuthSuccess(result, 'google');
    })
    .catch((error) => {
      handleAuthError(error);
    });
}

/**
 * Login con Facebook
 */
function loginWithFacebook() {
  auth.signInWithPopup(facebookProvider)
    .then((result) => {
      handleAuthSuccess(result, 'facebook');
    })
    .catch((error) => {
      handleAuthError(error);
    });
}

/**
 * Manejar autenticación exitosa
 */
function handleAuthSuccess(result, provider) {
  const user = result.user;
  
  // Obtener token de Firebase para enviar al backend
  user.getIdToken().then((idToken) => {
    // Enviar datos al servidor para crear/actualizar usuario en la base de datos
    fetch('/users/auth/social', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idToken: idToken,
        provider: provider,
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Mostrar mensaje de éxito
        Swal.fire({
          toast: true,
          position: 'bottom-end',
          icon: 'success',
          title: '¡Bienvenido!',
          text: 'Inicio de sesión exitoso con ' + provider.charAt(0).toUpperCase() + provider.slice(1),
          showConfirmButton: false,
          timer: 2000,
          background: '#eafaf1',
          color: '#2e7d32'
        }).then(() => {
          // Redirigir al dashboard o perfil
          window.location.href = data.redirectUrl || '/users/profile';
        });
      } else {
        Swal.fire({
          toast: true,
          position: 'bottom-end',
          icon: 'error',
          title: 'Error',
          text: data.message || 'Error al iniciar sesión',
          showConfirmButton: false,
          timer: 4000,
          background: '#fdecea',
          color: '#c62828'
        });
      }
    })
    .catch(error => {
      console.error('Error al comunicarse con el servidor:', error);
      handleAuthError({ message: 'Error de conexión con el servidor' });
    });
  });
}

/**
 * Manejar errores de autenticación
 */
function handleAuthError(error) {
  console.error('Error de autenticación:', error);
  
  let errorMessage = 'Error al iniciar sesión';
  
  switch (error.code) {
    case 'auth/popup-closed-by-user':
      errorMessage = 'Ventana cerrada antes de completar el inicio de sesión';
      break;
    case 'auth/popup-blocked':
      errorMessage = 'La ventana emergente fue bloqueada por el navegador';
      break;
    case 'auth/account-exists-with-different-credential':
      errorMessage = 'Ya existe una cuenta con este correo usando otro método de inicio de sesión';
      break;
    case 'auth/network-request-failed':
      errorMessage = 'Error de red. Verifica tu conexión a internet';
      break;
    case 'auth/cancelled-popup-request':
      return; // No mostrar error si el usuario cancela
    default:
      errorMessage = error.message || errorMessage;
  }
  
  Swal.fire({
    toast: true,
    position: 'bottom-end',
    icon: 'error',
    title: 'Error',
    text: errorMessage,
    showConfirmButton: false,
    timer: 4000,
    background: '#fdecea',
    color: '#c62828'
  });
}

/**
 * Cerrar sesión de Firebase
 */
function logoutFirebase() {
  auth.signOut().then(() => {
    console.log('Sesión de Firebase cerrada');
  }).catch((error) => {
    console.error('Error al cerrar sesión:', error);
  });
}
