// Boton para volver a la página de inicio
document.addEventListener('DOMContentLoaded', function() {
	document.getElementById('volver').addEventListener('click', function() {
		window.location.href = '../Inicio/inicio.html';
	});
	// Boton para ir a la página de resultado
	document.getElementById('resultado').addEventListener('click', function() {
		window.location.href = '../Resultado/resultado.html';
	});
	// Mostrar modal calculadora
	document.getElementById('calculadora').addEventListener('click', function() {
		document.getElementById('modal-calculadora').style.display = 'flex';
	});
	// Cerrar modal
	document.getElementById('cerrar-modal').addEventListener('click', function() {
		document.getElementById('modal-calculadora').style.display = 'none';
	});

	// Selectores de dinosaurio
	const emojis = ['🦖', '🦕', '🦴', '🦩', '🦣', '🦚'];
	let menu = null;
	let currentSelector = null;
	// Función para calcular puntos según sector y reglas
	function calcularPuntosSector(sector) {
		const selectores = document.querySelectorAll('.selector-dino[data-sector="' + sector + '"]');
		if (sector === 1) {
			// Sector 1: sumar puntos por cantidad de dinosaurios iguales
			const counts = {};
			selectores.forEach(function(sel) {
				const emoji = sel.textContent;
				if (emoji) {
					counts[emoji] = (counts[emoji] || 0) + 1;
				}
			});
			let puntos = 0;
			Object.values(counts).forEach(function(cantidad) {
				switch (cantidad) {
					case 1: puntos += 2; break;
					case 2: puntos += 4; break;
					case 3: puntos += 8; break;
					case 4: puntos += 12; break;
					case 5: puntos += 18; break;
					case 6: puntos += 24; break;
					default: break;
				}
			});
			// Si hay más de un tipo de dinosaurio, anula todos los puntos
			if (Object.keys(counts).length > 1) {
				puntos = 0;
			}
			return puntos;
		} else if (sector === 2) {
			// Sector 2: solo suma 7 puntos si los 3 dinosaurios son iguales
			const emojis = Array.from(selectores).map(sel => sel.textContent).filter(Boolean);
			if (emojis.length === 3 && emojis.every(e => e === emojis[0])) {
				return 7;
			} else {
				return 0;
			}
		} else if (sector === 3) {
			// Sector 3: suma 5 puntos por cada pareja de dinosaurios iguales
			const counts = {};
			selectores.forEach(function(sel) {
				const emoji = sel.textContent;
				if (emoji) {
					counts[emoji] = (counts[emoji] || 0) + 1;
				}
			});
			let parejas = 0;
			Object.values(counts).forEach(function(cantidad) {
				parejas += Math.floor(cantidad / 2);
			});
			return parejas * 5;
		} else if (sector === 5) {
			// Sector 5: suma puntos solo si todos los dinosaurios son diferentes
			const emojis = Array.from(selectores).map(sel => sel.textContent).filter(Boolean);
			const total = emojis.length;
			const diferentes = new Set(emojis);
			let puntos = 0;
			if (total > 0 && diferentes.size === total) {
				switch (total) {
					case 1: puntos = 2; break;
					case 2: puntos = 4; break;
					case 3: puntos = 8; break;
					case 4: puntos = 12; break;
					case 5: puntos = 18; break;
					case 6: puntos = 24; break;
					default: puntos = 0; break;
				}
			}
			return puntos;
		} else if (sector === 6) {
			// Sector 6: suma 7 puntos solo si el dinosaurio seleccionado no está en ningún otro sector
			const sel = document.querySelector('.selector-dino[data-sector="6"]');
			const emoji = sel && sel.textContent;
			if (!emoji) return 0;
			let estaEnOtro = false;
			for (let i = 1; i <= 7; i++) {
				if (i === 6) continue;
				const otros = document.querySelectorAll('.selector-dino[data-sector="' + i + '"]');
				otros.forEach(function(o) {
					if (o.textContent === emoji) {
						estaEnOtro = true;
					}
				});
			}
			return estaEnOtro ? 0 : 7;
		} else if (sector === 7) {
			// Sector 7: suma 1 punto por cada dinosaurio seleccionado
			let puntos = 0;
			selectores.forEach(function(sel) {
				if (sel.textContent) puntos++;
			});
			return puntos;
		} else {
			let puntos = 0;
			selectores.forEach(function(sel) {
				if (sel.textContent) puntos++;
			});
			return puntos;
		}
	}
// Función para actualizar puntos en la interfaz
	function actualizarPuntos() {
		let total = 0;
		for (let i = 1; i <= 7; i++) {
			const puntos = calcularPuntosSector(i);
			document.getElementById('puntos-sector-' + i).textContent = puntos;
			total += puntos;
		}
		document.getElementById('total-puntos').textContent = total;
	}
// Configurar eventos en los selectores
	document.querySelectorAll('.selector-dino').forEach(function(selector) {
		selector.addEventListener('click', function(e) {
			e.stopPropagation();
			currentSelector = selector;
			// Eliminar menú anterior si existe
			if (menu) {
				menu.remove();
			}
			// Crear menú nuevo
			menu = document.createElement('div');
			menu.className = 'menu-dino';
			menu.style.position = 'absolute';
			menu.style.zIndex = '2000';
			menu.style.display = 'flex';
			menu.style.flexDirection = 'row';
			menu.style.gap = '10px';
			emojis.forEach(function(emoji) {
				const opcion = document.createElement('div');
				opcion.className = 'menu-dino-opcion';
				opcion.textContent = emoji;
				opcion.addEventListener('click', function(ev) {
					selector.textContent = emoji;
					menu.remove();
					actualizarPuntos();
				});
				menu.appendChild(opcion);
			});
			document.body.appendChild(menu);
			// Posicionar menú debajo del selector
			const rect = selector.getBoundingClientRect();
			menu.style.top = (rect.bottom + window.scrollY + 8) + 'px';
			menu.style.left = (rect.left + window.scrollX + rect.width/2 - menu.offsetWidth/2) + 'px';
			setTimeout(function() {
				menu.style.left = (rect.left + window.scrollX + rect.width/2 - menu.offsetWidth/2) + 'px';
			}, 0);
		});

		// Permitir quitar selección con clic derecho
		selector.addEventListener('contextmenu', function(e) {
			e.preventDefault();
			selector.textContent = '';
			actualizarPuntos();
		});
	});

	// Inicializar puntos al cargar
	actualizarPuntos();

	// Ocultar menú al hacer click fuera
	document.addEventListener('click', function(e) {
		if (menu && !menu.contains(e.target)) {
			menu.remove();
			menu = null;
		}
	});
});
