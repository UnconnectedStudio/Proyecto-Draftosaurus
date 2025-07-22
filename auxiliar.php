<?php
require_once 'config.php';

// Obtener todos los dinosaurios para los selectores
$consulta = $pdo->query("SELECT * FROM dinosaurios ORDER BY nombre");
$dinosaurios = $consulta->fetchAll();

// Definir recintos con sus reglas según Draftosaurus Summer
$recintosAuxiliar = [
    ['id' => 1, 'nombre' => 'Bosque de lo Mismo', 'regla' => 'BOSQUE_MISMO', 'descripcion' => 'Solo admite una especie. Se llena de izquierda a derecha. +1, +3, +6, +10 puntos por 1-4 dinosaurios.'],
    ['id' => 2, 'nombre' => 'Pradera de lo Diferente', 'regla' => 'PRADERA_DIFERENTE', 'descripcion' => 'Solo diferentes especies. +1, +3, +6, +10 puntos por 1-4 diferentes.'],
    ['id' => 3, 'nombre' => 'Pradera de Parejas', 'regla' => 'PRADERA_PAREJAS', 'descripcion' => 'Se forman parejas (2 del mismo tipo). +5 puntos por cada pareja.'],
    ['id' => 4, 'nombre' => 'Trío Arbóreo', 'regla' => 'TRIO_ARBOREO', 'descripcion' => 'Máximo 3 espacios. Solo da +7 puntos si está completamente lleno.'],
    ['id' => 5, 'nombre' => 'Rey de la Selva', 'regla' => 'REY_SELVA', 'descripcion' => 'Solo 1 dinosaurio. Si tienes tantos o más de esa especie que cualquier otro jugador, ganas +7 puntos.'],
    ['id' => 6, 'nombre' => 'Isla Solitaria', 'regla' => 'ISLA_SOLITARIA', 'descripcion' => 'Solo 1 dinosaurio. Si es el único de su especie en tu zoológico, suma +7 puntos.'],
    ['id' => 7, 'nombre' => 'El Río', 'regla' => 'RIO', 'descripcion' => 'Sin restricciones. Cada dinosaurio colocado allí otorga +1 punto.']
];
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Draftosaurus - Modo Auxiliar</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- CSS Modular - Mismos estilos que index.php -->
    <link rel="stylesheet" href="css/base.css">
    <link rel="stylesheet" href="css/components.css">
    <link rel="stylesheet" href="css/layout.css">
    <link rel="stylesheet" href="css/effects.css">
    <link rel="stylesheet" href="css/responsive.css">
</head>
<body>
    <!-- Header Principal -->
    <header class="bg-dark bg-opacity-75 border-bottom border-warning border-3 sticky-top shadow-lg">
        <div class="container-fluid py-3">
            <div class="row align-items-center g-3">
                <div class="col-auto">
                    <a href="index.php" class="btn btn-outline-info btn-lg rounded-pill px-4">
                        <i class="me-2">←</i>
                        <span>Volver</span>
                    </a>
                </div>
                <div class="col text-center">
                    <h1 class="display-5 fw-bold text-warning mb-0">
                        <span class="fs-1 me-2">🧮</span>
                        Calculadora de Puntos
                        <small class="d-block fs-6 text-info mt-1">Modo Auxiliar</small>
                    </h1>
                </div>
                <div class="col-auto">
                    <div class="bg-dark bg-opacity-50 border border-success border-2 rounded-pill px-4 py-2 text-center">
                        <small class="text-light d-block">Puntos:</small>
                        <span class="fs-4 fw-bold text-success" id="total-score">0</span>
                    </div>
                </div>
            </div>
        </div>
    </header>

    <!-- Contenido Principal -->
    <main class="py-5">
        <div class="container-fluid">
            <!-- Descripción -->
            <section class="mb-5">
                <div class="row justify-content-center">
                    <div class="col-lg-8">
                        <div class="card bg-dark bg-opacity-75 border-info border-2 shadow-lg">
                            <div class="card-body text-center py-4">
                                <p class="card-text fs-5 text-light mb-0 d-flex align-items-center justify-content-center flex-wrap gap-3">
                                    <span class="fs-2">🦕</span>
                                    <span>Configura tus recintos seleccionando dinosaurios y descubre cuántos puntos obtendrías en una partida real.</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Formulario de Recintos -->
            <form method="POST" action="calcular_auxiliar.php">
                <div class="row g-4">
                    <?php foreach ($recintosAuxiliar as $index => $recinto): ?>
                        <div class="col-lg-6 col-xl-4">
                            <div class="card bg-dark bg-opacity-75 border-warning border-2 h-100 shadow-lg position-relative overflow-hidden" data-recinto="<?php echo $recinto['id']; ?>">
                                <!-- Header del Recinto -->
                                <div class="card-header bg-transparent border-bottom border-warning d-flex align-items-start gap-3 p-3">
                                    <div class="bg-gradient bg-warning rounded-3 p-2 flex-shrink-0" style="width: 50px; height: 50px; display: flex; align-items: center; justify-content: center;">
                                        <span class="fs-3">
                                            <?php 
                                            $iconos = ['🌲', '🌿', '👥', '🌳', '👑', '🏝️', '🌊'];
                                            echo $iconos[$index] ?? '🦴';
                                            ?>
                                        </span>
                                    </div>
                                    <div class="flex-grow-1">
                                        <h5 class="card-title text-warning fw-bold mb-1"><?php echo htmlspecialchars($recinto['nombre']); ?></h5>
                                        <p class="card-text text-light small mb-0" style="font-size: 0.85rem; line-height: 1.3;">
                                            <?php echo htmlspecialchars($recinto['descripcion']); ?>
                                        </p>
                                    </div>
                                    <div class="flex-shrink-0">
                                        <span class="badge bg-info rounded-pill px-3 py-2" data-score="0">0 pts</span>
                                    </div>
                                </div>

                                <!-- Contenido del Recinto -->
                                <div class="card-body p-3">
                                    <div class="row g-2">
                                        <?php 
                                        $maxSlots = ($recinto['regla'] === 'TRIO_ARBOREO') ? 3 : 
                                                   (in_array($recinto['regla'], ['REY_SELVA', 'ISLA_SOLITARIA']) ? 1 : 6);
                                        
                                        for ($posicion = 1; $posicion <= $maxSlots; $posicion++): 
                                        ?>
                                            <div class="col-md-6 col-lg-12 col-xl-6">
                                                <div class="bg-dark bg-opacity-50 border border-info rounded p-2">
                                                    <label class="form-label text-info small fw-semibold mb-1">
                                                        Slot <?php echo $posicion; ?>
                                                    </label>
                                                    <select name="recinto_<?php echo $recinto['id']; ?>[]" 
                                                            class="form-select form-select-sm bg-dark text-light border-info" 
                                                            data-slot="<?php echo $posicion; ?>">
                                                        <option value="">🦴 Vacío</option>
                                                        <?php foreach ($dinosaurios as $dinosaurio): ?>
                                                            <option value="<?php echo $dinosaurio['id']; ?>" 
                                                                    data-tipo="<?php echo htmlspecialchars($dinosaurio['tipo']); ?>"
                                                                    data-familia="<?php echo htmlspecialchars($dinosaurio['familia']); ?>">
                                                                🦕 <?php echo htmlspecialchars($dinosaurio['nombre']); ?>
                                                            </option>
                                                        <?php endforeach; ?>
                                                    </select>
                                                </div>
                                            </div>
                                        <?php endfor; ?>
                                    </div>
                                </div>

                                <!-- Campos ocultos -->
                                <input type="hidden" name="regla_<?php echo $recinto['id']; ?>" value="<?php echo $recinto['regla']; ?>">
                                <input type="hidden" name="nombre_<?php echo $recinto['id']; ?>" value="<?php echo htmlspecialchars($recinto['nombre']); ?>">
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>

                <!-- Acciones del Formulario -->
                <section class="mt-5 py-4 border-top border-warning bg-dark bg-opacity-50 rounded-3">
                    <div class="d-flex justify-content-center gap-4 flex-wrap">
                        <button type="button" class="btn btn-outline-warning btn-lg px-4 py-3 rounded-pill" onclick="resetearFormulario()">
                            <span class="me-2 fs-5">🔄</span>
                            Limpiar Todo
                        </button>
                        <button type="submit" class="btn btn-warning btn-lg px-5 py-3 rounded-pill fw-bold text-dark">
                            <span class="me-2 fs-5">🧮</span>
                            CALCULAR PUNTOS
                        </button>
                    </div>
                </section>
            </form>
        </div>
    </main>

    <!-- Panel de Instrucciones (Colapsible) -->
    <aside class="bg-dark bg-opacity-75 border-top border-warning border-3 mt-5">
        <div class="container-fluid">
            <button class="btn btn-link text-decoration-none w-100 py-4 text-light fs-5 fw-semibold d-flex align-items-center justify-content-center gap-3" 
                    type="button" 
                    data-bs-toggle="collapse" 
                    data-bs-target="#instructionsCollapse" 
                    aria-expanded="false" 
                    aria-controls="instructionsCollapse">
                <span class="fs-4">📋</span>
                <span>Guía de Recintos</span>
                <span class="ms-auto">▼</span>
            </button>
            
            <div class="collapse" id="instructionsCollapse">
                <div class="pb-5 px-3">
                    <div class="row g-4">
                        <div class="col-md-6 col-lg-4 col-xl-3">
                            <div class="card bg-dark bg-opacity-50 border-info border-2 h-100 text-center">
                                <div class="card-body p-3">
                                    <div class="fs-1 mb-2">🌲</div>
                                    <h6 class="card-title text-warning fw-bold">Bosque de lo Mismo</h6>
                                    <p class="card-text text-light small mb-0">Una sola especie. Puntos progresivos: 1→1, 2→3, 3→6, 4→10</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6 col-lg-4 col-xl-3">
                            <div class="card bg-dark bg-opacity-50 border-info border-2 h-100 text-center">
                                <div class="card-body p-3">
                                    <div class="fs-1 mb-2">🌿</div>
                                    <h6 class="card-title text-warning fw-bold">Pradera de lo Diferente</h6>
                                    <p class="card-text text-light small mb-0">Solo especies diferentes. Puntos: 1→1, 2→3, 3→6, 4→10</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6 col-lg-4 col-xl-3">
                            <div class="card bg-dark bg-opacity-50 border-info border-2 h-100 text-center">
                                <div class="card-body p-3">
                                    <div class="fs-1 mb-2">👥</div>
                                    <h6 class="card-title text-warning fw-bold">Pradera de Parejas</h6>
                                    <p class="card-text text-light small mb-0">Forma parejas idénticas. +5 puntos por cada pareja completa</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6 col-lg-4 col-xl-3">
                            <div class="card bg-dark bg-opacity-50 border-info border-2 h-100 text-center">
                                <div class="card-body p-3">
                                    <div class="fs-1 mb-2">🌳</div>
                                    <h6 class="card-title text-warning fw-bold">Trío Arbóreo</h6>
                                    <p class="card-text text-light small mb-0">Máximo 3 espacios. Solo da +7 puntos si está completamente lleno</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6 col-lg-4 col-xl-3">
                            <div class="card bg-dark bg-opacity-50 border-info border-2 h-100 text-center">
                                <div class="card-body p-3">
                                    <div class="fs-1 mb-2">👑</div>
                                    <h6 class="card-title text-warning fw-bold">Rey de la Selva</h6>
                                    <p class="card-text text-light small mb-0">Solo 1 dinosaurio. +7 puntos si tienes mayoría de esa especie</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6 col-lg-4 col-xl-3">
                            <div class="card bg-dark bg-opacity-50 border-info border-2 h-100 text-center">
                                <div class="card-body p-3">
                                    <div class="fs-1 mb-2">🏝️</div>
                                    <h6 class="card-title text-warning fw-bold">Isla Solitaria</h6>
                                    <p class="card-text text-light small mb-0">Solo 1 dinosaurio. +7 puntos si es único en tu zoológico</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6 col-lg-4 col-xl-3">
                            <div class="card bg-dark bg-opacity-50 border-info border-2 h-100 text-center">
                                <div class="card-body p-3">
                                    <div class="fs-1 mb-2">🌊</div>
                                    <h6 class="card-title text-warning fw-bold">El Río</h6>
                                    <p class="card-text text-light small mb-0">Sin restricciones. +1 punto por cada dinosaurio colocado</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6 col-lg-4 col-xl-3">
                            <div class="card bg-warning bg-opacity-25 border-warning border-2 h-100 text-center">
                                <div class="card-body p-3">
                                    <div class="fs-1 mb-2">🦖</div>
                                    <h6 class="card-title text-warning fw-bold">Bonus T-Rex</h6>
                                    <p class="card-text text-light small mb-0">+1 punto extra por cada recinto con al menos un T-Rex</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </aside>

    <!-- Footer -->
    <footer class="bg-dark bg-opacity-75 border-top border-warning border-2 py-4 text-center">
        <div class="container">
            <p class="text-light mb-0 d-flex align-items-center justify-content-center gap-3 flex-wrap">
                <span class="fs-4">🦕</span>
                <span class="fw-semibold">Draftosaurus - Modo Auxiliar</span>
                <span class="badge bg-info rounded-pill px-3 py-1">v0.2</span>
            </p>
        </div>
    </footer>

    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        // Función para resetear el formulario
        function resetearFormulario() {
            if (confirm('¿Estás seguro de que quieres limpiar todos los recintos?')) {
                document.querySelector('form').reset();
                actualizarPuntuaciones();
            }
        }

        // Función para actualizar puntuaciones en tiempo real (placeholder)
        function actualizarPuntuaciones() {
            // Esta función se puede expandir para calcular puntos en tiempo real
            document.getElementById('total-score').textContent = '0';
            document.querySelectorAll('[data-score]').forEach(badge => {
                badge.textContent = '0 pts';
                badge.setAttribute('data-score', '0');
            });
        }

        // Actualizar flecha del colapso de instrucciones
        document.addEventListener('DOMContentLoaded', function() {
            const collapseElement = document.getElementById('instructionsCollapse');
            const arrowElement = document.querySelector('.ms-auto');
            
            collapseElement.addEventListener('show.bs.collapse', function () {
                arrowElement.textContent = '▲';
            });
            
            collapseElement.addEventListener('hide.bs.collapse', function () {
                arrowElement.textContent = '▼';
            });
        });
    </script>
</body>
</html>