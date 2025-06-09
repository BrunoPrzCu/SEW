<?php
// Importar archivos necesarios
require_once 'config.php';
require_once 'db.php';
require_once 'usuario.php';
require_once 'csv_manager.php';

// Iniciar sesión
session_start();

// Verifica si el usuario tiene permisos de administrador
$esAdmin = isset($_SESSION['usuario_id']);

// Variables para mensajes
$mensajeExito = '';
$mensajeError = '';
$mostrarResultados = false;
$resultadoOperacion = [];

// Procesar acciones
if (isset($_GET['accion']) && $esAdmin) {
    switch ($_GET['accion']) {
        case 'importar':
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                // Verificar si se ha subido un archivo
                if (isset($_FILES['archivo_csv']) && $_FILES['archivo_csv']['error'] === UPLOAD_ERR_OK) {
                    $archivoTemporal = $_FILES['archivo_csv']['tmp_name'];
                    $tabla = $_POST['tabla'];
                    
                    // Importar datos directamente desde el archivo temporal
                    $csvManager = new CSVManager();
                    $resultadoOperacion = $csvManager->importarDesdeCSV($tabla, $archivoTemporal);
                    
                    if ($resultadoOperacion['exito']) {
                        $mensajeExito = "Importación exitosa: " . $resultadoOperacion['registrosImportados'] . " registros importados.";
                    } else {
                        $mensajeError = "Error en la importación.";
                    }
                    
                    $mostrarResultados = true;
                } else {
                    $mensajeError = "Debe seleccionar un archivo CSV para importar.";
                }
            }
            break;
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <meta name="description" content="Administración del sistema de reservas turísticas en San Martín del Rey Aurelio"/>
    <meta name="keywords" content="admin, administración, reservas, turismo, San Martín del Rey Aurelio"/>
    <meta name="author" content="Bruno Pérez Cuervo"/>
    <title>Administración - San Martín del Rey Aurelio</title>
    <link rel="stylesheet" type="text/css" href="../estilo/estilo.css"/>
    <link rel="stylesheet" type="text/css" href="../estilo/layout.css"/>
</head>
<body>
    <header>
        <h1>San Martín del Rey Aurelio</h1>
        <h2>Administración</h2>
    </header>

    <nav>
        <ul>
            <li><a href="../index.html">Página principal</a></li>
            <li><a href="../reservas.php">Reservas</a></li>
            <li><a href="admin.php" class="activo">Administración</a></li>
        </ul>
    </nav>

    <main>
        <?php if (!$esAdmin): ?>
        <section>
            <h2>Acceso restringido</h2>
            <p>Debe iniciar sesión para acceder a la administración.</p>
            <p><a href="../reservas.php">Ir a la página de inicio de sesión</a></p>
        </section>
        <?php else: ?>
        <section>
            <h2>Administración de datos</h2>
            
            <?php if (!empty($mensajeExito)): ?>
                <p><?php echo $mensajeExito; ?></p>
            <?php endif; ?>
            
            <?php if (!empty($mensajeError)): ?>
                <p><?php echo $mensajeError; ?></p>
            <?php endif; ?>
            
            <?php if ($mostrarResultados && isset($resultadoOperacion['errores']) && !empty($resultadoOperacion['errores'])): ?>
            <section>
                <h3>Detalles de errores</h3>
                <ul>
                    <?php foreach($resultadoOperacion['errores'] as $error): ?>
                        <li><?php echo $error; ?></li>
                    <?php endforeach; ?>
                </ul>
            </section>
            <?php endif; ?>
        </section>

        <section>
            <h2>Importar datos CSV</h2>
            <form action="admin.php?accion=importar" method="post" enctype="multipart/form-data">
                <fieldset>
                    <legend>Importación de datos</legend>
                    
                    <p>
                        <label for="tabla">Tabla destino:</label>
                        <select id="tabla" name="tabla" required>
                            <option value="">-- Seleccione una tabla --</option>
                            <option value="usuarios">Usuarios</option>
                            <option value="categorias">Categorías</option>
                            <option value="recursos_turisticos">Recursos Turísticos</option>
                            <option value="horarios">Horarios</option>
                            <option value="reservas">Reservas</option>
                            <option value="">Múltiples tablas (desde datos_iniciales.csv)</option>
                        </select>
                    </p>
                    
                    <p>
                        <label for="archivo_csv">Archivo CSV:</label>
                        <input type="file" id="archivo_csv" name="archivo_csv" accept=".csv" required />
                    </p>
                    
                    <p>
                        <button type="submit">Importar datos</button>
                    </p>
                </fieldset>
            </form>
        </section>

        <section>
            <h2>Exportar datos a CSV</h2>
            <form action="exportar.php" method="get">
                <fieldset>
                    <legend>Exportación de datos</legend>
                    
                    <p>
                        <label for="tabla_export">Tabla a exportar:</label>
                        <select id="tabla_export" name="tabla" required>
                            <option value="">-- Seleccione una tabla --</option>
                            <option value="usuarios">Usuarios</option>
                            <option value="categorias">Categorías</option>
                            <option value="recursos_turisticos">Recursos Turísticos</option>
                            <option value="horarios">Horarios</option>
                            <option value="reservas">Reservas</option>
                        </select>
                    </p>
                    
                    <p>
                        <label for="filtro">Filtro (opcional):</label>
                        <input type="text" id="filtro" name="filtro" placeholder="Ejemplo: id > 5 AND categoria_id = 2" />
                    </p>
                    
                    <p>
                        <button type="submit">Exportar datos</button>
                    </p>
                    <p>
                        <small>El navegador descargará automáticamente el archivo CSV.</small>
                    </p>
                </fieldset>
            </form>
        </section>
        <?php endif; ?>
    </main>

    <footer>
        <p>San Martín del Rey Aurelio - Turismo</p>
        <p>Universidad de Oviedo - Software y Estándares para la Web</p>
        <p>Bruno Pérez Cuervo</p>
    </footer>
</body>
</html>