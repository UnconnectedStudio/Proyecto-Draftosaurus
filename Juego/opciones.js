// Opciones modal para juego
function mostrarOpcionesJuego() {
    document.getElementById('modal-opciones-juego').style.display = 'flex';
}
function cerrarOpcionesJuego() {
    document.getElementById('modal-opciones-juego').style.display = 'none';
}
// Redirigir a resultado.html al tocar finalizar
function finalizarPartida() {
    window.location.href = '../Resultado/resultado.html';
}
// Actualizar el valor de la barra de volumen
const volumenInputJuego = document.getElementById('volumen-juego');
const volumenValorJuego = document.getElementById('volumen-valor-juego');
if (volumenInputJuego && volumenValorJuego) {
    volumenInputJuego.addEventListener('input', function() {
        volumenValorJuego.textContent = volumenInputJuego.value;
    });
}
// Cerrar modal con botón
const cerrarModalBtnJuego = document.getElementById('cerrar-modal-juego');
if (cerrarModalBtnJuego) {
    cerrarModalBtnJuego.addEventListener('click', cerrarOpcionesJuego);
}
// Botón finalizar
const finalizarBtnJuego = document.getElementById('finalizar-juego');
if (finalizarBtnJuego) {
    finalizarBtnJuego.addEventListener('click', finalizarPartida);
}
