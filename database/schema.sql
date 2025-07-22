-- Base de datos para Draftosaurus Web
CREATE DATABASE IF NOT EXISTS draftosaurus;
USE draftosaurus;

-- Tabla de partidas
CREATE TABLE partidas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha_inicio DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) DEFAULT 'jugando'
);

-- Tabla de jugadores
CREATE TABLE jugadores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    partida_id INT,
    FOREIGN KEY (partida_id) REFERENCES partidas(id)
);

-- Tabla de dinosaurios (catálogo)
CREATE TABLE dinosaurios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    tipo VARCHAR(30) NOT NULL,
    familia VARCHAR(30) NOT NULL,
    imagen_url VARCHAR(255)
);

-- Tabla de recintos
CREATE TABLE recintos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    partida_id INT,
    nombre VARCHAR(50) NOT NULL,
    max_dinos INT DEFAULT 6,
    regla_codigo VARCHAR(50),
    descripcion TEXT,
    FOREIGN KEY (partida_id) REFERENCES partidas(id)
);

-- Tabla de colocaciones
CREATE TABLE colocaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    jugador_id INT,
    recinto_id INT,
    dinosaurio_id INT,
    ronda INT DEFAULT 1,
    turno INT DEFAULT 1,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (jugador_id) REFERENCES jugadores(id),
    FOREIGN KEY (recinto_id) REFERENCES recintos(id),
    FOREIGN KEY (dinosaurio_id) REFERENCES dinosaurios(id)
);

-- Tabla para el dado de colocación
CREATE TABLE dado_restricciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    partida_id INT,
    ronda INT,
    turno INT,
    restriccion VARCHAR(50),
    descripcion TEXT,
    FOREIGN KEY (partida_id) REFERENCES partidas(id)
);

-- Insertar dinosaurios del catálogo (60 figuras de varias especies)
INSERT INTO dinosaurios (nombre, tipo, familia, imagen_url) VALUES
-- T-Rex (10 figuras)
('T-Rex 1', 'carnivoro', 'T-Rex', 'img/trex.png'),
('T-Rex 2', 'carnivoro', 'T-Rex', 'img/trex.png'),
('T-Rex 3', 'carnivoro', 'T-Rex', 'img/trex.png'),
('T-Rex 4', 'carnivoro', 'T-Rex', 'img/trex.png'),
('T-Rex 5', 'carnivoro', 'T-Rex', 'img/trex.png'),
('T-Rex 6', 'carnivoro', 'T-Rex', 'img/trex.png'),
('T-Rex 7', 'carnivoro', 'T-Rex', 'img/trex.png'),
('T-Rex 8', 'carnivoro', 'T-Rex', 'img/trex.png'),
('T-Rex 9', 'carnivoro', 'T-Rex', 'img/trex.png'),
('T-Rex 10', 'carnivoro', 'T-Rex', 'img/trex.png'),
-- Stegosaurus (10 figuras)
('Stegosaurus 1', 'herbivoro', 'Stegosaurus', 'img/stego.png'),
('Stegosaurus 2', 'herbivoro', 'Stegosaurus', 'img/stego.png'),
('Stegosaurus 3', 'herbivoro', 'Stegosaurus', 'img/stego.png'),
('Stegosaurus 4', 'herbivoro', 'Stegosaurus', 'img/stego.png'),
('Stegosaurus 5', 'herbivoro', 'Stegosaurus', 'img/stego.png'),
('Stegosaurus 6', 'herbivoro', 'Stegosaurus', 'img/stego.png'),
('Stegosaurus 7', 'herbivoro', 'Stegosaurus', 'img/stego.png'),
('Stegosaurus 8', 'herbivoro', 'Stegosaurus', 'img/stego.png'),
('Stegosaurus 9', 'herbivoro', 'Stegosaurus', 'img/stego.png'),
('Stegosaurus 10', 'herbivoro', 'Stegosaurus', 'img/stego.png'),
-- Triceratops (10 figuras)
('Triceratops 1', 'herbivoro', 'Triceratops', 'img/trice.png'),
('Triceratops 2', 'herbivoro', 'Triceratops', 'img/trice.png'),
('Triceratops 3', 'herbivoro', 'Triceratops', 'img/trice.png'),
('Triceratops 4', 'herbivoro', 'Triceratops', 'img/trice.png'),
('Triceratops 5', 'herbivoro', 'Triceratops', 'img/trice.png'),
('Triceratops 6', 'herbivoro', 'Triceratops', 'img/trice.png'),
('Triceratops 7', 'herbivoro', 'Triceratops', 'img/trice.png'),
('Triceratops 8', 'herbivoro', 'Triceratops', 'img/trice.png'),
('Triceratops 9', 'herbivoro', 'Triceratops', 'img/trice.png'),
('Triceratops 10', 'herbivoro', 'Triceratops', 'img/trice.png'),
-- Velociraptor (10 figuras)
('Velociraptor 1', 'carnivoro', 'Raptor', 'img/raptor.png'),
('Velociraptor 2', 'carnivoro', 'Raptor', 'img/raptor.png'),
('Velociraptor 3', 'carnivoro', 'Raptor', 'img/raptor.png'),
('Velociraptor 4', 'carnivoro', 'Raptor', 'img/raptor.png'),
('Velociraptor 5', 'carnivoro', 'Raptor', 'img/raptor.png'),
('Velociraptor 6', 'carnivoro', 'Raptor', 'img/raptor.png'),
('Velociraptor 7', 'carnivoro', 'Raptor', 'img/raptor.png'),
('Velociraptor 8', 'carnivoro', 'Raptor', 'img/raptor.png'),
('Velociraptor 9', 'carnivoro', 'Raptor', 'img/raptor.png'),
('Velociraptor 10', 'carnivoro', 'Raptor', 'img/raptor.png'),
-- Brontosaurus (10 figuras)
('Brontosaurus 1', 'herbivoro', 'Sauropodo', 'img/bronto.png'),
('Brontosaurus 2', 'herbivoro', 'Sauropodo', 'img/bronto.png'),
('Brontosaurus 3', 'herbivoro', 'Sauropodo', 'img/bronto.png'),
('Brontosaurus 4', 'herbivoro', 'Sauropodo', 'img/bronto.png'),
('Brontosaurus 5', 'herbivoro', 'Sauropodo', 'img/bronto.png'),
('Brontosaurus 6', 'herbivoro', 'Sauropodo', 'img/bronto.png'),
('Brontosaurus 7', 'herbivoro', 'Sauropodo', 'img/bronto.png'),
('Brontosaurus 8', 'herbivoro', 'Sauropodo', 'img/bronto.png'),
('Brontosaurus 9', 'herbivoro', 'Sauropodo', 'img/bronto.png'),
('Brontosaurus 10', 'herbivoro', 'Sauropodo', 'img/bronto.png'),
-- Allosaurus (10 figuras)
('Allosaurus 1', 'carnivoro', 'Allosaurus', 'img/allo.png'),
('Allosaurus 2', 'carnivoro', 'Allosaurus', 'img/allo.png'),
('Allosaurus 3', 'carnivoro', 'Allosaurus', 'img/allo.png'),
('Allosaurus 4', 'carnivoro', 'Allosaurus', 'img/allo.png'),
('Allosaurus 5', 'carnivoro', 'Allosaurus', 'img/allo.png'),
('Allosaurus 6', 'carnivoro', 'Allosaurus', 'img/allo.png'),
('Allosaurus 7', 'carnivoro', 'Allosaurus', 'img/allo.png'),
('Allosaurus 8', 'carnivoro', 'Allosaurus', 'img/allo.png'),
('Allosaurus 9', 'carnivoro', 'Allosaurus', 'img/allo.png'),
('Allosaurus 10', 'carnivoro', 'Allosaurus', 'img/allo.png');