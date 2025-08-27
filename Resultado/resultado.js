// Volver al inicio
const btnVolver = document.getElementById('btn-volver-inicio');
if (btnVolver) {
    btnVolver.addEventListener('click', function() {
        window.location.href = '../Inicio/inicio.html';
    });
}