<?php
session_start();
require_once 'config.php';

// Verificar que hay una partida activa
if (!isset($_SESSION['partida_id'])) {
    header('Location: index.php');
    exit;
}

$partida_id = $_SESSION['partida_id'];

// Obtener datos de la partida
$stmt = $pdo->prepare("SELECT * FROM partidas WHERE id = ?");
$stmt->execute([$partida_id]);
$partida = $stmt->fetch();

if (!$partida) {
    header('Location: index.php');
    exit;
}

// Obtener dinosaurios disponibles para esta partida
$stmt = $pdo->prepare("
    SELECT pd.*, d.nombre, d.imagen, d.habitat_correcto 
    FROM partida_dinosaurios pd 
    JOIN dinosaurios d ON pd.dinosaurio_id = d.id 
    WHERE pd.partida_id = ? AND pd.colocado = 0
    ORDER BY d.nombre
");
$stmt->execute([$partida_id]);
$dinosaurios = $stmt->fetchAll();

// Obtener zonas del mapa
$zonas_mapa = [
    'bosque' => ['top' => 15, 'left' => 20, 'width' => 25, 'height' => 30],
    'desierto' => ['top' => 50, 'left' => 10, 'width' => 30, 'height' => 25],
    'montaña' => ['top' => 10, 'left' => 60, 'width' => 20, 'height' => 35],
    'oceano' => ['top' => 70, 'left' => 40, 'width' => 40, 'height' => 25],
    'pantano' => ['top' => 30, 'left' => 45, 'width' => 15, 'height' => 20]
];
?>

<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Partida - Juego de Dinosaurios</title>
    <link rel="stylesheet" href="css/base.css">
    <link rel="stylesheet" href="css/components.css">
    <link rel="stylesheet" href="css/tablero.css">
    <style>
        .game-container {
            display: grid;
            grid-template-columns: 1fr 300px;
            gap: 20px;
            height: 100vh;
            padding: 20px;
            box-sizing: border-box;
        }

        .mapa-container {
            position: relative;
            background: url('recursos/img/mapa-prehistorico.jpg') center/cover;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .drop-zone {
            position: absolute;
            border: 2px dashed transparent;
            border-radius: 8px;
            transition: all 0.3s ease;
            cursor: pointer;
        }

        .drop-zone:hover {
            border-color: rgba(255, 255, 255, 0.5);
            background: rgba(255, 255, 255, 0.1);
        }

        .drop-zone.drag-over {
            border-color: #4CAF50;
            background: rgba(76, 175, 80, 0.2);
            transform: scale(1.05);
        }

        .drop-zone.invalid {
            border-color: #f44336;
            background: rgba(244, 67, 54, 0.2);
        }

        .dinosaurios-panel {
            background: linear-gradient(135deg, #2c3e50, #34495e);
            border-radius: 12px;
            padding: 20px;
            overflow-y: auto;
        }

        .panel-header {
            color: white;
            font-size: 1.2em;
            font-weight: bold;
            margin-bottom: 20px;
            text-align: center;
        }

        .dinosaurio-item {
            display: flex;
            align-items: center;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 10px;
            cursor: grab;
            transition: all 0.3s ease;
            border: 2px solid transparent;
        }

        .dinosaurio-item:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: translateX(-5px);
        }

        .dinosaurio-item.dragging {
            opacity: 0.5;
            cursor: grabbing;
        }

        .dino-imagen {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            margin-right: 12px;
            object-fit: cover;
        }

        .dino-info {
            flex: 1;
            color: white;
        }

        .dino-nombre {
            font-weight: bold;
            margin-bottom: 4px;
        }

        .dino-habitat {
            font-size: 0.8em;
            opacity: 0.7;
        }

        .game-stats {
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 15px;
            border-radius: 8px;
            z-index: 1000;
        }

        .feedback-message {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            padding: 20px 40px;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            z-index: 2000;
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .feedback-success {
            background: #4CAF50;
        }

        .feedback-error {
            background: #f44336;
        }

        @media (max-width: 768px) {
            .game-container {
                grid-template-columns: 1fr;
                grid-template-rows: 1fr auto;
            }

            .dinosaurios-panel {
                max-height: 200px;
            }
        }
    </style>
</head>

<body>
    <div class="game-stats">
        <div>Puntos: <span id="puntos-actuales"><?= $partida['puntos'] ?></span></div>
        <div>Dinosaurios restantes: <span id="dinos-restantes"><?= count($dinosaurios) ?></span></div>
    </div>

    <div class="game-container">
        <!-- Mapa Interactivo -->
        <div class="mapa-container" id="mapa-container">
            <?php foreach ($zonas_mapa as $zona => $coords): ?>
                <div class="drop-zone"
                    data-zona="<?= $zona ?>"
                    style="top: <?= $coords['top'] ?>%; left: <?= $coords['left'] ?>%; width: <?= $coords['width'] ?>%; height: <?= $coords['height'] ?>%;"
                    title="Zona: <?= ucfirst($zona) ?>">
                </div>
            <?php endforeach; ?>
        </div>

        <!-- Panel de Dinosaurios -->
        <div class="dinosaurios-panel">
            <div class="panel-header">
                Dinosaurios Disponibles
            </div>
            <div id="lista-dinosaurios">
                <?php foreach ($dinosaurios as $dino): ?>
                    <div class="dinosaurio-item"
                        draggable="true"
                        data-dino-id="<?= $dino['dinosaurio_id'] ?>"
                        data-habitat="<?= $dino['habitat_correcto'] ?>">
                        <img src="recursos/img/dinosaurios/<?= $dino['imagen'] ?>"
                            alt="<?= $dino['nombre'] ?>"
                            class="dino-imagen">
                        <div class="dino-info">
                            <div class="dino-nombre"><?= $dino['nombre'] ?></div>
                            <div class="dino-habitat">Hábitat: <?= ucfirst($dino['habitat_correcto']) ?></div>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
    </div>

    <div id="feedback-message" class="feedback-message"></div>

    <script>
        class DragDropGame {
            constructor() {
                this.currentDragElement = null;
                this.init();
            }

            init() {
                this.setupDragAndDrop();
                this.setupDropZones();
            }

            setupDragAndDrop() {
                const dinosaurios = document.querySelectorAll('.dinosaurio-item');

                dinosaurios.forEach(dino => {
                    dino.addEventListener('dragstart', (e) => {
                        this.currentDragElement = e.target;
                        e.target.classList.add('dragging');

                        // Almacenar datos del dinosaurio
                        e.dataTransfer.setData('text/plain', JSON.stringify({
                            dinoId: e.target.dataset.dinoId,
                            habitat: e.target.dataset.habitat
                        }));

                        e.dataTransfer.effectAllowed = 'move';
                    });

                    dino.addEventListener('dragend', (e) => {
                        e.target.classList.remove('dragging');
                        this.currentDragElement = null;
                    });
                });
            }

            setupDropZones() {
                const dropZones = document.querySelectorAll('.drop-zone');

                dropZones.forEach(zone => {
                    zone.addEventListener('dragover', (e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';

                        if (!zone.classList.contains('drag-over')) {
                            zone.classList.add('drag-over');
                        }
                    });

                    zone.addEventListener('dragleave', (e) => {
                        zone.classList.remove('drag-over', 'invalid');
                    });

                    zone.addEventListener('drop', (e) => {
                        e.preventDefault();
                        zone.classList.remove('drag-over');

                        try {
                            const data = JSON.parse(e.dataTransfer.getData('text/plain'));
                            const zonaDestino = zone.dataset.zona;

                            this.procesarColocacion(data.dinoId, data.habitat, zonaDestino, zone);
                        } catch (error) {
                            console.error('Error al procesar drop:', error);
                            this.mostrarFeedback('Error al procesar la acción', 'error');
                        }
                    });
                });
            }

            async procesarColocacion(dinoId, habitatCorrecto, zonaDestino, dropZone) {
                const esCorrecta = habitatCorrecto === zonaDestino;

                if (!esCorrecta) {
                    dropZone.classList.add('invalid');
                    this.mostrarFeedback('¡Zona incorrecta! Intenta con otro hábitat', 'error');
                    setTimeout(() => dropZone.classList.remove('invalid'), 1000);
                    return;
                }

                try {
                    const response = await fetch('colocar_dino.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            partida_id: <?= $partida_id ?>,
                            dinosaurio_id: dinoId,
                            zona: zonaDestino
                        })
                    });

                    const result = await response.json();

                    if (result.success) {
                        this.animarColocacionExitosa(dinoId, result.puntos);
                        this.actualizarEstadisticas(result.puntos, result.dinosaurios_restantes);

                        if (result.partida_completada) {
                            setTimeout(() => {
                                alert(`¡Partida completada! Puntuación final: ${result.puntos}`);
                                window.location.href = 'index.php';
                            }, 1500);
                        }
                    } else {
                        this.mostrarFeedback(result.message || 'Error al colocar dinosaurio', 'error');
                    }
                } catch (error) {
                    console.error('Error en la petición:', error);
                    this.mostrarFeedback('Error de conexión', 'error');
                }
            }

            animarColocacionExitosa(dinoId, puntos) {
                const dinoElement = document.querySelector(`[data-dino-id="${dinoId}"]`);
                if (dinoElement) {
                    dinoElement.style.transition = 'all 0.5s ease';
                    dinoElement.style.transform = 'scale(0)';
                    dinoElement.style.opacity = '0';

                    setTimeout(() => {
                        dinoElement.remove();
                    }, 500);
                }

                this.mostrarFeedback(`¡Correcto! +${puntos} puntos`, 'success');
            }

            actualizarEstadisticas(puntos, dinosauriosRestantes) {
                document.getElementById('puntos-actuales').textContent = puntos;
                document.getElementById('dinos-restantes').textContent = dinosauriosRestantes;
            }

            mostrarFeedback(mensaje, tipo) {
                const feedbackEl = document.getElementById('feedback-message');
                feedbackEl.textContent = mensaje;
                feedbackEl.className = `feedback-message feedback-${tipo}`;
                feedbackEl.style.opacity = '1';

                setTimeout(() => {
                    feedbackEl.style.opacity = '0';
                }, 2000);
            }
        }

        // Inicializar el juego cuando se carga la página
        document.addEventListener('DOMContentLoaded', () => {
            new DragDropGame();
        });
    </script>
</body>

</html>