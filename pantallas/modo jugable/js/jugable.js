// Variables para almacenar puntajes
let puntajes = {
    puntos: 0,
    partidas: 0,
    nivel: 0
};

// Genera dinosaurios dinámicamente, nos servira para el futuro
function generarDinosaurios() {
    const grid = document.getElementById('grid-dinosaurios');
    const tipos = ['🦕', '🦖', '🦖', '🦕', '🦖', '🔥'];
    
    grid.innerHTML = '';
    
    for (let i = 0; i < 5; i++) {
        const dino = document.createElement('section');
        dino.className = 'dinosaurio';
        dino.textContent = tipos[i];
        dino.onclick = () => seleccionarDinosaurio(i, tipos[i]);
        grid.appendChild(dino);
    }
    
    document.getElementById('dinos-restantes').textContent = '10';
}

function seleccionarDinosaurio(index, tipo) {
    const tablero = document.getElementById('tablero-principal');
    tablero.innerHTML = `<section style="font-size: 4rem;">${tipo}</section><section>Dinosaurio seleccionado</section>`;
    
    // Quita el dinosaurio seleccionado
    const dinosaurios = document.querySelectorAll('.dinosaurio');
    dinosaurios[index].style.opacity = '0.3';
    dinosaurios[index].style.pointerEvents = 'none';
    
    // Actualiza contador
    const restantes = parseInt(document.getElementById('dinos-restantes').textContent) - 1;
    document.getElementById('dinos-restantes').textContent = restantes;
    
    // Actualizar puntos (simulado)
    puntajes.puntos += 10;
    actualizarPuntajes();
    
    // Simular cambio de turno
    setTimeout(() => {
        const turno = parseInt(document.getElementById('turno-actual').textContent) + 1;
        document.getElementById('turno-actual').textContent = turno;
    }, 1000);
}

function mezclarDinosaurios() {
    generarDinosaurios();
    document.getElementById('tablero-principal').textContent = 'Tablero';
}

function resetearJuego() {
    generarDinosaurios();
    document.getElementById('tablero-principal').textContent = 'Tablero';
    document.getElementById('turno-actual').textContent = '1';
    document.getElementById('jugador-actual').textContent = 'Tu turno';
    
    // Actualiza estadísticas
    puntajes.partidas += 1;
    if (puntajes.partidas % 3 === 0) {
        puntajes.nivel += 1;
    }
    actualizarPuntajes();
}

function actualizarPuntajes() {
    document.getElementById('puntos-totales').textContent = puntajes.puntos;
    document.getElementById('partidas-jugadas').textContent = puntajes.partidas;
    document.getElementById('nivel-jugador').textContent = puntajes.nivel;
}

function mostrarEstadisticas() {
    alert(`Estadísticas del Jugador:
🏆 Puntos Totales: ${puntajes.puntos}
🎯 Partidas Jugadas: ${puntajes.partidas}
⭐ Nivel Actual: ${puntajes.nivel}
🎮 Promedio por partida: ${puntajes.partidas > 0 ? Math.round(puntajes.puntos / puntajes.partidas) : 0}`);
}

// Inicia auto al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    generarDinosaurios();
    actualizarPuntajes();
});