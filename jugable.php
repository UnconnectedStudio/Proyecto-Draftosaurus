<?php
require_once 'config.php';

// Verificar si hay una partida activa
if (isset($_SESSION['id_partida'])) {
    // Si hay una partida activa, redirigir a partida.php
    header("Location: partida.php");
    exit;
}

// Si no hay partida activa, mostrar interfaz para crear nueva partida
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Draftosaurus - Modo Jugable</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- CSS Modular -->
    <link rel="stylesheet" href="css/base.css">
    <link rel="stylesheet" href="css/components.css">
    <link rel="stylesheet" href="css/layout.css">
    <link rel="stylesheet" href="css/effects.css">
    <link rel="stylesheet" href="css/responsive.css">
</head>

<body>
    <!-- Header Principal -->
    <header class="bg-dark bg-opacity-75 border-bottom border-success border-3 sticky-top shadow-lg">
        <div class="container-fluid py-3">
            <div class="row align-items-center g-3">
                <div class="col-auto">
                    <a href="index.php" class="btn btn-outline-info btn-lg rounded-pill px-4">
                        <i class="me-2">←</i>
                        <span>Volver</span>
                    </a>
                </div>
                <div class="col text-center">
                    <h1 class="display-5 fw-bold text-success mb-0">
                        <span class="fs-1 me-2">Dino</span>
                        Modo Jugable
                        <small class="d-block fs-6 text-info mt-1">Draftosaurus Summer</small>
                    </h1>
                </div>
                <div class="col-auto">
                    <div class="bg-dark bg-opacity-50 border border-success border-2 rounded-pill px-4 py-2 text-center">
                        <small class="text-light d-block">Versión:</small>
                        <span class="fs-6 fw-bold text-success">0.2</span>
                    </div>
                </div>
            </div>
        </div>
    </header>

    <!-- Contenido Principal -->
    <main class="py-5">
        <div class="container">
            <!-- Descripción del Modo Jugable -->
            <section class="mb-5">
                <div class="row justify-content-center">
                    <div class="col-lg-8">
                        <div class="card bg-dark bg-opacity-75 border-success border-2 shadow-lg">
                            <div class="card-body text-center py-4">
                                <div class="mb-4">
                                    <img src="recursos/img/jugableLOGO.png" alt="Logo Modo Jugable" class="img-fluid" style="max-height: 120px;">
                                </div>
                                <h2 class="card-title text-success fw-bold mb-3">¡Bienvenido al Modo Jugable!</h2>
                                <p class="card-text fs-5 text-light mb-4">
                                    Experimenta una partida completa de Draftosaurus en su versión Summer. 
                                    Gestiona tu zoológico de dinosaurios a través de 2 rondas emocionantes 
                                    con mecánicas de draft y estrategia.
                                </p>
                                
                                <!-- Características del Juego -->
                                <div class="row g-3 mb-4">
                                    <div class="col-md-3 col-6">
                                        <div class="bg-success bg-opacity-25 rounded-3 p-3 h-100">
                                            <div class="fs-2 mb-2">Rondas</div>
                                            <div class="fw-bold text-success">2 Rondas</div>
                                            <small class="text-light">6 turnos cada una</small>
                                        </div>
                                    </div>
                                    <div class="col-md-3 col-6">
                                        <div class="bg-success bg-opacity-25 rounded-3 p-3 h-100">
                                            <div class="fs-2 mb-2">Especies</div>
                                            <div class="fw-bold text-success">12 Especies</div>
                                            <small class="text-light">Diferentes tipos</small>
                                        </div>
                                    </div>
                                    <div class="col-md-3 col-6">
                                        <div class="bg-success bg-opacity-25 rounded-3 p-3 h-100">
                                            <div class="fs-2 mb-2">Recintos</div>
                                            <div class="fw-bold text-success">7 Recintos</div>
                                            <small class="text-light">Reglas únicas</small>
                                        </div>
                                    </div>
                                    <div class="col-md-3 col-6">
                                        <div class="bg-success bg-opacity-25 rounded-3 p-3 h-100">
                                            <div class="fs-2 mb-2">Puntos</div>
                                            <div class="fw-bold text-success">Puntuación</div>
                                            <small class="text-light">Automática</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Formulario Nueva Partida -->
            <section class="mb-5">
                <div class="row justify-content-center">
                    <div class="col-lg-6 col-md-8">
                        <div class="card bg-dark bg-opacity-75 border-success border-2 shadow-lg">
                            <div class="card-header bg-transparent border-bottom border-success text-center py-3">
                                <h3 class="card-title text-success fw-bold mb-0">
                                    <span class="fs-2 me-2">Juego</span>
                                    Nueva Partida
                                </h3>
                            </div>
                            <div class="card-body p-4">
                                <form method="POST" action="nueva_partida.php" id="form-nueva-partida">
                                    <div class="mb-4">
                                        <label for="nombre" class="form-label text-light fw-semibold fs-5">
                                            <span class="me-2">Jugador</span>
                                            Nombre del Jugador
                                        </label>
                                        <input type="text" 
                                               class="form-control form-control-lg bg-dark text-light border-success" 
                                               id="nombre" 
                                               name="nombre" 
                                               placeholder="Ingresa tu nombre..." 
                                               required 
                                               maxlength="50"
                                               autocomplete="name">
                                    </div>
                                    
                                    <div class="d-grid gap-3">
                                        <button type="submit" class="btn btn-success btn-lg py-3 fw-bold">
                                            <span class="fs-4 me-2">Iniciar</span>
                                            COMENZAR PARTIDA
                                        </button>
                                        
                                        <div class="text-center">
                                            <small class="text-light">
                                                <span class="me-2">Tiempo:</span>
                                                Duración estimada: 10-15 minutos
                                            </small>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Instrucciones Rápidas -->
            <section class="mb-5">
                <div class="row justify-content-center">
                    <div class="col-lg-10">
                        <div class="card bg-dark bg-opacity-50 border-info border-2">
                            <div class="card-header bg-transparent border-bottom border-info">
                                <button class="btn btn-link text-decoration-none w-100 py-3 text-light fs-5 fw-semibold d-flex align-items-center justify-content-center gap-3" 
                                        type="button" 
                                        data-bs-toggle="collapse" 
                                        data-bs-target="#instructionsCollapse" 
                                        aria-expanded="false" 
                                        aria-controls="instructionsCollapse">
                                    <span class="fs-3">Manual</span>
                                    <span>¿Cómo se juega?</span>
                                    <span class="ms-auto">▼</span>
                                </button>
                            </div>
                            
                            <div class="collapse" id="instructionsCollapse">
                                <div class="card-body p-4">
                                    <div class="row g-4">
                                        <div class="col-md-6">
                                            <h5 class="text-info fw-bold mb-3">
                                                <span class="me-2">Meta:</span>
                                                Objetivo
                                            </h5>
                                            <p class="text-light">
                                                Coloca estratégicamente dinosaurios en tus recintos para obtener 
                                                la mayor puntuación posible. Cada recinto tiene reglas específicas 
                                                que determinan cómo se calculan los puntos.
                                            </p>
                                        </div>
                                        
                                        <div class="col-md-6">
                                            <h5 class="text-info fw-bold mb-3">
                                                <span class="me-2">Juego:</span>
                                                Mecánica
                                            </h5>
                                            <p class="text-light">
                                                En cada turno recibirás 6 dinosaurios. Selecciona uno y colócalo 
                                                en un recinto válido. Después de 6 turnos, comienza la segunda ronda. 
                                                Al final se calculan automáticamente tus puntos.
                                            </p>
                                        </div>
                                        
                                        <div class="col-md-6">
                                            <h5 class="text-info fw-bold mb-3">
                                                <span class="me-2">Reglas:</span>
                                                Restricciones
                                            </h5>
                                            <p class="text-light">
                                                Algunos turnos tendrán restricciones del dado que limitan dónde 
                                                puedes colocar dinosaurios. Estas restricciones añaden desafío 
                                                estratégico al juego.
                                            </p>
                                        </div>
                                        
                                        <div class="col-md-6">
                                            <h5 class="text-info fw-bold mb-3">
                                                <span class="me-2">Puntos:</span>
                                                Puntuación
                                            </h5>
                                            <p class="text-light">
                                                Cada recinto puntúa de manera diferente: algunos premian la 
                                                diversidad, otros la especialización. Además, hay bonificaciones 
                                                especiales por tener T-Rex en tus recintos.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </main>

    <!-- Footer -->
    <footer class="bg-dark bg-opacity-75 border-top border-success border-2 py-4 text-center">
        <div class="container">
            <p class="text-light mb-0 d-flex align-items-center justify-content-center gap-3 flex-wrap">
                <span class="fs-4">Dino</span>
                <span class="fw-semibold">Draftosaurus - Modo Jugable</span>
                <span class="badge bg-success rounded-pill px-3 py-1">v0.2</span>
            </p>
        </div>
    </footer>

    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        // Validación del formulario
        document.getElementById('form-nueva-partida').addEventListener('submit', function(e) {
            const nombreInput = document.getElementById('nombre');
            const nombre = nombreInput.value.trim();
            
            if (nombre.length < 2) {
                e.preventDefault();
                alert('El nombre debe tener al menos 2 caracteres.');
                nombreInput.focus();
                return false;
            }
            
            if (nombre.length > 50) {
                e.preventDefault();
                alert('El nombre no puede tener más de 50 caracteres.');
                nombreInput.focus();
                return false;
            }
            
            // Mostrar indicador de carga
            const submitBtn = e.target.querySelector('button[type="submit"]');
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Creando partida...';
            submitBtn.disabled = true;
        });

        // Actualizar flecha del colapso de instrucciones
        document.addEventListener('DOMContentLoaded', function() {
            const collapseElement = document.getElementById('instructionsCollapse');
            const arrowElement = document.querySelector('.ms-auto');
            
            if (collapseElement && arrowElement) {
                collapseElement.addEventListener('show.bs.collapse', function () {
                    arrowElement.textContent = '▲';
                });
                
                collapseElement.addEventListener('hide.bs.collapse', function () {
                    arrowElement.textContent = '▼';
                });
            }
        });

        // Auto-focus en el campo de nombre
        document.addEventListener('DOMContentLoaded', function() {
            const nombreInput = document.getElementById('nombre');
            if (nombreInput) {
                nombreInput.focus();
            }
        });
    </script>
</body>

</html>