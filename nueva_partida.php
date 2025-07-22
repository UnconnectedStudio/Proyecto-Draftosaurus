<?php
require_once 'config.php';

// Crear nueva partida
$consulta = $pdo->prepare("INSERT INTO partidas (fecha_inicio, estado) VALUES (NOW(), 'jugando')");
$consulta->execute();
$idPartida = $pdo->lastInsertId();

// Crear jugador
$nombreJugador = isset($_POST['nombre']) ? $_POST['nombre'] : 'Jugador 1';
$consulta = $pdo->prepare("INSERT INTO jugadores (nombre, partida_id) VALUES (?, ?)");
$consulta->execute([$nombreJugador, $idPartida]);
$idJugador = $pdo->lastInsertId();

// Crear recintos del tablero Summer según las reglas de Draftosaurus
$recintos = [
    ['Bosque de lo Mismo', 4, 'BOSQUE_MISMO', 'Solo admite una especie. Se llena de izquierda a derecha. +1, +3, +6, +10 puntos por 1-4 dinosaurios.'],
    ['Pradera de lo Diferente', 4, 'PRADERA_DIFERENTE', 'Solo diferentes especies. +1, +3, +6, +10 puntos por 1-4 diferentes.'],
    ['Pradera de Parejas', 6, 'PRADERA_PAREJAS', 'Se forman parejas (2 del mismo tipo). +5 puntos por cada pareja.'],
    ['Trío Arbóreo', 3, 'TRIO_ARBOREO', 'Máximo 3 espacios. Solo da +7 puntos si está completamente lleno.'],
    ['Rey de la Selva', 1, 'REY_SELVA', 'Solo 1 dinosaurio. Si tienes tantos o más de esa especie que cualquier otro jugador, ganas +7 puntos.'],
    ['Isla Solitaria', 1, 'ISLA_SOLITARIA', 'Solo 1 dinosaurio. Si es el único de su especie en tu zoológico, suma +7 puntos.'],
    ['El Río', 99, 'RIO', 'Sin restricciones. Cada dinosaurio colocado allí otorga +1 punto.']
];

foreach ($recintos as $recinto) {
    $consulta = $pdo->prepare("INSERT INTO recintos (partida_id, nombre, max_dinos, regla_codigo, descripcion) VALUES (?, ?, ?, ?, ?)");
    $consulta->execute([$idPartida, $recinto[0], $recinto[1], $recinto[2], $recinto[3]]);
}

// Guardar IDs en sesión
$_SESSION['id_partida'] = $idPartida;
$_SESSION['id_jugador'] = $idJugador;
$_SESSION['ronda'] = 1;
$_SESSION['turno'] = 1;
$_SESSION['total_rondas'] = 2;
$_SESSION['turnos_por_ronda'] = 6;

// Generar primera mano de 6 dinosaurios aleatorios
$consulta = $pdo->query("SELECT id FROM dinosaurios ORDER BY RAND() LIMIT 6");
$manoActual = $consulta->fetchAll(PDO::FETCH_COLUMN);
$_SESSION['mano_actual'] = $manoActual;

// Generar restricción del dado para el primer turno
$restriccionesDado = [
    'BOSQUE' => 'Bosque: solo se puede colocar en recintos del bosque (lado izquierdo del río).',
    'PRADERA' => 'Pradera: solo se puede colocar en recintos de pradera (lado derecho).',
    'ZONA_BANOS' => 'Zona de baños: solo en recintos a la derecha del río.',
    'ZONA_COMEDOR' => 'Zona de comedor: solo en recintos a la izquierda del río.',
    'RECINTO_VACIO' => 'Recinto vacío: solo en recintos que no tengan ningún dinosaurio.',
    'SIN_TREX' => 'Sin T-Rex: solo en recintos que no tengan un T-Rex.'
];

$clavesRestriccion = array_keys($restriccionesDado);
$restriccionActual = $clavesRestriccion[array_rand($clavesRestriccion)];

$consulta = $pdo->prepare("INSERT INTO dado_restricciones (partida_id, ronda, turno, restriccion, descripcion) VALUES (?, ?, ?, ?, ?)");
$consulta->execute([$idPartida, 1, 1, $restriccionActual, $restriccionesDado[$restriccionActual]]);

$_SESSION['restriccion_actual'] = $restriccionActual;
$_SESSION['descripcion_restriccion'] = $restriccionesDado[$restriccionActual];

// Redirigir a la partida
header("Location: partida.php");
exit;
?>