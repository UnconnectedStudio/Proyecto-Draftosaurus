<?php
// Configuración de base de datos
$servidor = 'localhost';
$nombreBaseDatos = 'draftosaurus';
$nombreUsuario = 'root';
$contrasena = '';

try {
    $pdo = new PDO("mysql:host=$servidor;dbname=$nombreBaseDatos;charset=utf8", $nombreUsuario, $contrasena);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die("Error de conexión: " . $e->getMessage());
}

// Iniciar sesión
session_start();
?>