<?php
session_start();
require_once 'config.php';

header('Content-Type: application/json');

// Verificar método POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

// Verificar sesión activa
if (!isset($_SESSION['partida_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'No hay partida activa']);
    exit;
}

// Obtener datos JSON
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['dinosaurio_id'], $input['zona'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Datos incompletos']);
    exit;
}

$partida_id = $_SESSION['partida_id'];
$dinosaurio_id = $input['dinosaurio_id'];
$zona = $input['zona'];

try {
    $pdo->beginTransaction();
    
    // Verificar que la partida existe y está activa
    $stmt = $pdo->prepare("SELECT * FROM partidas WHERE id = ? AND completada = 0");
    $stmt->execute([$partida_id]);
    $partida = $stmt->fetch();
    
    if (!$partida) {
        throw new Exception('Partida no encontrada o ya completada');
    }
    
    // Verificar que el dinosaurio pertenece a esta partida y no está colocado
    $stmt = $pdo->prepare("
        SELECT pd.*, d.habitat_correcto, d.puntos 
        FROM partida_dinosaurios pd 
        JOIN dinosaurios d ON pd.dinosaurio_id = d.id 
        WHERE pd.partida_id = ? AND pd.dinosaurio_id = ? AND pd.colocado = 0
    ");
    $stmt->execute([$partida_id, $dinosaurio_id]);
    $partida_dino = $stmt->fetch();
    
    if (!$partida_dino) {
        throw new Exception('Dinosaurio no válido o ya colocado');
    }
    
    // Verificar que la zona es correcta
    if ($partida_dino['habitat_correcto'] !== $zona) {
        echo json_encode([
            'success' => false, 
            'message' => 'Zona incorrecta para este dinosaurio'
        ]);
        $pdo->rollBack();
        exit;
    }
    
    // Marcar dinosaurio como colocado
    $stmt = $pdo->prepare("
        UPDATE partida_dinosaurios 
        SET colocado = 1, zona_colocada = ?, fecha_colocacion = NOW() 
        WHERE partida_id = ? AND dinosaurio_id = ?
    ");
    $stmt->execute([$zona, $partida_id, $dinosaurio_id]);
    
    // Actualizar puntos de la partida
    $puntos_ganados = $partida_dino['puntos'];
    $nuevos_puntos = $partida['puntos'] + $puntos_ganados;
    
    $stmt = $pdo->prepare("UPDATE partidas SET puntos = ? WHERE id = ?");
    $stmt->execute([$nuevos_puntos, $partida_id]);
    
    // Verificar si quedan dinosaurios por colocar
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as restantes 
        FROM partida_dinosaurios 
        WHERE partida_id = ? AND colocado = 0
    ");
    $stmt->execute([$partida_id]);
    $dinosaurios_restantes = $stmt->fetchColumn();
    
    $partida_completada = false;
    
    // Si no quedan dinosaurios, marcar partida como completada
    if ($dinosaurios_restantes == 0) {
        $stmt = $pdo->prepare("
            UPDATE partidas 
            SET completada = 1, fecha_completada = NOW() 
            WHERE id = ?
        ");
        $stmt->execute([$partida_id]);
        $partida_completada = true;
    }
    
    $pdo->commit();
    
    echo json_encode([
        'success' => true,
        'puntos' => $nuevos_puntos,
        'puntos_ganados' => $puntos_ganados,
        'dinosaurios_restantes' => $dinosaurios_restantes,
        'partida_completada' => $partida_completada,
        'message' => "¡Correcto! +{$puntos_ganados} puntos"
    ]);
    
} catch (Exception $e) {
    $pdo->rollBack();
    error_log("Error en colocar_dino.php: " . $e->getMessage());
    
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>