// Redirigir a juego.html al tocar el botón Jugar
document.getElementById('btn-jugar').addEventListener('click', function() {
	window.location.href = '../Juego/juego.html';
});

// Mostrar el modal de opciones
document.getElementById('btn-opciones').addEventListener('click', function() {
	document.getElementById('modal-opciones').style.display = 'flex';
});

// Cerrar el modal
document.getElementById('cerrar-modal').addEventListener('click', function() {
	document.getElementById('modal-opciones').style.display = 'none';
});

// Actualizar el valor de la barra de volumen
const volumenInput = document.getElementById('volumen');
const volumenValor = document.getElementById('volumen-valor');
volumenInput.addEventListener('input', function() {
	volumenValor.textContent = volumenInput.value;
});
