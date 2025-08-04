<?php
// Script para resetear completamente la base de datos

$servidor = 'localhost';
$nombreUsuario = 'root';
$contrasena = '';

try {
    // Conectar sin especificar base de datos
    $pdo = new PDO("mysql:host=$servidor;charset=utf8", $nombreUsuario, $contrasena);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "Conectado al servidor MySQL...\n";
    
    // Eliminar la base de datos completamente
    $pdo->exec("DROP DATABASE IF EXISTS draftosaurus");
    echo "✓ Base de datos eliminada\n";
    
    // Crear la base de datos nuevamente
    $pdo->exec("CREATE DATABASE draftosaurus");
    echo "✓ Base de datos creada\n";
    
    // Usar la nueva base de datos
    $pdo->exec("USE draftosaurus");
    echo "✓ Usando base de datos draftosaurus\n";
    
    // Leer y ejecutar el esquema actualizado
    $sql = file_get_contents('database/schema_actualizado.sql');
    
    // Dividir en consultas individuales
    $consultas = explode(';', $sql);
    
    foreach ($consultas as $consulta) {
        $consulta = trim($consulta);
        if (!empty($consulta) && !strpos($consulta, 'CREATE DATABASE') && !strpos($consulta, 'USE draftosaurus')) {
            try {
                $pdo->exec($consulta);
                echo "✓ Ejecutada: " . substr($consulta, 0, 50) . "...\n";
            } catch (PDOException $e) {
                echo "⚠ Error en consulta: " . $e->getMessage() . "\n";
                echo "Consulta: " . substr($consulta, 0, 100) . "...\n";
            }
        }
    }
    
    echo "\n¡Base de datos reseteada e inicializada correctamente!\n";
    echo "Puedes acceder a la aplicación desde index.php\n";
    
} catch (PDOException $e) {
    echo "Error de conexión: " . $e->getMessage() . "\n";
}
?>