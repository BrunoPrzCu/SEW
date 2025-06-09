<?php
// Este archivo se encarga de enviar los datos CSV directamente al navegador para su descarga

// Iniciar sesión para verificar permisos
session_start();

// Verificar que el usuario esté autenticado
if (!isset($_SESSION['usuario_id'])) {
    header("HTTP/1.1 403 Forbidden");
    echo "Acceso denegado";
    exit;
}

// Incluir archivos necesarios
require_once 'config.php';
require_once 'db.php';
require_once 'csv_manager.php';

// Verificar parámetros
if (!isset($_GET['tabla'])) {
    header("HTTP/1.1 400 Bad Request");
    echo "Parámetro 'tabla' requerido";
    exit;
}

$tabla = $_GET['tabla'];
$filtro = isset($_GET['filtro']) ? $_GET['filtro'] : '';
$nombreArchivo = $tabla . '_' . date('YmdHis') . '.csv';

// Instanciar gestor CSV
$csvManager = new CSVManager();
$resultado = $csvManager->prepararExportacionCSV($tabla, $filtro);

if (!$resultado['exito']) {
    header("HTTP/1.1 404 Not Found");
    echo "No se encontraron datos para exportar";
    exit;
}

// Configurar headers para descarga del archivo
header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename="' . $nombreArchivo . '"');

// Abrir output stream
$output = fopen('php://output', 'w');

// Enviar BOM para UTF-8
// fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));

// Escribir cabeceras si hay datos
if (!empty($resultado['datos'])) {
    fputcsv($output, array_keys($resultado['datos'][0]));
    
    // Escribir filas
    foreach ($resultado['datos'] as $fila) {
        fputcsv($output, $fila);
    }
}

// Cerrar stream
fclose($output);
exit; // Importante para asegurar que no se envíe otro contenido
?>