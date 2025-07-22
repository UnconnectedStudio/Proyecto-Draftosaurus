# Configuración de Base de Datos con XAMPP

## Introducción

Este documento explica paso a paso cómo configurar la base de datos MySQL para el proyecto Draftosaurus utilizando XAMPP como servidor local. XAMPP proporciona un entorno de desarrollo completo que incluye Apache, MySQL, PHP y phpMyAdmin.

## Requisitos Previos

- XAMPP instalado en el sistema
- Navegador web moderno
- Acceso a los archivos del proyecto Draftosaurus

## Paso 1: Iniciar Servicios de XAMPP

### Abrir el Panel de Control de XAMPP

1. Ejecutar XAMPP Control Panel como administrador
2. Localizar los servicios Apache y MySQL en la lista
3. Hacer clic en "Start" para Apache
4. Hacer clic en "Start" para MySQL

### Verificar Estado de los Servicios

Los servicios correctamente iniciados mostrarán:
- Texto en color verde
- Puerto asignado (Apache: 80, MySQL: 3306)
- Botones "Stop" activos

## Paso 2: Acceder a phpMyAdmin

### Navegación Web

1. Abrir navegador web
2. Navegar a `http://localhost/phpmyadmin`
3. La interfaz de phpMyAdmin debería cargar automáticamente

### Credenciales por Defecto

- Usuario: `root`
- Contraseña: (vacía por defecto)

## Paso 3: Crear la Base de Datos

### Método 1: Interfaz Gráfica

1. En phpMyAdmin, hacer clic en "Bases de datos"
2. En el campo "Crear base de datos", escribir: `draftosaurus`
3. Seleccionar cotejamiento: `utf8_general_ci`
4. Hacer clic en "Crear"

### Método 2: Comando SQL

```sql
CREATE DATABASE IF NOT EXISTS draftosaurus 
CHARACTER SET utf8 
COLLATE utf8_general_ci;
```

## Paso 4: Importar el Esquema

### Localizar el Archivo Schema

El archivo `schema.sql` se encuentra en la carpeta `database/` del proyecto.

### Proceso de Importación

1. Seleccionar la base de datos `draftosaurus` en phpMyAdmin
2. Hacer clic en la pestaña "Importar"
3. Hacer clic en "Seleccionar archivo"
4. Navegar hasta `database/schema.sql`
5. Verificar que el formato sea "SQL"
6. Hacer clic en "Continuar"

### Verificación de Importación

Después de la importación exitosa, deberían aparecer las siguientes tablas:
- `partidas`
- `jugadores`
- `dinosaurios`
- `recintos`
- `colocaciones`
- `dado_restricciones`

## Paso 5: Configurar Conexión PHP

### Editar config.php

Localizar el archivo `config.php` en la raíz del proyecto y configurar:

```php
<?php
$host = 'localhost';
$dbname = 'draftosaurus';
$username = 'root';
$password = '';
$charset = 'utf8';

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=$charset",
        $username,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
} catch (PDOException $e) {
    die("Error de conexión: " . $e->getMessage());
}
?>
```

## Paso 6: Verificar Datos de Prueba

### Consultar Dinosaurios

Ejecutar en phpMyAdmin para verificar los datos:

```sql
SELECT COUNT(*) as total_dinosaurios FROM dinosaurios;
SELECT DISTINCT familia FROM dinosaurios;
SELECT DISTINCT tipo FROM dinosaurios;
```

### Resultados Esperados

- Total de dinosaurios: 60
- Familias: T-Rex, Stegosaurus, Triceratops, Raptor, Sauropodo, Allosaurus
- Tipos: carnivoro, herbivoro

## Paso 7: Probar Conexión

### Crear Archivo de Prueba

Crear `test_conexion.php` en la raíz del proyecto:

```php
<?php
require_once 'config.php';

try {
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM dinosaurios");
    $result = $stmt->fetch();
    echo "Conexión exitosa. Total de dinosaurios: " . $result['total'];
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
```

### Ejecutar Prueba

1. Navegar a `http://localhost/tu-proyecto/test_conexion.php`
2. Debería mostrar: "Conexión exitosa. Total de dinosaurios: 60"

## Configuración Avanzada

### Optimización de MySQL

Para mejorar el rendimiento, editar `my.ini` en XAMPP:

```ini
[mysql]
default-table-type=myisam
max_connections=100
query_cache_size=32M
```

### Configuración de Seguridad

Para entornos de desarrollo más seguros:

1. Establecer contraseña para root
2. Crear usuario específico para la aplicación
3. Otorgar permisos mínimos necesarios

```sql
CREATE USER 'draftosaurus_user'@'localhost' IDENTIFIED BY 'password_seguro';
GRANT SELECT, INSERT, UPDATE, DELETE ON draftosaurus.* TO 'draftosaurus_user'@'localhost';
FLUSH PRIVILEGES;
```

## Solución de Problemas Comunes

### Error: "Access denied for user 'root'"

1. Verificar que MySQL esté iniciado en XAMPP
2. Comprobar credenciales en config.php
3. Reiniciar servicios de XAMPP

### Error: "Database 'draftosaurus' doesn't exist"

1. Verificar que la base de datos fue creada correctamente
2. Comprobar el nombre en config.php
3. Recrear la base de datos si es necesario

### Error: "Table doesn't exist"

1. Verificar que schema.sql fue importado completamente
2. Comprobar que todas las tablas están presentes
3. Reimportar el esquema si es necesario

### Puerto 3306 en Uso

1. Cambiar puerto de MySQL en XAMPP
2. Actualizar configuración en config.php
3. Reiniciar servicios

## Mantenimiento

### Respaldo de Datos

Crear respaldos regulares usando phpMyAdmin:
1. Seleccionar base de datos
2. Ir a "Exportar"
3. Seleccionar formato SQL
4. Descargar archivo

### Monitoreo de Rendimiento

Utilizar las herramientas de phpMyAdmin para:
- Monitorear consultas lentas
- Verificar uso de índices
- Analizar estadísticas de tablas

## Conclusión

La configuración de la base de datos con XAMPP proporciona un entorno de desarrollo robusto para el proyecto Draftosaurus. Siguiendo estos pasos, tendrás una instalación funcional lista para el desarrollo y pruebas de la aplicación.

Para producción, considera migrar a un servidor MySQL dedicado con configuraciones de seguridad y rendimiento apropiadas para el entorno de despliegue.