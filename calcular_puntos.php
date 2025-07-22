<?php
require_once 'config.php';

// Verificar que hay una partida activa
if (!isset($_SESSION['id_partida'])) {
    header("Location: index.php");
    exit;
}

$idPartida = $_SESSION['id_partida'];
$idJugador = $_SESSION['id_jugador'];

// Obtener información del jugador
$consulta = $pdo->prepare("SELECT nombre FROM jugadores WHERE id = ?");
$consulta->execute([$idJugador]);
$jugador = $consulta->fetch();

// Obtener todos los recintos y sus colocaciones
$consulta = $pdo->prepare("
    SELECT r.*, 
           GROUP_CONCAT(d.id) as ids_dinosaurios,
           GROUP_CONCAT(d.nombre) as nombres_dinosaurios,
           GROUP_CONCAT(d.tipo) as tipos_dinosaurios,
           GROUP_CONCAT(d.familia) as familias_dinosaurios
    FROM recintos r
    LEFT JOIN colocaciones c ON r.id = c.recinto_id AND c.jugador_id = ?
    LEFT JOIN dinosaurios d ON c.dinosaurio_id = d.id
    WHERE r.partida_id = ?
    GROUP BY r.id
");
$consulta->execute([$idJugador, $idPartida]);
$recintosConDinosaurios = $consulta->fetchAll();

$puntuacionTotal = 0;
$detallesPuntuacion = [];
$bonusTrex = 0;

// Obtener todas las colocaciones para calcular especies únicas
$consulta = $pdo->prepare("
    SELECT d.familia, COUNT(*) as cantidad
    FROM colocaciones c 
    JOIN dinosaurios d ON c.dinosaurio_id = d.id 
    WHERE c.jugador_id = ?
    GROUP BY d.familia
");
$consulta->execute([$idJugador]);
$especiesEnZoologico = $consulta->fetchAll(PDO::FETCH_KEY_PAIR);

foreach ($recintosConDinosaurios as $recinto) {
    $puntosRecinto = 0;
    $detalle = "";
    
    if ($recinto['ids_dinosaurios']) {
        $idsDinosaurios = explode(',', $recinto['ids_dinosaurios']);
        $nombresDinosaurios = explode(',', $recinto['nombres_dinosaurios']);
        $tiposDinosaurios = explode(',', $recinto['tipos_dinosaurios']);
        $familiasDinosaurios = explode(',', $recinto['familias_dinosaurios']);
        $cantidadDinosaurios = count($idsDinosaurios);
        
        switch ($recinto['regla_codigo']) {
            case 'BOSQUE_MISMO':
                // Solo admite una especie. +1, +3, +6, +10 puntos por 1-4 dinosaurios
                $familiasUnicas = array_unique($familiasDinosaurios);
                if (count($familiasUnicas) == 1) {
                    $tablasPuntos = [1 => 1, 2 => 3, 3 => 6, 4 => 10];
                    $puntosRecinto = $tablasPuntos[$cantidadDinosaurios] ?? 0;
                    $detalle = "Todos de la familia {$familiasUnicas[0]}: {$cantidadDinosaurios} dinosaurios = {$puntosRecinto} pts";
                } else {
                    $detalle = "Familias mezcladas, no se otorgan puntos";
                }
                break;
                
            case 'PRADERA_DIFERENTE':
                // Solo diferentes especies. +1, +3, +6, +10 puntos por 1-4 diferentes
                $familiasUnicas = array_unique($familiasDinosaurios);
                if (count($familiasUnicas) == $cantidadDinosaurios) {
                    $tablasPuntos = [1 => 1, 2 => 3, 3 => 6, 4 => 10];
                    $puntosRecinto = $tablasPuntos[count($familiasUnicas)] ?? 0;
                    $detalle = count($familiasUnicas) . " especies diferentes = {$puntosRecinto} pts";
                } else {
                    $detalle = "Especies repetidas, no se otorgan puntos";
                }
                break;
                
            case 'PRADERA_PAREJAS':
                // Se forman parejas (2 del mismo tipo). +5 puntos por cada pareja
                $conteoFamilias = array_count_values($familiasDinosaurios);
                $pares = 0;
                foreach ($conteoFamilias as $familia => $cantidad) {
                    $pares += floor($cantidad / 2);
                }
                $puntosRecinto = $pares * 5;
                $detalle = "{$pares} parejas × 5 = {$puntosRecinto} pts";
                break;
                
            case 'TRIO_ARBOREO':
                // Máximo 3 espacios. Solo da +7 puntos si está completamente lleno
                if ($cantidadDinosaurios == 3) {
                    $puntosRecinto = 7;
                    $detalle = "Trío completo: 7 pts";
                } else {
                    $detalle = "Trío incompleto ({$cantidadDinosaurios}/3), no se otorgan puntos";
                }
                break;
                
            case 'REY_SELVA':
                // Solo 1 dinosaurio. Si tienes tantos o más de esa especie que cualquier otro jugador, ganas +7 puntos
                if ($cantidadDinosaurios == 1) {
                    $familiaRey = $familiasDinosaurios[0];
                    // En modo single player, siempre gana los puntos
                    $puntosRecinto = 7;
                    $detalle = "Rey de la Selva ({$familiaRey}): 7 pts";
                } else {
                    $detalle = "Debe tener exactamente 1 dinosaurio";
                }
                break;
                
            case 'ISLA_SOLITARIA':
                // Solo 1 dinosaurio. Si es el único de su especie en tu zoológico, suma +7 puntos
                if ($cantidadDinosaurios == 1) {
                    $familiaSolitaria = $familiasDinosaurios[0];
                    if ($especiesEnZoologico[$familiaSolitaria] == 1) {
                        $puntosRecinto = 7;
                        $detalle = "Isla Solitaria ({$familiaSolitaria} único): 7 pts";
                    } else {
                        $detalle = "No es único en el zoológico ({$especiesEnZoologico[$familiaSolitaria]} total)";
                    }
                } else {
                    $detalle = "Debe tener exactamente 1 dinosaurio";
                }
                break;
                
            case 'RIO':
                // Sin restricciones. Cada dinosaurio colocado allí otorga +1 punto
                $puntosRecinto = $cantidadDinosaurios;
                $detalle = "{$cantidadDinosaurios} dinosaurios en el río × 1 = {$puntosRecinto} pts";
                break;
        }
        
        // Calcular bonus de T-Rex para este recinto
        $trexEnRecinto = 0;
        foreach ($familiasDinosaurios as $familia) {
            if ($familia === 'T-Rex') {
                $trexEnRecinto++;
                break; // Solo cuenta una vez por recinto
            }
        }
        if ($trexEnRecinto > 0) {
            $bonusTrex += 1;
        }
        
    } else {
        $detalle = "Sin dinosaurios colocados";
    }
    
    $detallesPuntuacion[] = [
        'nombre' => $recinto['nombre'],
        'puntos' => $puntosRecinto,
        'detalle' => $detalle,
        'dinosaurios' => $recinto['nombres_dinosaurios'] ? explode(',', $recinto['nombres_dinosaurios']) : []
    ];
    
    $puntuacionTotal += $puntosRecinto;
}

// Agregar bonus de T-Rex
$puntuacionTotal += $bonusTrex;

// Marcar partida como finalizada
$consulta = $pdo->prepare("UPDATE partidas SET estado = 'finalizada' WHERE id = ?");
$consulta->execute([$idPartida]);
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Draftosaurus - Puntuación Final</title>
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>
    <div class="container">
        <header>
            <h1>🏆 Puntuación Final</h1>
            <p>Jugador: <strong><?php echo htmlspecialchars($jugador['nombre']); ?></strong></p>
        </header>

        <div class="puntuacion-final">
            <h2>Puntuación Total: <span class="puntos-totales"><?php echo $puntuacionTotal; ?> puntos</span></h2>
        </div>

        <div class="desglose-puntuacion">
            <h3>Desglose por Recinto:</h3>
            
            <?php foreach ($detallesPuntuacion as $detalle): ?>
                <div class="puntuacion-recinto">
                    <h4><?php echo htmlspecialchars($detalle['nombre']); ?> - <?php echo $detalle['puntos']; ?> pts</h4>
                    <p class="detalle-puntuacion"><?php echo htmlspecialchars($detalle['detalle']); ?></p>
                    
                    <?php if (!empty($detalle['dinosaurios'])): ?>
                        <div class="dinosaurios-colocados">
                            <strong>Dinosaurios:</strong>
                            <?php foreach ($detalle['dinosaurios'] as $dinosaurio): ?>
                                <span class="etiqueta-dinosaurio"><?php echo htmlspecialchars($dinosaurio); ?></span>
                            <?php endforeach; ?>
                        </div>
                    <?php endif; ?>
                </div>
            <?php endforeach; ?>
            
            <?php if ($bonusTrex > 0): ?>
                <div class="puntuacion-recinto seccion-bonus">
                    <h4>🦖 Bonus de T-Rex - <?php echo $bonusTrex; ?> pts</h4>
                    <p class="detalle-puntuacion">Cada recinto que contenga al menos 1 T-Rex otorga +1 punto extra.</p>
                </div>
            <?php endif; ?>
        </div>

        <div class="acciones">
            <a href="index.php" class="boton-primario">Nueva Partida</a>
            <a href="auxiliar.php" class="boton-secundario">Modo Auxiliar</a>
        </div>
    </div>
</body>
</html>