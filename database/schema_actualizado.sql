-- Base de datos actualizada para Draftosaurus Web con sistema Drag & Drop
CREATE DATABASE IF NOT EXISTS draftosaurus;
USE draftosaurus;

-- Tabla de partidas
CREATE TABLE IF NOT EXISTS partidas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha_inicio DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_completada DATETIME NULL,
    puntos INT DEFAULT 0,
    completada BOOLEAN DEFAULT FALSE,
    estado VARCHAR(20) DEFAULT 'jugando'
);

-- Tabla de dinosaurios (catálogo con hábitats)
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

-- Limpiar datos existentes
DELETE FROM partida_dinosaurios;
DELETE FROM dinosaurios;
DELETE FROM partidas;

-- Insertar dinosaurios con hábitats específicos
INSERT INTO dinosaurios (nombre, tipo, familia, habitat_correcto, puntos, imagen) VALUES
-- Dinosaurios del bosque
('T-Rex Alpha', 'carnivoro', 'Tyrannosauridae', 'bosque', 15, 'trex-alpha.png'),
('Allosaurus', 'carnivoro', 'Allosauridae', 'bosque', 12, 'allosaurus.png'),
('Compsognathus', 'carnivoro', 'Compsognathidae', 'bosque', 8, 'compsognathus.png'),
('Dilophosaurus', 'carnivoro', 'Dilophosauridae', 'bosque', 10, 'dilophosaurus.png'),

-- Dinosaurios del desierto
('Triceratops', 'herbivoro', 'Ceratopsidae', 'desierto', 12, 'triceratops.png'),
('Ankylosaurus', 'herbivoro', 'Ankylosauridae', 'desierto', 14, 'ankylosaurus.png'),
('Protoceratops', 'herbivoro', 'Protoceratopsidae', 'desierto', 9, 'protoceratops.png'),
('Parasaurolophus', 'herbivoro', 'Hadrosauridae', 'desierto', 11, 'parasaurolophus.png'),

-- Dinosaurios de montaña
('Stegosaurus', 'herbivoro', 'Stegosauridae', 'montaña', 13, 'stegosaurus.png'),
('Iguanodon', 'herbivoro', 'Iguanodontidae', 'montaña', 10, 'iguanodon.png'),
('Carnotaurus', 'carnivoro', 'Abelisauridae', 'montaña', 14, 'carnotaurus.png'),
('Therizinosaurus', 'herbivoro', 'Therizinosauridae', 'montaña', 16, 'therizinosaurus.png'),

-- Dinosaurios del océano
('Plesiosaur', 'carnivoro', 'Plesiosauria', 'oceano', 18, 'plesiosaur.png'),
('Mosasaurus', 'carnivoro', 'Mosasauridae', 'oceano', 20, 'mosasaurus.png'),
('Elasmosaurus', 'carnivoro', 'Elasmosauridae', 'oceano', 17, 'elasmosaurus.png'),
('Leedsichthys', 'herbivoro', 'Pachycormidae', 'oceano', 15, 'leedsichthys.png'),

-- Dinosaurios del pantano
('Spinosaurus', 'carnivoro', 'Spinosauridae', 'pantano', 19, 'spinosaurus.png'),
('Baryonyx', 'carnivoro', 'Spinosauridae', 'pantano', 16, 'baryonyx.png'),
('Dracorex', 'herbivoro', 'Pachycephalosauridae', 'pantano', 11, 'dracorex.png'),
('Maiasaura', 'herbivoro', 'Hadrosauridae', 'pantano', 13, 'maiasaura.png');

-- Crear índices para mejor rendimiento
CREATE INDEX idx_partida_dinosaurios_partida ON partida_dinosaurios(partida_id);
CREATE INDEX idx_partida_dinosaurios_colocado ON partida_dinosaurios(colocado);
CREATE INDEX idx_dinosaurios_habitat ON dinosaurios(habitat_correcto);