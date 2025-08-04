<?php
session_start();
require_once 'config.php';

try {
    $pdo->beginTransaction();
    
    // Crear nueva partida
    $stmt = $pdo->prepare("INSERT INTO partidas (fecha_inicio, puntos, completada, estado) VALUES (NOW(), 0, FALSE, 'jugando')");
    $stmt->execute();
    $partida_id = $pdo->lastInsertId();
    
    // Seleccionar 12 dinosaurios aleatorios para la partida (3 de cada hábitat + algunos extras)
    $habitats = ['bosque', 'desierto', 'montaña', 'oceano', 'pantano'];
    $dinosaurios_seleccionados = [];
    
    foreach ($habitats as $habitat) {
        // Obtener 2-3 dinosaurios de cada hábitat
        $stmt = $pdo->prepare("SELECT id FROM dinosaurios WHERE habitat_correcto = ? ORDER BY RAND() LIMIT 3");
        $stmt->execute([$habitat]);
        $dinos_habitat = $stmt->fetchAll(PDO::FETCH_COLUMN);
        $dinosaurios_seleccionados = array_merge($dinosaurios_seleccionados, $dinos_habitat);
    }
    
    // Agregar algunos dinosaurios extra aleatorios para llegar a 15 total
    $stmt = $pdo->prepare("SELECT id FROM dinosaurios WHERE id NOT IN (" . implode(',', array_fill(0, count($dinosaurios_seleccionados), '?')) . ") ORDER BY RAND() LIMIT 3");
    $stmt->execute($dinosaurios_seleccionados);
    $dinos_extra = $stmt->fetchAll(PDO::FETCH_COLUMN);
    $dinosaurios_seleccionados = array_merge($dinosaurios_seleccionados, $dinos_extra);
    
    // Insertar dinosaurios en la partida
    foreach ($dinosaurios_seleccionados as $dino_id) {
        $stmt = $pdo->prepare("INSERT INTO partida_dinosaurios (partida_id, dinosaurio_id, colocado) VALUES (?, ?, FALSE)");
        $stmt->execute([$partida_id, $dino_id]);
    }
    
    // Guardar ID de partida en sesión
    $_SESSION['partida_id'] = $partida_id;
    
    $pdo->commit();
    
    // Redirigir a la partida
    header("Location: partida.php");
    exit;
    
} catch (Exception $e) {
    $pdo->rollBack();
    error_log("Error creando nueva partida: " . $e->getMessage());
    
    // Redirigir con error
    header("Location: index.php?error=1");
    exit;
}
?>