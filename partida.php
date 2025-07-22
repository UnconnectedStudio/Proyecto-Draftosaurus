<?php
require_once 'config.php';

// Verificar que hay una partida activa
if (!isset($_SESSION['id_partida'])) {
    header("Location: index.php");
    exit;
}

$idPartida = $_SESSION['id_partida'];
$idJugador = $_SESSION['id_jugador'];
$ronda = $_SESSION['ronda'];
$turno = $_SESSION['turno'];
$totalRondas = $_SESSION['total_rondas'];
$turnosPorRonda = $_SESSION['turnos_por_ronda'];

// Obtener información del jugador
$consulta = $pdo->prepare("SELECT nombre FROM jugadores WHERE id = ?");
$consulta->execute([$idJugador]);
$jugador = $consulta->fetch();

// Obtener dinosaurios de la mano actual
$manoActual = $_SESSION['mano_actual'];
if (!empty($manoActual)) {
    $marcadoresPosicion = str_repeat('?,', count($manoActual) - 1) . '?';
    $consulta = $pdo->prepare("SELECT * FROM dinosaurios WHERE id IN ($marcadoresPosicion)");
    $consulta->execute($manoActual);
    $dinosauriosMano = $consulta->fetchAll();
} else {
    $dinosauriosMano = [];
}

// Obtener recintos del jugador
$consulta = $pdo->prepare("SELECT * FROM recintos WHERE partida_id = ?");
$consulta->execute([$idPartida]);
$recintos = $consulta->fetchAll();

// Obtener colocaciones actuales
$consulta = $pdo->prepare("
    SELECT c.*, d.nombre as nombre_dinosaurio, d.familia as familia_dinosaurio, r.nombre as nombre_recinto 
    FROM colocaciones c 
    JOIN dinosaurios d ON c.dinosaurio_id = d.id 
    JOIN recintos r ON c.recinto_id = r.id 
    WHERE c.jugador_id = ? 
    ORDER BY c.fecha DESC
");
$consulta->execute([$idJugador]);
$colocaciones = $consulta->fetchAll();

// Contar dinosaurios por recinto
$dinosauriosPorRecinto = [];
foreach ($colocaciones as $colocacion) {
    if (!isset($dinosauriosPorRecinto[$colocacion['recinto_id']])) {
        $dinosauriosPorRecinto[$colocacion['recinto_id']] = 0;
    }
    $dinosauriosPorRecinto[$colocacion['recinto_id']]++;
}

// Obtener restricción actual del dado
$consulta = $pdo->prepare("SELECT * FROM dado_restricciones WHERE partida_id = ? AND ronda = ? AND turno = ?");
$consulta->execute([$idPartida, $ronda, $turno]);
$restriccionDado = $consulta->fetch();

// Calcular total de colocaciones (12 en total: 2 rondas × 6 turnos)
$totalColocaciones = count($colocaciones);
$colocacionesRestantes = ($totalRondas * $turnosPorRonda) - $totalColocaciones;
?>

<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Draftosaurus - Partida</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- CSS Modular -->
    <link rel="stylesheet" href="css/base.css">
    <link rel="stylesheet" href="css/components.css">
    <link rel="stylesheet" href="css/layout.css">
    <link rel="stylesheet" href="css/effects.css">
    <link rel="stylesheet" href="css/responsive.css">
    <link rel="stylesheet" href="css/tablero.css">
    <link rel="stylesheet" href="css/dados.css">
    <link rel="stylesheet" href="css/juego-moderno.css">
    <link rel="stylesheet" href="css/draft-system.css">
    <link rel="stylesheet" href="css/styles.css">
</head>

<body>
    <div class="container">
        <header>
            <h1>🦕 Draftosaurus - Modo Summer</h1>
            <div class="informacion-juego">
                <p>Jugador: <strong><?php echo htmlspecialchars($jugador['nombre']); ?></strong></p>
                <p>Ronda: <strong><?php echo $ronda; ?>/<?php echo $totalRondas; ?></strong></p>
                <p>Turno: <strong><?php echo $turno; ?>/<?php echo $turnosPorRonda; ?></strong></p>
                <p>Colocaciones restantes: <strong><?php echo $colocacionesRestantes; ?></strong></p>
            </div>

            <?php if ($restriccionDado): ?>
                <div class="restriccion-dado">
                    <h3>🎲 Restricción del Dado:</h3>
                    <p><strong><?php echo htmlspecialchars($restriccionDado['descripcion']); ?></strong></p>
                    <small>Esta restricción se aplica a todos los jugadores excepto al que tiene el dado.</small>
                </div>
            <?php endif; ?>
        </header>

        <?php if ($colocacionesRestantes <= 0): ?>
            <div class="juego-completado">
                <h2>🎉 ¡Partida Completada!</h2>
                <form method="POST" action="calcular_puntos.php">
                    <input type="submit" value="Calcular Puntos Finales" class="boton-primario">
                </form>
            </div>
        <?php else: ?>
            <!-- Tablero Visual Mejorado -->
            <div class="tablero-juego-moderno">
                <!-- El tablero visual se generará aquí por JavaScript -->
                <div id="tablero-container-placeholder"></div>
                
                <!-- Panel de Dinosaurios -->
                <div class="panel-dinosaurios">
                    <div class="panel-header">
                        <h2>🦴 Dinosaurios Disponibles</h2>
                        <div class="contador-mano">
                            <span class="badge bg-primary"><?php echo count($dinosauriosMano); ?> disponibles</span>
                        </div>
                    </div>
                    
                    <div class="tarjetas-dinosaurio-grid">
                        <?php foreach ($dinosauriosMano as $dinosaurio): ?>
                            <div class="tarjeta-dinosaurio-moderna" data-id-dinosaurio="<?php echo $dinosaurio['id']; ?>">
                                <div class="dinosaurio-icono-grande">
                                    <?php 
                                    $iconos = [
                                        'T-Rex' => '🦖',
                                        'Stegosaurus' => '🦕',
                                        'Triceratops' => '🦴',
                                        'Raptor' => '🦅',
                                        'Sauropodo' => '🦕',
                                        'Allosaurus' => '🐊'
                                    ];
                                    echo $iconos[$dinosaurio['familia']] ?? '🦕';
                                    ?>
                                </div>
                                <div class="dinosaurio-info">
                                    <h3><?php echo htmlspecialchars($dinosaurio['nombre']); ?></h3>
                                    <div class="dinosaurio-detalles">
                                        <span class="tipo-badge tipo-<?php echo strtolower($dinosaurio['tipo']); ?>">
                                            <?php echo htmlspecialchars($dinosaurio['tipo']); ?>
                                        </span>
                                        <span class="familia-text"><?php echo htmlspecialchars($dinosaurio['familia']); ?></span>
                                    </div>
                                </div>
                                <button type="button" class="boton-seleccionar-moderno" data-dinosaurio-id="<?php echo $dinosaurio['id']; ?>">
                                    <span class="boton-texto">Seleccionar</span>
                                    <span class="boton-icono">✓</span>
                                </button>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>

                <!-- Formulario oculto para compatibilidad -->
                <form method="POST" action="colocar_dino.php" id="formulario-colocacion" style="display: none;">
                    <input type="hidden" name="id_dinosaurio" id="dinosaurio-seleccionado" value="">
                    <input type="hidden" name="id_recinto" id="recinto-seleccionado" value="">
                </form>

                <!-- Panel de Control -->
                <div class="panel-control">
                    <button type="button" id="boton-confirmar" class="btn btn-success btn-lg" disabled>
                        <span class="me-2">🎯</span>
                        Confirmar Colocación
                    </button>
                    <button type="button" id="boton-resetear" class="btn btn-outline-warning">
                        <span class="me-2">🔄</span>
                        Resetear Selección
                    </button>
                </div>

                <!-- Información de Recintos (para referencia) -->
                <div class="recintos-data" style="display: none;">
                    <?php foreach ($recintos as $recinto): ?>
                        <div class="recinto-data" 
                             data-id="<?php echo $recinto['id']; ?>"
                             data-nombre="<?php echo htmlspecialchars($recinto['nombre']); ?>"
                             data-regla="<?php echo $recinto['regla_codigo']; ?>"
                             data-max-dinos="<?php echo $recinto['max_dinos']; ?>"
                             data-descripcion="<?php echo htmlspecialchars($recinto['descripcion']); ?>">
                            
                            <div class="colocaciones-existentes">
                                <?php foreach ($colocaciones as $colocacion): ?>
                                    <?php if ($colocacion['recinto_id'] == $recinto['id']): ?>
                                        <span class="dinosaurio-colocado" 
                                              data-familia="<?php echo htmlspecialchars($colocacion['familia_dinosaurio']); ?>">
                                            <?php echo htmlspecialchars($colocacion['nombre_dinosaurio']); ?>
                                        </span>
                                    <?php endif; ?>
                                <?php endforeach; ?>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>
        <?php endif; ?>

        <div class="acciones">
            <a href="auxiliar.php" class="boton-secundario">Modo Auxiliar</a>
            <a href="index.php" class="boton-secundario">Nueva Partida</a>
        </div>
    </div>

    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script type="module">
        import { GestorJuego } from './js/modules/gestor-juego.js';
        
        // Inicializar el juego cuando el DOM esté listo
        document.addEventListener('DOMContentLoaded', async () => {
            try {
                const gestorJuego = new GestorJuego();
                await gestorJuego.inicializar();
                
                // Hacer el gestor accesible globalmente para debugging
                window.gestorJuego = gestorJuego;
                
                console.log('🎮 Juego inicializado correctamente');
            } catch (error) {
                console.error('❌ Error inicializando el juego:', error);
                
                // Fallback al sistema básico si falla el avanzado
                inicializarSistemaBasico();
            }
        });
        
        // Sistema básico de fallback
        function inicializarSistemaBasico() {
            console.log('🔄 Iniciando sistema básico de fallback...');
            
            let dinosaurioSeleccionado = null;
            let recintoSeleccionado = null;

            // Eventos para dinosaurios
            document.querySelectorAll('.boton-seleccionar-moderno').forEach(boton => {
                boton.addEventListener('click', (e) => {
                    const dinosaurioId = parseInt(e.target.closest('[data-id-dinosaurio]').dataset.idDinosaurio);
                    seleccionarDinosaurio(dinosaurioId);
                });
            });

            // Eventos para botón de confirmar
            document.getElementById('boton-confirmar')?.addEventListener('click', () => {
                if (dinosaurioSeleccionado && recintoSeleccionado) {
                    document.getElementById('formulario-colocacion').submit();
                }
            });

            // Evento para resetear
            document.getElementById('boton-resetear')?.addEventListener('click', () => {
                resetearSelecciones();
            });

            function seleccionarDinosaurio(idDinosaurio) {
                dinosaurioSeleccionado = idDinosaurio;
                document.getElementById('dinosaurio-seleccionado').value = idDinosaurio;

                // Resaltar dinosaurio seleccionado
                document.querySelectorAll('.tarjeta-dinosaurio-moderna').forEach(tarjeta => {
                    tarjeta.classList.remove('seleccionado');
                });
                document.querySelector(`[data-id-dinosaurio="${idDinosaurio}"]`)?.classList.add('seleccionado');

                verificarPuedeConfirmar();
            }

            function seleccionarRecinto(idRecinto) {
                recintoSeleccionado = idRecinto;
                document.getElementById('recinto-seleccionado').value = idRecinto;
                verificarPuedeConfirmar();
            }

            function verificarPuedeConfirmar() {
                const botonConfirmar = document.getElementById('boton-confirmar');
                if (botonConfirmar) {
                    botonConfirmar.disabled = !(dinosaurioSeleccionado && recintoSeleccionado);
                }
            }

            function resetearSelecciones() {
                dinosaurioSeleccionado = null;
                recintoSeleccionado = null;
                
                document.querySelectorAll('.tarjeta-dinosaurio-moderna').forEach(tarjeta => {
                    tarjeta.classList.remove('seleccionado');
                });
                
                document.getElementById('dinosaurio-seleccionado').value = '';
                document.getElementById('recinto-seleccionado').value = '';
                
                verificarPuedeConfirmar();
            }

            // Hacer funciones accesibles globalmente
            window.seleccionarRecinto = seleccionarRecinto;
        }
    </script>
</body>

</html>