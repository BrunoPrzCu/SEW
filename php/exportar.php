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

// Formato estándar de cabeceras para compatibilidad con importación
$cabeceras_estandar = [
    'tabla', 'id', 'nombre', 'categoria_id', 'descripcion', 'plazas_totales', 
    'precio', 'ubicacion', 'imagen', 'recurso_id', 'fecha_inicio', 'fecha_fin', 
    'disponible', 'usuario_id', 'horario_id', 'num_personas', 'precio_total', 
    'fecha_reserva', 'estado', 'email', 'password', 'telefono', 'fecha_registro'
];

// Exportación de información completa
if (isset($_GET['completa']) && $_GET['completa'] == '1') {
    // Configuración para CSV
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="datos_completos_' . date('YmdHis') . '.csv"');
    
    // Conectar a la base de datos
    $conn = DB::getInstance()->getConnection();
    
    // Obtener lista de tablas
    $tablas = ['categorias', 'recursos_turisticos', 'horarios', 'reservas', 'usuarios'];
    
    // Abrir output stream
    $output = fopen('php://output', 'w');
    
    // Escribir la cabecera estándar
    fputcsv($output, $cabeceras_estandar);
    
    // Mapeo de columnas de cada tabla al formato estándar
    $mapeo_tablas = [
        'categorias' => [
            'tabla' => 'tabla',
            'id' => 'id',
            'nombre' => 'nombre',
            'descripcion' => 'descripcion'
        ],
        'recursos_turisticos' => [
            'tabla' => 'tabla',
            'id' => 'id',
            'nombre' => 'nombre',
            'categoria_id' => 'categoria_id',
            'descripcion' => 'descripcion',
            'plazas_totales' => 'plazas_totales',
            'precio' => 'precio',
            'ubicacion' => 'ubicacion',
            'imagen' => 'imagen'
        ],
        'horarios' => [
            'tabla' => 'tabla',
            'id' => 'id',
            'recurso_id' => 'recurso_id',
            'fecha_inicio' => 'fecha_inicio',
            'fecha_fin' => 'fecha_fin',
            'disponible' => 'disponible'
        ],
        'reservas' => [
            'tabla' => 'tabla',
            'id' => 'id',
            'usuario_id' => 'usuario_id',
            'horario_id' => 'horario_id',
            'num_personas' => 'num_personas',
            'precio_total' => 'precio_total',
            'fecha_reserva' => 'fecha_reserva',
            'estado' => 'estado'
        ],
        'usuarios' => [
            'tabla' => 'tabla',
            'id' => 'id',
            'nombre' => 'nombre',
            'email' => 'email',
            'password' => 'password',
            'telefono' => 'telefono',
            'fecha_registro' => 'fecha_registro'
        ]
    ];
    
    foreach ($tablas as $tabla) {
        try {
            // Preparar la consulta SQL
            $sql = "SELECT * FROM $tabla";
            $stmt = $conn->prepare($sql);
            $stmt->execute();
            $filas = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            foreach ($filas as $fila) {
                // Crear una fila con valores vacíos para todas las columnas estándar
                $fila_estandar = array_fill_keys($cabeceras_estandar, '');
                
                // Asignar valores de la tabla actual a la fila estándar
                $fila_estandar['tabla'] = $tabla;
                
                foreach ($fila as $columna => $valor) {
                    if (isset($mapeo_tablas[$tabla][$columna])) {
                        $columna_estandar = $mapeo_tablas[$tabla][$columna];
                        $fila_estandar[$columna_estandar] = $valor;
                    }
                }
                
                // Escribir la fila en el archivo CSV
                fputcsv($output, $fila_estandar);
            }
        } catch (Exception $e) {
            // Manejar error silenciosamente
            continue;
        }
    }
    
    // Cerrar stream
    fclose($output);
    exit;
}

// Si llega aquí, procesar exportación normal de una tabla
if (!isset($_GET['tabla'])) {
    header("HTTP/1.1 400 Bad Request");
    echo "Parámetro 'tabla' requerido";
    exit;
}

$tabla = $_GET['tabla'];
$filtro = isset($_GET['filtro']) ? $_GET['filtro'] : '';
$nombreArchivo = $tabla . '_' . date('YmdHis') . '.csv';

// Conectar a la base de datos
$conn = DB::getInstance()->getConnection();

// Preparar la consulta SQL
$sql = "SELECT * FROM $tabla";
if (!empty($filtro)) {
    $sql .= " WHERE $filtro";
}

$stmt = $conn->prepare($sql);
$stmt->execute();
$datos = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (empty($datos)) {
    header("HTTP/1.1 404 Not Found");
    echo "No se encontraron datos para exportar";
    exit;
}

// Configurar headers para descarga del archivo
header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename="' . $nombreArchivo . '"');

// Abrir output stream
$output = fopen('php://output', 'w');

// Preparamos la fila de encabezados
if ($tabla == 'categorias' || $tabla == 'recursos_turisticos' || $tabla == 'horarios') {
    // Para estas tablas, usamos el formato específico para importación
    $cabeceras = ['tabla'];
    foreach (array_keys($datos[0]) as $columna) {
        $cabeceras[] = $columna;
    }
    fputcsv($output, $cabeceras);
    
    // Escribir datos con formato para importación
    foreach ($datos as $fila) {
        $fila_con_tabla = array_merge([$tabla], array_values($fila));
        fputcsv($output, $fila_con_tabla);
    }
} else {
    // Para otras tablas, usamos el formato estándar
    fputcsv($output, array_keys($datos[0]));
    
    // Escribir datos
    foreach ($datos as $fila) {
        fputcsv($output, $fila);
    }
}

// Cerrar stream
fclose($output);
exit;
?>