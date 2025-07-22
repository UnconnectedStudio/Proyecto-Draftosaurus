# Draftosaurus Web

Una implementación web completa del juego de mesa Draftosaurus, desarrollada con HTML, CSS, JavaScript y PHP sin frameworks.

## Características

- **Modo Jugable**: Partida completa de 6 rondas con mecánicas de draft
- **Modo Auxiliar**: Calculadora de puntos para probar diferentes combinaciones
- **6 Recintos únicos** con reglas específicas de puntuación
- **12 Especies de dinosaurios** con diferentes tipos y familias
- **Sistema de puntuación completo** basado en las reglas originales

## Requisitos

- Servidor web con PHP 7.4+
- MySQL 5.7+ o MariaDB
- Navegador web moderno

## Instalación

### 1. Configurar Base de Datos

```sql
-- Crear la base de datos
CREATE DATABASE draftosaurus;

-- Importar el esquema
mysql -u root -p draftosaurus < database/schema.sql
```

### 2. Configurar Conexión

Edita `config.php` con tus credenciales de base de datos:

```php
$host = 'localhost';
$dbname = 'draftosaurus';
$username = 'tu_usuario';
$password = 'tu_contraseña';
```

### 3. Subir Archivos

Copia todos los archivos a tu servidor web (Apache, Nginx, etc.)

### 4. Acceder al Juego

Visita `inicio.html` en tu navegador para comenzar.

## Cómo Jugar

### Modo Jugable

1. **Iniciar Partida**: Ingresa tu nombre y comienza
2. **Seleccionar Dinosaurio**: Elige uno de los 6 dinosaurios disponibles
3. **Elegir Recinto**: Coloca el dinosaurio en un recinto válido
4. **Repetir**: Continúa por 6 rondas (36 colocaciones totales)
5. **Puntuación Final**: Calcula automáticamente tu puntuación

### Modo Auxiliar

1. **Seleccionar Dinosaurios**: Elige manualmente dinosaurios para cada recinto
2. **Calcular**: Obtén la puntuación de tu combinación
3. **Experimentar**: Prueba diferentes estrategias

## Recintos y Reglas

| Recinto | Regla | Puntuación |
|---------|-------|------------|
| **Bosque Sagrado** | Todos de la misma familia | +2 pts por dinosaurio |
| **Río Serpenteante** | Formar pares | +4 pts por cada par |
| **Valle de los Gigantes** | Alternar herbívoros/carnívoros | +1 pt por dino, +3 bonus |
| **Hogar del T-Rex** | Requiere T-Rex | +7 base, +3 por T-Rex extra |
| **Pradera Abierta** | Sin restricciones | +1 pt por dinosaurio |
| **Cueva Misteriosa** | Solo carnívoros | +3 pts por carnívoro |

## Dinosaurios Disponibles

### Herbívoros
- Stegosaurus, Triceratops, Brontosaurus, Diplodocus
- Ankylosaurus, Parasaurolophus, Iguanodon

### Carnívoros
- T-Rex, Velociraptor, Allosaurus, Spinosaurus, Carnotaurus

## Estructura del Proyecto

```
draftosaurus-web/
├── database/
│   └── schema.sql          # Esquema de base de datos
├── css/
│   └── styles.css          # Estilos principales
├── js/
│   └── app.js              # JavaScript principal
├── config.php              # Configuración de BD
├── inicio.html             # Página de inicio
├── nueva_partida.php       # Crear nueva partida
├── partida.php             # Tablero de juego
├── colocar_dino.php        # Lógica de colocación
├── calcular_puntos.php     # Puntuación final
├── auxiliar.php            # Modo auxiliar
└── calcular_auxiliar.php   # Cálculo auxiliar
```

## Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: PHP 7.4+
- **Base de Datos**: MySQL/MariaDB
- **Arquitectura**: MVC simple sin frameworks

## Características Técnicas

- Sin frameworks o librerías externas
- Formularios HTML clásicos (POST)
- Sesiones PHP para estado del juego
- Validación de reglas en servidor
- Responsive design
- Interfaz intuitiva

## Solución de Problemas

### Error de Conexión a BD
- Verifica credenciales en `config.php`
- Asegúrate de que MySQL esté ejecutándose
- Confirma que la base de datos existe

### Sesión No Funciona
- Verifica que `session_start()` esté habilitado
- Comprueba permisos de escritura en `/tmp`

### Dinosaurios No Aparecen
- Ejecuta el script SQL completo
- Verifica que la tabla `dinosaurios` tenga datos


