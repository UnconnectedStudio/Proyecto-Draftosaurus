# Documentación Completa del Proyecto Draftosaurus

## Descripción General

Draftosaurus es una aplicación web completa que implementa el juego de mesa de estrategia prehistórico. Esta versión incluye un sistema avanzado de drag & drop, modo auxiliar para cálculo de puntos, y una arquitectura modular completamente refactorizada.

---

## Arquitectura del Proyecto

### Estructura de Archivos
```
proyecto/
├── index.php                 # Menú principal
├── auxiliar.php              # Modo auxiliar (calculadora)
├── nueva_partida.php         # Creación de partidas
├── partida.php               # Juego drag & drop
├── colocar_dino.php          # API backend
├── reset_bd.php              # Utilidad de desarrollo
├── config.php                # Configuración BD
├── css/
│   ├── base.css              # Estilos base y variables
│   ├── components.css        # Componentes reutilizables
│   ├── tablero.css           # Sistema drag & drop
│   ├── layout.css            # Estructura y posicionamiento
│   └── responsive.css        # Media queries
├── js/
│   ├── app.js                # Aplicación principal
│   ├── modules/              # Módulos especializados
│   │   ├── gestor-juego.js
│   │   ├── gestor-navegacion.js
│   │   ├── gestor-draft.js
│   │   ├── gestor-bots.js
│   │   ├── gestor-dados.js
│   │   ├── gestor-tablero.js
│   │   └── renderizador-*.js
│   └── config/
│       └── configuracion-app.js
├── database/
│   └── schema_actualizado.sql
└── recursos/
    └── img/
        ├── dinosaurios/      # 21 imágenes SVG
        └── ...               # Otras imágenes
```

### Patrones Arquitectónicos
- **MVC Simplificado**: Separación clara entre lógica, vista y datos
- **Módulos ES6**: JavaScript modular sin frameworks externos
- **Gestores Especializados**: Cada gestor maneja una responsabilidad específica
- **API RESTful**: Backend PHP con endpoints específicos

---

## 🎯 Funcionalidades Principales

### 1. Sistema Drag & Drop Avanzado
- **API HTML5 Nativa**: Sin dependencias externas
- **Validación en Tiempo Real**: Feedback inmediato
- **5 Hábitats Específicos**: bosque, desierto, montaña, océano, pantano
- **20 Dinosaurios Únicos**: Con características específicas
- **Sistema de Puntuación**: Puntos variables por colocación correcta

### 2. Modo Auxiliar (Calculadora)
- **7 Recintos de Draftosaurus**: Implementación completa de reglas
- **Cálculo Automático**: Puntuación en tiempo real
- **Interfaz Intuitiva**: Selectores dinámicos por recinto
- **Validación de Reglas**: Aplicación automática de restricciones

### 3. Sistema de Navegación
- **Menú Principal**: Selección entre modos
- **Navegación por Teclado**: Accesibilidad completa
- **Transiciones Suaves**: Efectos visuales optimizados
- **Responsive Design**: Adaptativo a todos los dispositivos

---

## 🔧 Implementación Técnica

### JavaScript - Arquitectura Modular

#### Aplicación Principal (app.js)
```javascript
class AplicacionDraftosaurus {
    constructor() {
        this.configuracion = CONFIGURACION;
        this.gestores = {};
        this.estaInicializada = false;
    }

    async inicializar() {
        // Inicializar gestores especializados
        this.gestores.ui = new GestorUI();
        this.gestores.navegacion = new GestorNavegacion();
        this.gestores.efectos = new GestorEfectos();
        this.gestores.eventos = new GestorEventos();
        
        // Configurar referencias cruzadas
        this.configurarReferenciasGestores();
        
        // Inicializar cada gestor
        await this.inicializarGestores();
    }
}
```

#### Gestor de Juego
```javascript
class GestorJuego {
    async inicializar() {
        // Inicializar sistemas de juego
        await this.inicializarRenderizadorMapa();
        await this.inicializarSistemaDados();
        await this.inicializarBots();
        await this.inicializarDraft();
    }

    async confirmarColocacionDraft() {
        // Validar selecciones
        if (!this.validarSelecciones()) return;
        
        // Procesar colocación
        const resultado = await this.gestorDraft.procesarColocacion(
            this.dinosaurioSeleccionado,
            this.recintoSeleccionado
        );
        
        // Actualizar interfaz
        this.actualizarInterfaz(resultado);
    }
}
```

#### Sistema Drag & Drop
```javascript
class DragDropGame {
    setupDragAndDrop() {
        const dinosaurios = document.querySelectorAll('.dinosaurio-item');
        
        dinosaurios.forEach(dino => {
            dino.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', JSON.stringify({
                    dinoId: e.target.dataset.dinoId,
                    habitat: e.target.dataset.habitat
                }));
            });
        });
    }

    async procesarColocacion(dinoId, habitatCorrecto, zonaDestino) {
        const esCorrecta = habitatCorrecto === zonaDestino;
        
        if (!esCorrecta) {
            this.mostrarFeedback('¡Zona incorrecta!', 'error');
            return;
        }

        // Procesar en backend
        const response = await fetch('colocar_dino.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                partida_id: this.partidaId,
                dinosaurio_id: dinoId,
                zona: zonaDestino
            })
        });

        const result = await response.json();
        this.manejarResultado(result);
    }
}
```

### PHP - Backend Robusto

#### Configuración de Base de Datos
```php
// config.php
$servidor = 'localhost';
$nombreBaseDatos = 'draftosaurus';
$nombreUsuario = 'root';
$contrasena = '';

try {
    $pdo = new PDO("mysql:host=$servidor;dbname=$nombreBaseDatos;charset=utf8", 
                   $nombreUsuario, $contrasena);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die("Error de conexión: " . $e->getMessage());
}
```

#### API de Colocación
```php
// colocar_dino.php
session_start();
require_once 'config.php';

header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);
$partida_id = $_SESSION['partida_id'];
$dinosaurio_id = $input['dinosaurio_id'];
$zona = $input['zona'];

try {
    $pdo->beginTransaction();
    
    // Verificar que el dinosaurio pertenece a esta partida
    $stmt = $pdo->prepare("
        SELECT pd.*, d.habitat_correcto, d.puntos 
        FROM partida_dinosaurios pd 
        JOIN dinosaurios d ON pd.dinosaurio_id = d.id 
        WHERE pd.partida_id = ? AND pd.dinosaurio_id = ? AND pd.colocado = 0
    ");
    $stmt->execute([$partida_id, $dinosaurio_id]);
    $partida_dino = $stmt->fetch();
    
    // Validar zona correcta
    if ($partida_dino['habitat_correcto'] !== $zona) {
        throw new Exception('Zona incorrecta para este dinosaurio');
    }
    
    // Marcar como colocado y actualizar puntos
    $stmt = $pdo->prepare("
        UPDATE partida_dinosaurios 
        SET colocado = 1, zona_colocada = ?, fecha_colocacion = NOW() 
        WHERE partida_id = ? AND dinosaurio_id = ?
    ");
    $stmt->execute([$zona, $partida_id, $dinosaurio_id]);
    
    $pdo->commit();
    
    echo json_encode([
        'success' => true,
        'puntos' => $nuevos_puntos,
        'message' => "¡Correcto! +{$puntos_ganados} puntos"
    ]);
    
} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
```

#### Creación de Partidas
```php
// nueva_partida.php
try {
    $pdo->beginTransaction();
    
    // Crear nueva partida
    $stmt = $pdo->prepare("INSERT INTO partidas (fecha_inicio, puntos, completada) VALUES (NOW(), 0, FALSE)");
    $stmt->execute();
    $partida_id = $pdo->lastInsertId();
    
    // Seleccionar dinosaurios aleatorios
    $habitats = ['bosque', 'desierto', 'montaña', 'oceano', 'pantano'];
    $dinosaurios_seleccionados = [];
    
    foreach ($habitats as $habitat) {
        $stmt = $pdo->prepare("SELECT id FROM dinosaurios WHERE habitat_correcto = ? ORDER BY RAND() LIMIT 3");
        $stmt->execute([$habitat]);
        $dinos_habitat = $stmt->fetchAll(PDO::FETCH_COLUMN);
        $dinosaurios_seleccionados = array_merge($dinosaurios_seleccionados, $dinos_habitat);
    }
    
    // Insertar dinosaurios en la partida
    foreach ($dinosaurios_seleccionados as $dino_id) {
        $stmt = $pdo->prepare("INSERT INTO partida_dinosaurios (partida_id, dinosaurio_id, colocado) VALUES (?, ?, FALSE)");
        $stmt->execute([$partida_id, $dino_id]);
    }
    
    $_SESSION['partida_id'] = $partida_id;
    $pdo->commit();
    
    header("Location: partida.php");
} catch (Exception $e) {
    $pdo->rollBack();
    header("Location: index.php?error=1");
}
```

### CSS - Sistema de Diseño Modular

#### Variables CSS Centralizadas
```css
/* base.css */
:root {
    --color-primary: #E85A2B;
    --color-secondary: #D4841F;
    --gradient-primary: linear-gradient(135deg, #E85A2B 0%, #D4841F 100%);
    --shadow-soft: 0 4px 15px rgba(232, 90, 43, 0.1);
    --transition-normal: 0.3s ease;
    --border-radius: 12px;
    --backdrop-blur: blur(10px);
}

body {
    background: url('../recursos/img/nuevoFondoPantalla.png') center/cover fixed;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    margin: 0;
    padding: 0;
    min-height: 100vh;
}
```

#### Sistema Drag & Drop
```css
/* tablero.css */
.game-container {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 20px;
    height: 100vh;
    padding: 20px;
    box-sizing: border-box;
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
}

.mapa-container {
    position: relative;
    background: url('../recursos/img/tableroPersonalizado.png') center/cover;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    min-height: 500px;
}

.drop-zone {
    position: absolute;
    border: 2px dashed transparent;
    border-radius: 8px;
    transition: all 0.3s ease;
    cursor: pointer;
    min-width: 60px;
    min-height: 60px;
}

.drop-zone:hover {
    border-color: rgba(255,255,255,0.5);
    background: rgba(255,255,255,0.1);
}

.drop-zone.drag-over {
    border-color: #4CAF50;
    background: rgba(76,175,80,0.2);
    transform: scale(1.05);
    box-shadow: 0 0 20px rgba(76,175,80,0.4);
}
```

#### Componentes Reutilizables
```css
/* components.css */
.btn-play {
    background: var(--gradient-primary);
    border: none;
    color: white;
    padding: 15px 40px;
    border-radius: 25px;
    font-size: 1.2em;
    font-weight: bold;
    cursor: pointer;
    transition: all var(--transition-normal);
    text-transform: uppercase;
    letter-spacing: 1px;
    box-shadow: var(--shadow-soft);
}

.btn-play:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(232, 90, 43, 0.3);
}

.dinosaurio-item {
    display: flex;
    align-items: center;
    background: rgba(255,255,255,0.1);
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 10px;
    cursor: grab;
    transition: all 0.3s ease;
    border: 2px solid transparent;
    user-select: none;
}

.dinosaurio-item:hover {
    background: rgba(255,255,255,0.2);
    transform: translateX(-5px);
    border-color: rgba(255,255,255,0.3);
}

.dinosaurio-item.dragging {
    opacity: 0.5;
    cursor: grabbing;
    transform: rotate(5deg) scale(0.95);
}
```

---

## 🗄️ Base de Datos

### Esquema Actualizado
```sql
-- Tabla de partidas
CREATE TABLE IF NOT EXISTS partidas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha_inicio DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_completada DATETIME NULL,
    puntos INT DEFAULT 0,
    completada BOOLEAN DEFAULT FALSE,
    estado VARCHAR(20) DEFAULT 'jugando'
);

-- Tabla de dinosaurios con hábitats
CREATE TABLE IF NOT EXISTS dinosaurios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    tipo VARCHAR(30) NOT NULL,
    familia VARCHAR(30) NOT NULL,
    habitat_correcto VARCHAR(30) NOT NULL,
    puntos INT DEFAULT 10,
    imagen VARCHAR(255) DEFAULT 'default.png'
);

-- Tabla de dinosaurios por partida
CREATE TABLE IF NOT EXISTS partida_dinosaurios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    partida_id INT NOT NULL,
    dinosaurio_id INT NOT NULL,
    colocado BOOLEAN DEFAULT FALSE,
    zona_colocada VARCHAR(30) NULL,
    fecha_colocacion DATETIME NULL,
    FOREIGN KEY (partida_id) REFERENCES partidas(id) ON DELETE CASCADE,
    FOREIGN KEY (dinosaurio_id) REFERENCES dinosaurios(id) ON DELETE CASCADE
);
```

### Datos de Ejemplo
```sql
-- Dinosaurios del bosque
INSERT INTO dinosaurios (nombre, tipo, familia, habitat_correcto, puntos, imagen) VALUES
('T-Rex Alpha', 'carnivoro', 'Tyrannosauridae', 'bosque', 15, 'trex-alpha.png'),
('Allosaurus', 'carnivoro', 'Allosauridae', 'bosque', 12, 'allosaurus.png'),

-- Dinosaurios del desierto
('Triceratops', 'herbivoro', 'Ceratopsidae', 'desierto', 12, 'triceratops.png'),
('Ankylosaurus', 'herbivoro', 'Ankylosauridae', 'desierto', 14, 'ankylosaurus.png'),

-- Dinosaurios de montaña
('Stegosaurus', 'herbivoro', 'Stegosauridae', 'montaña', 13, 'stegosaurus.png'),
('Carnotaurus', 'carnivoro', 'Abelisauridae', 'montaña', 14, 'carnotaurus.png'),

-- Dinosaurios del océano
('Plesiosaur', 'carnivoro', 'Plesiosauria', 'oceano', 18, 'plesiosaur.png'),
('Mosasaurus', 'carnivoro', 'Mosasauridae', 'oceano', 20, 'mosasaurus.png'),

-- Dinosaurios del pantano
('Spinosaurus', 'carnivoro', 'Spinosauridae', 'pantano', 19, 'spinosaurus.png'),
('Baryonyx', 'carnivoro', 'Spinosauridae', 'pantano', 16, 'baryonyx.png');
```

---

## 🎮 Flujo de Usuario

### 1. Menú Principal
```
index.php
├── Información del juego
├── Botón "Jugar" → Pantalla de opciones
│   ├── Modo Auxiliar → auxiliar.php
│   └── Modo Jugable → nueva_partida.php
```

### 2. Modo Jugable (Drag & Drop)
```
nueva_partida.php → partida.php
├── Seleccionar dinosaurios (15 aleatorios)
├── Crear partida en BD
├── Redirigir a interfaz de juego
└── Sistema drag & drop activo
    ├── Arrastrar dinosaurios
    ├── Soltar en zonas correctas
    ├── Validación automática
    ├── Actualización de puntos
    └── Progreso de partida
```

### 3. Modo Auxiliar (Calculadora)
```
auxiliar.php
├── 7 recintos de Draftosaurus
├── Selectores dinámicos por recinto
├── Validación de reglas automática
├── Cálculo de puntos en tiempo real
└── Envío a calcular_auxiliar.php
```

---

## 🔧 Configuración y Instalación

### Requisitos del Sistema
- **Servidor Web**: Apache/Nginx con PHP 7.4+
- **Base de Datos**: MySQL 5.7+ o MariaDB 10.3+
- **Navegador**: Chrome 70+, Firefox 65+, Safari 12+, Edge 79+

### Instalación con XAMPP

1. **Iniciar Servicios**
   ```bash
   # Iniciar Apache y MySQL en XAMPP Control Panel
   ```

2. **Crear Base de Datos**
   ```bash
   # Ejecutar reset_bd.php para crear estructura completa
   php reset_bd.php
   ```

3. **Configurar Permisos**
   ```bash
   # Asegurar permisos de escritura en directorio de sesiones
   chmod 755 recursos/img/dinosaurios/
   ```

4. **Acceder a la Aplicación**
   ```
   http://localhost/proyecto/index.php
   ```

### Configuración de Producción

1. **Variables de Entorno**
   ```php
   // config.php
   $servidor = $_ENV['DB_HOST'] ?? 'localhost';
   $nombreBaseDatos = $_ENV['DB_NAME'] ?? 'draftosaurus';
   $nombreUsuario = $_ENV['DB_USER'] ?? 'root';
   $contrasena = $_ENV['DB_PASS'] ?? '';
   ```

2. **Optimizaciones**
   ```php
   // Habilitar compresión
   ini_set('zlib.output_compression', 'On');
   
   // Configurar cache de sesiones
   ini_set('session.cache_limiter', 'public');
   ini_set('session.cache_expire', 180);
   ```

---

## 🧪 Testing y Debugging

### Herramientas de Debug

#### JavaScript
```javascript
// Acceder a la aplicación globalmente
const app = window.AplicacionDraftosaurus;

// Información del estado
console.log(app.obtenerInfoAplicacion());

// Debug de gestores específicos
console.log(app.gestores.juego.obtenerEstado());
console.log(app.gestores.navegacion.obtenerHistorial());
```

#### PHP
```php
// Habilitar errores en desarrollo
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Log de errores personalizado
error_log("Debug: " . print_r($variable, true));
```

### Utilidades de Desarrollo

#### Reset de Base de Datos
```bash
# Resetear completamente la BD
php reset_bd.php
```

#### Generación de Datos de Prueba
```php
// Crear partida de prueba
$_SESSION['partida_id'] = 1;
include 'nueva_partida.php';
```

---

## 🚀 Optimizaciones de Rendimiento

### Frontend
- **Lazy Loading**: Carga diferida de imágenes
- **Event Delegation**: Gestión eficiente de eventos
- **CSS Animations**: Uso de transform y opacity para mejor rendimiento
- **Debouncing/Throttling**: Control de frecuencia de eventos

### Backend
- **Prepared Statements**: Prevención de SQL injection
- **Transacciones**: Consistencia de datos
- **Índices de BD**: Optimización de consultas
- **Compresión**: Reducción de tamaño de respuestas

### Base de Datos
```sql
-- Índices para mejor rendimiento
CREATE INDEX idx_partida_dinosaurios_partida ON partida_dinosaurios(partida_id);
CREATE INDEX idx_partida_dinosaurios_colocado ON partida_dinosaurios(colocado);
CREATE INDEX idx_dinosaurios_habitat ON dinosaurios(habitat_correcto);
```

---

## 🔒 Seguridad

### Validación de Entrada
```php
// Sanitización de datos
$dinosaurio_id = filter_var($input['dinosaurio_id'], FILTER_VALIDATE_INT);
$zona = filter_var($input['zona'], FILTER_SANITIZE_STRING);

// Validación de sesión
if (!isset($_SESSION['partida_id'])) {
    http_response_code(401);
    exit;
}
```

### Prevención de Ataques
- **SQL Injection**: Uso exclusivo de prepared statements
- **XSS**: Sanitización de salida con `htmlspecialchars()`
- **CSRF**: Validación de tokens en formularios críticos
- **Session Hijacking**: Regeneración de IDs de sesión

---

## 📱 Responsive Design

### Breakpoints
```css
/* Mobile First */
@media (max-width: 768px) {
    .game-container {
        grid-template-columns: 1fr;
        grid-template-rows: 1fr auto;
    }
    
    .dinosaurios-panel {
        max-height: 200px;
        order: 2;
    }
}

@media (max-width: 480px) {
    .mapa-container {
        min-height: 300px;
    }
    
    .dinosaurio-item {
        padding: 8px;
    }
}
```

### Touch Support
```javascript
// Detección de dispositivos táctiles
const esTactil = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

if (esTactil) {
    // Implementar eventos touch específicos
    elemento.addEventListener('touchstart', manejarTouchStart);
    elemento.addEventListener('touchmove', manejarTouchMove);
    elemento.addEventListener('touchend', manejarTouchEnd);
}
```

---

## 🎯 Próximas Mejoras

### Funcionalidades Planificadas
- [ ] **Modo Multijugador**: Partidas en tiempo real
- [ ] **Sistema de Logros**: Badges y estadísticas
- [ ] **Temas Visuales**: Personalización de interfaz
- [ ] **Efectos de Sonido**: Feedback auditivo
- [ ] **Tutorial Interactivo**: Guía paso a paso
- [ ] **Guardado en la Nube**: Sincronización de partidas
- [ ] **Análisis de Partidas**: Estadísticas detalladas
- [ ] **Modo Torneo**: Competencias organizadas

### Mejoras Técnicas
- [ ] **Service Workers**: Funcionamiento offline
- [ ] **WebSockets**: Comunicación en tiempo real
- [ ] **Progressive Web App**: Instalación en dispositivos
- [ ] **Internacionalización**: Soporte multi-idioma
- [ ] **Tests Automatizados**: Suite de testing completa
- [ ] **CI/CD Pipeline**: Despliegue automatizado

---

## 📞 Soporte y Contribución

### Estructura de Contribución
1. **Fork** del repositorio
2. **Crear rama** para nueva funcionalidad
3. **Implementar** cambios con tests
4. **Documentar** cambios realizados
5. **Pull Request** con descripción detallada

### Convenciones de Código
- **JavaScript**: ESLint con configuración estándar
- **PHP**: PSR-12 coding standard
- **CSS**: BEM methodology para naming
- **Commits**: Conventional Commits specification

---

## 📄 Licencia y Créditos

### Tecnologías Utilizadas
- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Backend**: PHP 7.4+, MySQL 8.0+
- **Herramientas**: XAMPP, Git, VSCode
- **Librerías**: Bootstrap 5.3 (solo para auxiliar.php)

### Créditos
- **Juego Original**: Draftosaurus por Ankama Editions
- **Desarrollo Web**: Implementación personalizada
- **Imágenes**: Generadas con SVG personalizado
- **Iconos**: Emojis Unicode estándar
