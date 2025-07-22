<?php
require_once 'config.php';

// Verificar que es una petición POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

// Obtener datos de la petición
$input = json_decode(file_get_contents('php://input'), true);
$cantidadJugadores = $input['cantidadJugadores'] ?? 4;
$dinosauriosPorJugador = $input['dinosauriosPorJugador'] ?? 6;

try {
    // Obtener todos los dinosaurios disponibles
    $consulta = $pdo->query("SELECT * FROM dinosaurios ORDER BY RAND()");
    $todosLosDinosaurios = $consulta->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($todosLosDinosaurios) < ($cantidadJugadores * $dinosauriosPorJugador)) {
        throw new Exception('No hay suficientes dinosaurios en la base de datos');
    }
    
    // Distribuir dinosaurios en manos
    $manos = [];
    $indice = 0;
    
    for ($jugador = 0; $jugador < $cantidadJugadores; $jugador++) {
        $mano = [];
        
        for ($dino = 0; $dino < $dinosauriosPorJugador; $dino++) {
            if ($indice < count($todosLosDinosaurios)) {
                $dinosaurio = $todosLosDinosaurios[$indice];
                
                // Formatear dinosaurio para el frontend
                $mano[] = [
                    'id' => (int)$dinosaurio['id'],
                    'nombre' => $dinosaurio['nombre'],
                    'tipo' => $dinosaurio['tipo'],
                    'familia' => $dinosaurio['familia'],
                    'imagen_url' => $dinosaurio['imagen_url']
                ];
                
                $indice++;
            }
        }
        
        $manos[] = $mano;
    }
    
    // Respuesta exitosa
    header('Content-Type: application/json');
    echo json_encode([
        'success' => true,
        'manos' => $manos,
        'totalDinosaurios' => $indice,
        'cantidadJugadores' => $cantidadJugadores,
        'dinosauriosPorJugador' => $dinosauriosPorJugador
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>