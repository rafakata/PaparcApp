document.addEventListener('DOMContentLoaded', () => {
    const containerUserContent = document.querySelector('.containerUserContent');
    const formularioWorker = document.querySelector('.formWorker');
    const botonUser = document.querySelector('.usuario');
    const botonWorker = document.querySelector('.trabajador');

    if (!containerUserContent || !formularioWorker || !botonUser || !botonWorker) return;

    // Estado inicial: mostrar User container, ocultar Worker form
    containerUserContent.classList.remove('hidden');
    formularioWorker.classList.remove('visible');
    formularioWorker.classList.add('hidden');
    botonUser.classList.add('active');
    botonWorker.classList.remove('active');

    botonUser.addEventListener('click', (e) => {
        e.preventDefault();
        // Mostrar User
        containerUserContent.classList.remove('hidden');
        formularioWorker.classList.remove('visible');
        formularioWorker.classList.add('hidden');
        botonUser.classList.add('active');
        botonWorker.classList.remove('active');
    });

    botonWorker.addEventListener('click', (e) => {
        e.preventDefault();
        // Mostrar Worker
        containerUserContent.classList.add('hidden');
        formularioWorker.classList.add('visible');
        formularioWorker.classList.remove('hidden');
        botonWorker.classList.add('active');
        botonUser.classList.remove('active');
    });
});