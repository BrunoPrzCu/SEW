-- Base de datos para el sistema de reservas turísticas de San Martín del Rey Aurelio
-- Usuario: DBUSER2025
-- Contraseña: DBPWD2025

-- Creación de la base de datos
CREATE DATABASE IF NOT EXISTS turismo_smra;
USE turismo_smra;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de categorías
CREATE TABLE IF NOT EXISTS categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT
);

-- Tabla de recursos turísticos
CREATE TABLE IF NOT EXISTS recursos_turisticos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    categoria_id INT NOT NULL,
    descripcion TEXT,
    plazas_totales INT NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    ubicacion VARCHAR(255),
    imagen VARCHAR(255),
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

-- Tabla de horarios
CREATE TABLE IF NOT EXISTS horarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recurso_id INT NOT NULL,
    fecha_inicio DATETIME NOT NULL,
    fecha_fin DATETIME NOT NULL,
    disponible BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (recurso_id) REFERENCES recursos_turisticos(id)
);

-- Tabla de reservas
CREATE TABLE IF NOT EXISTS reservas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    horario_id INT NOT NULL,
    num_personas INT NOT NULL,
    precio_total DECIMAL(10,2) NOT NULL,
    fecha_reserva DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('confirmada', 'cancelada') DEFAULT 'confirmada',
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (horario_id) REFERENCES horarios(id)
);

-- Insertar datos de categorías
INSERT INTO categorias (nombre, descripcion) VALUES
('Museo', 'Visitas guiadas a museos y exposiciones'),
('Ruta', 'Rutas guiadas por el entorno natural'),
('Restaurante', 'Degustaciones gastronómicas tradicionales'),
('Hotel', 'Alojamientos con encanto'),
('Actividad', 'Actividades recreativas y culturales');

-- Insertar datos de recursos turísticos
INSERT INTO recursos_turisticos (nombre, categoria_id, descripcion, plazas_totales, precio, ubicacion, imagen) VALUES
('Museo de la Minería', 1, 'Museo etnográfico sobre la historia minera de la región', 25, 8.50, 'Calle Principal 10, SMRA', 'museo_mineria.jpg'),
('Ruta del Nalón', 2, 'Ruta guiada por el valle del río Nalón', 15, 12.00, 'Punto de encuentro: Plaza del Ayuntamiento', 'ruta_nalon.jpg'),
('Sidrería El Minero', 3, 'Degustación de sidra y platos tradicionales asturianos', 30, 25.00, 'Avenida del Parque 5, SMRA', 'sidreria.jpg'),
('Hotel La Casona', 4, 'Hotel rural tradicional asturiano', 20, 65.00, 'Carretera de la Montaña km 5', 'hotel_casona.jpg'),
('Visita al Pozo Sotón', 5, 'Visita guiada a una auténtica mina de carbón', 10, 15.00, 'Barrio minero s/n', 'pozo_soton.jpg');

-- Insertar datos de horarios (para los próximos 30 días)
INSERT INTO horarios (recurso_id, fecha_inicio, fecha_fin, disponible) VALUES
(1, '2025-06-10 10:00:00', '2025-06-10 12:00:00', TRUE),
(1, '2025-06-11 16:00:00', '2025-06-11 18:00:00', TRUE),
(1, '2025-06-15 10:00:00', '2025-06-15 12:00:00', TRUE),
(2, '2025-06-12 09:00:00', '2025-06-12 14:00:00', TRUE),
(2, '2025-06-19 09:00:00', '2025-06-19 14:00:00', TRUE),
(3, '2025-06-10 13:30:00', '2025-06-10 15:30:00', TRUE),
(3, '2025-06-10 20:30:00', '2025-06-10 22:30:00', TRUE),
(3, '2025-06-11 13:30:00', '2025-06-11 15:30:00', TRUE),
(3, '2025-06-11 20:30:00', '2025-06-11 22:30:00', TRUE),
(4, '2025-06-10 14:00:00', '2025-06-11 12:00:00', TRUE),
(4, '2025-06-15 14:00:00', '2025-06-16 12:00:00', TRUE),
(5, '2025-06-14 11:00:00', '2025-06-14 13:00:00', TRUE),
(5, '2025-06-21 11:00:00', '2025-06-21 13:00:00', TRUE);