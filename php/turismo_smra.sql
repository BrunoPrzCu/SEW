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