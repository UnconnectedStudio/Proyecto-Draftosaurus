<!DOCTYPE html>
<html lang="es">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Inicio</title>
	<link rel="stylesheet" href="inicio.css">
</head>
<body>
	<main class="fondo">
	<!-- Header con el título del juego -->
		<header>
			<img src="../imagenes/DraftosaurusLetra.png" alt="Título del Juego" class="titulo-juego">
		</header>
	<!-- Navegación con los botones principales -->
		<nav class="botones">
			<button id="btn-jugar">Jugar</button>
			<button id="btn-opciones">Opciones</button>
		</nav>
	<!-- Modal de opciones de sonido y música -->
		<section id="modal-opciones" class="modal-opciones" style="display:none;">
			<div class="modal-contenido">
				<h2>Opciones</h2>
				<label for="volumen">Sonido</label>
				<input type="range" id="volumen" min="1" max="100" value="50">
				<span id="volumen-valor">50</span>
				<label for="mute-musica" class="label-mute">
					Quitar música
					<input type="checkbox" id="mute-musica">
				</label>
				<button id="cerrar-modal">Cerrar</button>
			</div>
		</section>
	</main>
	<script src="inicio.js"></script>
</body>
</html>
