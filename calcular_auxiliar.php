<?php
require_once 'config.php';

// Verificar que se recibieron datos del formulario
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header("Location: auxiliar.php");
    exit;
}

$puntuacionTotal = 0;
$detallesPuntuacion = [];
$bonusTrex = 0;

// Recopilar todas las especies para calcular Isla Solitaria
$todasEspecies = [];

// Procesar cada recinto (1 a 7)
for ($idRecinto = 1; $idRecinto <= 7; $idRecinto++) {
    $idsDinosaurios = isset($_POST["recinto_{$idRecinto}"]) ? $_POST["recinto_{$idRecinto}"] : [];
    $regla = $_POST["regla_{$idRecinto}"];
    $nombreRecinto = $_POST["nombre_{$idRecinto}"];
    
    // Filtrar IDs vacíos
    $idsDinosaurios = array_filter($idsDinosaurios, function($id) { return !empty($id); });
    
    $puntosRecinto = 0;
    $detalle = "";
    $informacionDinosaurios = [];
    
    if (!empty($idsDinosaurios)) {
        // Obtener información de los dinosaurios seleccionados
        $marcadoresPosicion = str_repeat('?,', count($idsDinosaurios) - 1) . '?';
        $consulta = $pdo->prepare("SELECT * FROM dinosaurios WHERE id IN ($marcadoresPosicion)");
        $consulta->execute($idsDinosaurios);
        $informacionDinosaurios = $consulta->fetchAll();
        
        $cantidadDinosaurios = count($informacionDinosaurios);
        $nombresDinosaurios = array_column($informacionDinosaurios, 'nombre');
        $tiposDinosaurios = array_column($informacionDinosaurios, 'tipo');
        $familiasDinosaurios = array_column($informacionDinosaurios, 'familia');
        
        // Agregar especies al conteo global
        foreach ($familiasDinosaurios as $familia) {
            if (!isset($todasEspecies[$familia])) {
                $todasEspecies[$familia] = 0;
            }
            $todasEspecies[$familia]++;
        }
        
        switch ($regla) {
            case 'BOSQUE_MISMO':
                // Solo admite una especie. +1, +3, +6, +10 puntos por 1-4 dinosaurios
                $familiasUnicas = array_unique($familiasDinosaurios);
                if (count($familiasUnicas) == 1) {
                    $tablasPuntos = [1 => 1, 2 => 3, 3 => 6, 4 => 10];
                    $puntosRecinto = $tablasPuntos[$cantidadDinosaurios] ?? 0;
                    $detalle = "Todos de la familia {$familiasUnicas[0]}: {$cantidadDinosaurios} dinosaurios = {$puntosRecinto} pts";
                } else {
                    $detalle = "Familias mezcladas (" . implode(', ', $familiasUnicas) . "), no se otorgan puntos";
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
                    $detalle = "Especies repetidas (" . implode(', ', $familiasUnicas) . "), no se otorgan puntos";
                }
                break;
                
            case 'PRADERA_PAREJAS':
                // Se forman parejas (2 del mismo tipo). +5 puntos por cada pareja
                $conteoFamilias = array_count_values($familiasDinosaurios);
                $pares = 0;
                $detallePares = [];
                foreach ($conteoFamilias as $familia => $cantidad) {
                    $paresFamilia = floor($cantidad / 2);
                    $pares += $paresFamilia;
                    if ($paresFamilia > 0) {
                        $detallePares[] = "{$familia}: {$paresFamilia} par(es)";
                    }
                }
                $puntosRecinto = $pares * 5;
                $detalle = empty($detallePares) ? "Sin pares formados" : implode(', ', $detallePares) . " = {$pares} pares × 5 = {$puntosRecinto} pts";
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
                    // En modo auxiliar, asumimos que siempre gana los puntos
                    $puntosRecinto = 7;
                    $detalle = "Rey de la Selva ({$familiaRey}): 7 pts";
                } else {
                    $detalle = "Debe tener exactamente 1 dinosaurio";
                }
                break;
                
            case 'ISLA_SOLITARIA':
                // Solo 1 dinosaurio. Si es el único de su especie en tu zoológico, suma +7 puntos
                // Nota: Se calculará después de procesar todos los recintos
                if ($cantidadDinosaurios == 1) {
                    $detalle = "Pendiente de verificar si es único en el zoológico";
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
        $trexEnRecinto = false;
        foreach ($familiasDinosaurios as $familia) {
            if ($familia === 'T-Rex') {
                $trexEnRecinto = true;
                break;
            }
        }
        if ($trexEnRecinto) {
            $bonusTrex += 1;
        }
        
    } else {
        $detalle = "Sin dinosaurios colocados";
    }
    
    $detallesPuntuacion[] = [
        'nombre' => $nombreRecinto,
        'puntos' => $puntosRecinto,
        'detalle' => $detalle,
        'dinosaurios' => $informacionDinosaurios,
        'regla' => $regla
    ];
    
    $puntuacionTotal += $puntosRecinto;
}

// Recalcular Isla Solitaria ahora que tenemos todas las especies
foreach ($detallesPuntuacion as &$detallePuntuacion) {
    if ($detallePuntuacion['regla'] === 'ISLA_SOLITARIA' && !empty($detallePuntuacion['dinosaurios'])) {
        if (count($detallePuntuacion['dinosaurios']) == 1) {
            $familiaSolitaria = $detallePuntuacion['dinosaurios'][0]['familia'];
            if ($todasEspecies[$familiaSolitaria] == 1) {
                $detallePuntuacion['puntos'] = 7;
                $detallePuntuacion['detalle'] = "Isla Solitaria ({$familiaSolitaria} único): 7 pts";
                $puntuacionTotal += 7;
            } else {
                $detallePuntuacion['detalle'] = "No es único en el zoológico ({$todasEspecies[$familiaSolitaria]} total)";
            }
        }
    }
}

// Agregar bonus de T-Rex
$puntuacionTotal += $bonusTrex;
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Draftosaurus - Resultado Auxiliar</title>
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>
    <div class="container">
        <header>
            <h1>🧮 Resultado del Cálculo</h1>
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
                            <strong>Dinosaurios seleccionados:</strong>
                            <?php foreach ($detalle['dinosaurios'] as $dinosaurio): ?>
                                <span class="etiqueta-dinosaurio">
                                    <?php echo htmlspecialchars($dinosaurio['nombre']); ?> 
                                    (<?php echo htmlspecialchars($dinosaurio['tipo']); ?>)
                                </span>
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
            <a href="auxiliar.php" class="boton-primario">Calcular Otra Combinación</a>
            <a href="index.php" class="boton-secundario">Nueva Partida</a>
        </div>

        <div class="consejos">
            <h3>💡 Consejos para mejorar tu puntuación - Draftosaurus Summer:</h3>
            <ul>
                <li>En el <strong>Bosque de lo Mismo</strong>, llena con 4 dinosaurios de la misma especie para obtener 10 puntos.</li>
                <li>En la <strong>Pradera de lo Diferente</strong>, coloca 4 especies diferentes para obtener 10 puntos.</li>
                <li>En la <strong>Pradera de Parejas</strong>, maximiza las parejas - 3 parejas te dan 15 puntos.</li>
                <li>El <strong>Trío Arbóreo</strong> solo da puntos si está completamente lleno (3 dinosaurios = 7 puntos).</li>
                <li>Para <strong>Rey de la Selva</strong> e <strong>Isla Solitaria</strong>, planifica cuidadosamente qué especie usar.</li>
                <li><strong>El Río</strong> es perfecto para dinosaurios que no encajan en otros recintos.</li>
                <li>Coloca T-Rex estratégicamente para obtener bonus de +1 punto por recinto.</li>
            </ul>
        </div>
    </div>
</body>
</html>