/**
 * Configuración de Firebase para autenticación
 * PaparcApp - Firebase Console
 */

const firebaseConfig = {
  apiKey: "AIzaSyD61OFtuypBCC8OuFEHN54VtVprJA00zTI",
  authDomain: "paparcapp-b0ac1.firebaseapp.com",
  projectId: "paparcapp-b0ac1",
  storageBucket: "paparcapp-b0ac1.firebasestorage.app",
  messagingSenderId: "363572926161",
  appId: "1:363572926161:web:20bfb546fa6a1e38c797f0"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Exportar auth para uso en otros scripts
const auth = firebase.auth();
