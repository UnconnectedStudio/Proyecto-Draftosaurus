<?php
require_once 'config.php';

// Verificar que hay una partida activa
if (!isset($_SESSION['id_partida']) || !isset($_POST['id_dinosaurio']) || !isset($_POST['id_recinto'])) {
    header("Location: partida.php");
    exit;
}

$idPartida = $_SESSION['id_partida'];
$idJugador = $_SESSION['id_jugador'];
$idDinosaurio = $_POST['id_dinosaurio'];
$idRecinto = $_POST['id_recinto'];
$ronda = $_SESSION['ronda'];
$turno = $_SESSION['turno'];
$totalRondas = $_SESSION['total_rondas'];
$turnosPorRonda = $_SESSION['turnos_por_ronda'];

// Verificar que el dinosaurio está en la mano actual
if (!in_array($idDinosaurio, $_SESSION['mano_actual'])) {
    header("Location: partida.php?error=dinosaurio_no_disponible");
    exit;
}

// Obtener información del dinosaurio y recinto
$consulta = $pdo->prepare("SELECT * FROM dinosaurios WHERE id = ?");
$consulta->execute([$idDinosaurio]);
$dinosaurio = $consulta->fetch();

$consulta = $pdo->prepare("SELECT * FROM recintos WHERE id = ?");
$consulta->execute([$idRecinto]);
$recinto = $consulta->fetch();

// Verificar espacio en el recinto
$consulta = $pdo->prepare("SELECT COUNT(*) as cantidad FROM colocaciones WHERE recinto_id = ? AND jugador_id = ?");
$consulta->execute([$idRecinto, $idJugador]);
$cantidadActual = $consulta->fetchColumn();

if ($cantidadActual >= $recinto['max_dinos']) {
    header("Location: partida.php?error=recinto_lleno");
    exit;
}

// Validar reglas específicas del recinto según Draftosaurus Summer
$puedeColocar = true;
$mensajeError = "";

switch ($recinto['regla_codigo']) {
    case 'BOSQUE_MISMO':
        // Solo admite una especie
        $consulta = $pdo->prepare("
            SELECT DISTINCT d.familia 
            FROM colocaciones c 
            JOIN dinosaurios d ON c.dinosaurio_id = d.id 
            WHERE c.recinto_id = ? AND c.jugador_id = ?
        ");
        $consulta->execute([$idRecinto, $idJugador]);
        $familiasExistentes = $consulta->fetchAll(PDO::FETCH_COLUMN);
        
        if (!empty($familiasExistentes) && !in_array($dinosaurio['familia'], $familiasExistentes)) {
            $puedeColocar = false;
            $mensajeError = "Bosque de lo Mismo solo acepta una especie: " . $familiasExistentes[0];
        }
        break;
        
    case 'PRADERA_DIFERENTE':
        // Solo diferentes especies
        $consulta = $pdo->prepare("
            SELECT DISTINCT d.familia 
            FROM colocaciones c 
            JOIN dinosaurios d ON c.dinosaurio_id = d.id 
            WHERE c.recinto_id = ? AND c.jugador_id = ?
        ");
        $consulta->execute([$idRecinto, $idJugador]);
        $familiasExistentes = $consulta->fetchAll(PDO::FETCH_COLUMN);
        
        if (in_array($dinosaurio['familia'], $familiasExistentes)) {
            $puedeColocar = false;
            $mensajeError = "Pradera de lo Diferente requiere especies diferentes";
        }
        break;
        
    case 'REY_SELVA':
    case 'ISLA_SOLITARIA':
        // Solo 1 dinosaurio
        if ($cantidadActual >= 1) {
            $puedeColocar = false;
            $mensajeError = "Este recinto solo admite 1 dinosaurio";
        }
        break;
}

// Verificar restricciones del dado (si no es el jugador con el dado)
$consulta = $pdo->prepare("SELECT restriccion FROM dado_restricciones WHERE partida_id = ? AND ronda = ? AND turno = ?");
$consulta->execute([$idPartida, $ronda, $turno]);
$restriccionDado = $consulta->fetchColumn();

if ($restriccionDado) {
    switch ($restriccionDado) {
        case 'BOSQUE':
            // Solo recintos del bosque (lado izquierdo)
            if (!in_array($recinto['regla_codigo'], ['BOSQUE_MISMO', 'TRIO_ARBOREO', 'REY_SELVA'])) {
                $puedeColocar = false;
                $mensajeError = "Restricción del dado: solo recintos del bosque";
            }
            break;
            
        case 'PRADERA':
            // Solo recintos de pradera (lado derecho)
            if (!in_array($recinto['regla_codigo'], ['PRADERA_DIFERENTE', 'PRADERA_PAREJAS', 'ISLA_SOLITARIA'])) {
                $puedeColocar = false;
                $mensajeError = "Restricción del dado: solo recintos de pradera";
            }
            break;
            
        case 'RECINTO_VACIO':
            // Solo recintos vacíos
            if ($cantidadActual > 0) {
                $puedeColocar = false;
                $mensajeError = "Restricción del dado: solo recintos vacíos";
            }
            break;
            
        case 'SIN_TREX':
            // Solo recintos sin T-Rex
            $consulta = $pdo->prepare("
                SELECT COUNT(*) 
                FROM colocaciones c 
                JOIN dinosaurios d ON c.dinosaurio_id = d.id 
                WHERE c.recinto_id = ? AND c.jugador_id = ? AND d.familia = 'T-Rex'
            ");
            $consulta->execute([$idRecinto, $idJugador]);
            $conteoTrex = $consulta->fetchColumn();
            
            if ($conteoTrex > 0) {
                $puedeColocar = false;
                $mensajeError = "Restricción del dado: no se puede colocar en recintos con T-Rex";
            }
            break;
    }
}

if (!$puedeColocar) {
    header("Location: partida.php?error=" . urlencode($mensajeError));
    exit;
}

// Colocar el dinosaurio
$consulta = $pdo->prepare("INSERT INTO colocaciones (jugador_id, recinto_id, dinosaurio_id, ronda, turno) VALUES (?, ?, ?, ?, ?)");
$consulta->execute([$idJugador, $idRecinto, $idDinosaurio, $ronda, $turno]);

// Remover dinosaurio de la mano actual
$manoActual = $_SESSION['mano_actual'];
$clave = array_search($idDinosaurio, $manoActual);
if ($clave !== false) {
    unset($manoActual[$clave]);
    $_SESSION['mano_actual'] = array_values($manoActual);
}

// Avanzar turno
$_SESSION['turno']++;

// Si se acabaron los turnos de la ronda
if ($_SESSION['turno'] > $turnosPorRonda) {
    $_SESSION['ronda']++;
    $_SESSION['turno'] = 1;
    
    // Si no hemos llegado al final del juego, generar nueva mano
    if ($_SESSION['ronda'] <= $totalRondas) {
        $consulta = $pdo->query("SELECT id FROM dinosaurios ORDER BY RAND() LIMIT 6");
        $nuevaMano = $consulta->fetchAll(PDO::FETCH_COLUMN);
        $_SESSION['mano_actual'] = $nuevaMano;
        
        // Generar nueva restricción del dado
        $restriccionesDado = ['BOSQUE', 'PRADERA', 'ZONA_BANOS', 'ZONA_COMEDOR', 'RECINTO_VACIO', 'SIN_TREX'];
        $nuevaRestriccion = $restriccionesDado[array_rand($restriccionesDado)];
        
        $descripciones = [
            'BOSQUE' => 'Bosque: solo se puede colocar en recintos del bosque (lado izquierdo del río).',
            'PRADERA' => 'Pradera: solo se puede colocar en recintos de pradera (lado derecho).',
            'ZONA_BANOS' => 'Zona de baños: solo en recintos a la derecha del río.',
            'ZONA_COMEDOR' => 'Zona de comedor: solo en recintos a la izquierda del río.',
            'RECINTO_VACIO' => 'Recinto vacío: solo en recintos que no tengan ningún dinosaurio.',
            'SIN_TREX' => 'Sin T-Rex: solo en recintos que no tengan un T-Rex.'
        ];
        
        $consulta = $pdo->prepare("INSERT INTO dado_restricciones (partida_id, ronda, turno, restriccion, descripcion) VALUES (?, ?, ?, ?, ?)");
        $consulta->execute([$idPartida, $_SESSION['ronda'], 1, $nuevaRestriccion, $descripciones[$nuevaRestriccion]]);
    }
} else {
    // Generar nueva restricción del dado para el siguiente turno
    $restriccionesDado = ['BOSQUE', 'PRADERA', 'ZONA_BANOS', 'ZONA_COMEDOR', 'RECINTO_VACIO', 'SIN_TREX'];
    $nuevaRestriccion = $restriccionesDado[array_rand($restriccionesDado)];
    
    $descripciones = [
        'BOSQUE' => 'Bosque: solo se puede colocar en recintos del bosque (lado izquierdo del río).',
        'PRADERA' => 'Pradera: solo se puede colocar en recintos de pradera (lado derecho).',
        'ZONA_BANOS' => 'Zona de baños: solo en recintos a la derecha del río.',
        'ZONA_COMEDOR' => 'Zona de comedor: solo en recintos a la izquierda del río.',
        'RECINTO_VACIO' => 'Recinto vacío: solo en recintos que no tengan ningún dinosaurio.',
        'SIN_TREX' => 'Sin T-Rex: solo en recintos que no tengan un T-Rex.'
    ];
    
    $consulta = $pdo->prepare("INSERT INTO dado_restricciones (partida_id, ronda, turno, restriccion, descripcion) VALUES (?, ?, ?, ?, ?)");
    $consulta->execute([$idPartida, $ronda, $_SESSION['turno'], $nuevaRestriccion, $descripciones[$nuevaRestriccion]]);
}

// Redirigir de vuelta a la partida
header("Location: partida.php");
exit;
?>