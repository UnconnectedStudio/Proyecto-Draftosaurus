// Estado del juego - sin funcionalidades de tablero
let estadoJuego = {
    numJugadores: 2,
    modoJuego: 'clasico',
    temporizadorActivo: false,
    tiempoPorTurno: 60,
    puntuaciones: {}
};

// Inicializa puntuaciones para todos los jugadores
function inicializarPuntuaciones() {
    estadoJuego.puntuaciones = {};
    for (let i = 1; i <= estadoJuego.numJugadores; i++) {
        estadoJuego.puntuaciones[`jugador${i}`] = {
            trex: 0,
            triceratops: 0,
            brontosaurus: 0,
            stegosaurus: 0,
            zonasCompletas: 0,
            parejas: 0,
            total: 0
        };
    }
}

// Inicializa el juego
function inicializarJuego() {
    console.log('Modo Auxiliar - Draftosaurus iniciado');
    inicializarPuntuaciones();
    actualizarJugadores();
    actualizarTabsJugadores();
}

// Actualiza número de jugadores
function actualizarJugadores() {
    const numJugadores = parseInt(document.getElementById('num-jugadores').value);
    estadoJuego.numJugadores = numJugadores;
    inicializarPuntuaciones();
    actualizarTabsJugadores();
    document.getElementById('estado-juego').textContent = `Partida para ${numJugadores} jugadores`;
}

// Actualiza modo de juego
function actualizarModo() {
    const modo = document.getElementById('modo-juego').value;
    estadoJuego.modoJuego = modo;
    document.getElementById('estado-juego').textContent = `Modo ${modo} seleccionado`;
}

// Toggle temporizador
function toggleTemporizador() {
    const temporizador = document.getElementById('temporizador');
    const configTiempo = document.getElementById('config-tiempo');
    
    estadoJuego.temporizadorActivo = temporizador.checked;
    configTiempo.style.display = temporizador.checked ? 'block' : 'none';
    
    if (temporizador.checked) {
        document.getElementById('estado-juego').textContent = `Temporizador activado: ${estadoJuego.tiempoPorTurno}s por turno`;
    }
}

// Actualiza tiempo del temporizador
function actualizarTiempo() {
    const tiempo = document.getElementById('tiempo-turno').value;
    estadoJuego.tiempoPorTurno = parseInt(tiempo);
    document.getElementById('tiempo-display').textContent = `${tiempo}s`;
    
    if (estadoJuego.temporizadorActivo) {
        document.getElementById('estado-juego').textContent = `Temporizador: ${tiempo}s por turno`;
    }
}

// Actualiza tabs de jugadores dinámicamente
function actualizarTabsJugadores() {
    const tabContainer = document.getElementById('pills-tab');
    const contentContainer = document.getElementById('pills-tabContent');
    
    // Limpia tabs existentes
    tabContainer.innerHTML = '';
    contentContainer.innerHTML = '';
    
    // Crea tabs para cada jugador
    for (let i = 1; i <= estadoJuego.numJugadores; i++) {
        // Crea tab button
        const tabButton = document.createElement('button');
        tabButton.className = `nav-link jugador-tab ${i === 1 ? 'active' : ''}`;
        tabButton.id = `jugador${i}-tab`;
        tabButton.setAttribute('data-bs-toggle', 'pill');
        tabButton.setAttribute('data-bs-target', `#jugador${i}`);
        tabButton.setAttribute('type', 'button');
        tabButton.setAttribute('role', 'tab');
        tabButton.textContent = `Jugador ${i}`;
        tabContainer.appendChild(tabButton);
        
        // Crea tab content
        const tabContent = document.createElement('section');
        tabContent.className = `tab-pane fade ${i === 1 ? 'show active' : ''}`;
        tabContent.id = `jugador${i}`;
        tabContent.setAttribute('role', 'tabpanel');
        
        tabContent.innerHTML = `
            <section class="formulario-puntos">
                <section class="categoria-puntos mb-3">
                    <label class="form-label">🦕 Dinosaurios por tipo:</label>
                    <section class="row g-2">
                        <section class="col-6">
                            <input type="number" class="form-control input-puntos" 
                                   placeholder="T-Rex" min="0" max="10" 
                                   data-tipo="trex" data-jugador="${i}"
                                   onchange="calcularPuntos(${i})">
                        </section>
                        <section class="col-6">
                            <input type="number" class="form-control input-puntos" 
                                   placeholder="Tricerat." min="0" max="10" 
                                   data-tipo="triceratops" data-jugador="${i}"
                                   onchange="calcularPuntos(${i})">
                        </section>
                        <section class="col-6">
                            <input type="number" class="form-control input-puntos" 
                                   placeholder="Bronto." min="0" max="10" 
                                   data-tipo="brontosaurus" data-jugador="${i}"
                                   onchange="calcularPuntos(${i})">
                        </section>
                        <section class="col-6">
                            <input type="number" class="form-control input-puntos" 
                                   placeholder="Stego." min="0" max="10" 
                                   data-tipo="stegosaurus" data-jugador="${i}"
                                   onchange="calcularPuntos(${i})">
                        </section>
                    </section>
                </section>
                
                <section class="categoria-puntos mb-3">
                    <label class="form-label">🏆 Bonificaciones:</label>
                    <section class="row g-2">
                        <section class="col-12">
                            <input type="number" class="form-control input-puntos" 
                                   placeholder="Zonas completas" min="0" 
                                   data-tipo="zonasCompletas" data-jugador="${i}"
                                   onchange="calcularPuntos(${i})">
                        </section>
                        <section class="col-12">
                            <input type="number" class="form-control input-puntos" 
                                   placeholder="Parejas" min="0" 
                                   data-tipo="parejas" data-jugador="${i}"
                                   onchange="calcularPuntos(${i})">
                        </section>
                    </section>
                </section>
                
                <section class="total-jugador">
                    <strong>Total: <span id="total-jugador${i}">0</span> puntos</strong>
                </section>
            </section>
        `;
        
        contentContainer.appendChild(tabContent);
    }
    
    // Limpia y actualizar el display del ganador
    actualizarGanador();
}

// Calcula puntos para un jugador específico
function calcularPuntos(numJugador) {
    const jugadorKey = `jugador${numJugador}`;
    const contenedor = document.getElementById(`jugador${numJugador}`);
    const inputs = contenedor.querySelectorAll('.input-puntos');
    
    let puntuacion = estadoJuego.puntuaciones[jugadorKey];
    
    // Resetea puntuación
    puntuacion.trex = 0;
    puntuacion.triceratops = 0;
    puntuacion.brontosaurus = 0;
    puntuacion.stegosaurus = 0;
    puntuacion.zonasCompletas = 0;
    puntuacion.parejas = 0;
    
    // Recopila valores de los inputs
    inputs.forEach(input => {
        const tipo = input.getAttribute('data-tipo');
        const valor = parseInt(input.value) || 0;
        
        if (puntuacion.hasOwnProperty(tipo)) {
            puntuacion[tipo] = valor;
        }
    });
    
    // Calcula total según las reglas
    let total = 0;
    
    // Puntos por dinosaurios (según reglas del juego)
    const dinosaurios = [puntuacion.trex, puntuacion.triceratops, puntuacion.brontosaurus, puntuacion.stegosaurus];
    dinosaurios.forEach(cantidad => {
        if (cantidad >= 1) total += cantidad * cantidad; // Puntuación cuadrática típica de Draftosaurus
    });
    
    // Bonificaciones
    total += puntuacion.zonasCompletas * 7; // 7 puntos por zona completa
    total += puntuacion.parejas * 5; // 5 puntos por pareja
    
    puntuacion.total = total;
    
    // Actualiza display
    document.getElementById(`total-jugador${numJugador}`).textContent = total;
    
    // Actualiza ganador
    actualizarGanador();
}

// Actualiza el display del ganador
function actualizarGanador() {
    const ganadorDisplay = document.getElementById('ganador-display');
    
    if (!ganadorDisplay) return;
    
    let maxPuntos = -1;
    let ganador = null;
    let empate = false;
    
    // Encuentra el jugador con más puntos
    for (let i = 1; i <= estadoJuego.numJugadores; i++) {
        const jugadorKey = `jugador${i}`;
        const puntos = estadoJuego.puntuaciones[jugadorKey]?.total || 0;
        
        if (puntos > maxPuntos) {
            maxPuntos = puntos;
            ganador = i;
            empate = false;
        } else if (puntos === maxPuntos && puntos > 0) {
            empate = true;
        }
    }
    
    // Muestra resultado
    if (maxPuntos === 0) {
        ganadorDisplay.textContent = '¡Introduce los puntos para ver el ganador!';
        ganadorDisplay.className = 'ganador-texto';
    } else if (empate) {
        ganadorDisplay.textContent = `¡Empate con ${maxPuntos} puntos!`;
        ganadorDisplay.className = 'ganador-texto empate';
    } else {
        ganadorDisplay.textContent = `🏆 Jugador ${ganador} - ${maxPuntos} puntos`;
        ganadorDisplay.className = 'ganador-texto ganador';
    }
}

// Reinicia partida
function nuevaPartida() {
    // Confirma acción
    if (confirm('¿Estás seguro de que quieres iniciar una nueva partida? Se perderán todos los puntos actuales.')) {
        // Resetea puntuaciones
        inicializarPuntuaciones();
        
        // Limpia todos los inputs
        const inputs = document.querySelectorAll('.input-puntos');
        inputs.forEach(input => {
            input.value = '';
        });
        
        // Actualiza totales
        for (let i = 1; i <= estadoJuego.numJugadores; i++) {
            const totalElement = document.getElementById(`total-jugador${i}`);
            if (totalElement) {
                totalElement.textContent = '0';
            }
        }
        
        // Actualiza ganador
        actualizarGanador();
        
        // Actualiza estado
        document.getElementById('estado-juego').textContent = 'Nueva partida iniciada';
        
        console.log('Nueva partida iniciada');
    }
}

// Funciones de utilidad adicionales

// Exportar puntuaciones, nos va a servir para mas adealnte
function exportarPuntuaciones() {
    const data = {
        configuracion: {
            numJugadores: estadoJuego.numJugadores,
            modo: estadoJuego.modoJuego,
            fecha: new Date().toISOString()
        },
        puntuaciones: estadoJuego.puntuaciones
    };
    
    const jsonString = JSON.stringify(data, null, 2);
    console.log('Puntuaciones exportadas:', jsonString);
    
    // En el futuro se podría implementar descarga de archivo
    return jsonString;
}

// Validar entrada de puntos
function validarPuntos(input) {
    const valor = parseInt(input.value);
    const min = parseInt(input.getAttribute('min')) || 0;
    const max = parseInt(input.getAttribute('max')) || 999;
    
    if (isNaN(valor) || valor < min) {
        input.value = min;
    } else if (valor > max) {
        input.value = max;
    }
}

// Agrega validación a todos los inputs cuando se cargue la página
document.addEventListener('DOMContentLoaded', function() {
    inicializarJuego();
    
    // Agrega validación en tiempo real a los inputs
    document.addEventListener('input', function(e) {
        if (e.target.classList.contains('input-puntos')) {
            validarPuntos(e.target);
        }
    });
    
    console.log('Modo Auxiliar de Draftosaurus cargado completamente');
});

// Manejar atajos de teclado, usando eventos de teclado
document.addEventListener('keydown', function(e) {
    // Ctrl + N para nueva partida
    if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        nuevaPartida();
    }
    
    // Ctrl + E para exportar puntuaciones
    if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        exportarPuntuaciones();
    }
});

// Funciones para estadísticas (simuladas)
function obtenerEstadisticas() {
    const stats = {
        partidasJugadas: 1,
        promedioFinalJugadores: {},
        dinosaurioMasUsado: calcularDinosaurioMasUsado()
    };
    
    for (let i = 1; i <= estadoJuego.numJugadores; i++) {
        const jugadorKey = `jugador${i}`;
        stats.promedioFinalJugadores[jugadorKey] = estadoJuego.puntuaciones[jugadorKey].total;
    }
    
    return stats;
}

function calcularDinosaurioMasUsado() {
    const contadores = { trex: 0, triceratops: 0, brontosaurus: 0, stegosaurus: 0 };
    
    for (let i = 1; i <= estadoJuego.numJugadores; i++) {
        const jugadorKey = `jugador${i}`;
        const puntuacion = estadoJuego.puntuaciones[jugadorKey];
        
        contadores.trex += puntuacion.trex;
        contadores.triceratops += puntuacion.triceratops;
        contadores.brontosaurus += puntuacion.brontosaurus;
        contadores.stegosaurus += puntuacion.stegosaurus;
    }
    
    return Object.keys(contadores).reduce((a, b) => contadores[a] > contadores[b] ? a : b);
}