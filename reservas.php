<?php
// Iniciar sesión para manejar la autenticación del usuario
session_start();

// Incluir archivos necesarios
require_once 'php/config.php';
require_once 'php/db.php';
require_once 'php/usuario.php';
require_once 'php/categoria.php';
require_once 'php/recurso.php';
require_once 'php/horario.php';
require_once 'php/reserva.php';

// Solo cargar csv_manager.php si es necesario
if (isset($_GET['accion']) && ($_GET['accion'] == 'imp_exp' || $_GET['accion'] == 'importar')) {
    require_once 'php/csv_manager.php';
}

// Variables para controlar la visualización
$mostrarLogin = true;
$mostrarRegistro = false;
$mostrarRecursos = false;
$mostrarDetalle = false;
$mostrarReservas = false;
$mostrarImpExp = false;
$mensajeExito = '';
$mensajeError = '';
$mostrarResultados = false;
$resultadoOperacion = [];

// Verificar si hay un usuario logueado
$usuarioLogueado = isset($_SESSION['usuario_id']);

// Procesar acciones según el parámetro 'accion'
if (isset($_GET['accion'])) {
    switch ($_GET['accion']) {
        case 'login':
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                // Validación del lado del servidor
                if (empty($_POST['email']) || empty($_POST['password'])) {
                    $mensajeError = 'Debe completar todos los campos.';
                } else if (!filter_var($_POST['email'], FILTER_VALIDATE_EMAIL)) {
                    $mensajeError = 'El formato del email no es válido.';
                } else {
                    // Autenticar usuario
                    $usuario = new Usuario();
                    if ($usuario->login($_POST['email'], $_POST['password'])) {
                        $usuarioLogueado = true;
                        $mostrarLogin = false;
                        $mostrarRecursos = true;
                        $mensajeExito = 'Inicio de sesión exitoso.';
                    } else {
                        $mensajeError = 'Credenciales incorrectas.';
                    }
                }
            }
            break;
            
        case 'registro':
            $mostrarLogin = false;
            $mostrarRegistro = true;
            
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                // Validación del lado del servidor
                $errores = array();
                
                if (empty($_POST['nombre']) || strlen($_POST['nombre']) < 3) {
                    $errores[] = 'El nombre debe tener al menos 3 caracteres.';
                }
                
                if (empty($_POST['email']) || !filter_var($_POST['email'], FILTER_VALIDATE_EMAIL)) {
                    $errores[] = 'El formato del email no es válido.';
                }
                
                if (empty($_POST['password']) || strlen($_POST['password']) < 6) {
                    $errores[] = 'La contraseña debe tener al menos 6 caracteres.';
                }
                
                if (empty($_POST['telefono']) || !preg_match('/^[0-9]{9}$/', $_POST['telefono'])) {
                    $errores[] = 'El teléfono debe tener 9 dígitos numéricos.';
                }
                
                if (empty($errores)) {
                    $usuario = new Usuario();
                    
                    // Verificar si el email ya existe
                    if ($usuario->existeEmail($_POST['email'])) {
                        $mensajeError = 'Este email ya está registrado.';
                    } else {
                        if ($usuario->registrar($_POST['nombre'], $_POST['email'], $_POST['password'], $_POST['telefono'])) {
                            $mensajeExito = 'Usuario registrado correctamente. Ahora puede iniciar sesión.';
                            $mostrarRegistro = false;
                            $mostrarLogin = true;
                        } else {
                            $mensajeError = 'Error al registrar el usuario.';
                        }
                    }
                } else {
                    $mensajeError = implode('<p>', $errores);
                }
            }
            break;
            
        case 'cerrar_sesion':
            session_unset();
            session_destroy();
            $usuarioLogueado = false;
            $mostrarLogin = true;
            $mensajeExito = 'Sesión cerrada correctamente.';
            break;
            
        case 'recursos':
            if ($usuarioLogueado) {
                $mostrarLogin = false;
                $mostrarRecursos = true;
                // Obtener todos los recursos o filtrar por categoría
                $categoriaId = isset($_GET['categoria']) ? (int)$_GET['categoria'] : 0;
                
                $recurso = new Recurso();
                if ($categoriaId > 0) {
                    $recursos = $recurso->obtenerPorCategoria($categoriaId);
                } else {
                    $recursos = $recurso->obtenerTodos();
                }
                
                $categoria = new Categoria();
                $categorias = $categoria->obtenerTodas();
            } else {
                $mensajeError = 'Debe iniciar sesión para ver los recursos.';
            }
            break;
            
        case 'detalle_recurso':
            if ($usuarioLogueado) {
                $mostrarLogin = false;
                $mostrarDetalle = true;
                $recursoId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
                
                $recurso = new Recurso();
                $detalleRecurso = $recurso->obtenerPorId($recursoId);
                
                $horario = new Horario();
                $horarios = $horario->obtenerPorRecurso($recursoId);
            } else {
                $mensajeError = 'Debe iniciar sesión para ver los detalles del recurso.';
            }
            break;
            
        case 'reservar':
            if ($usuarioLogueado) {
                if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                    // Validación del lado del servidor
                    if (empty($_POST['horario_id']) || !is_numeric($_POST['horario_id'])) {
                        $mensajeError = 'Debe seleccionar un horario válido.';
                    } else if (empty($_POST['num_personas']) || !is_numeric($_POST['num_personas']) || $_POST['num_personas'] < 1) {
                        $mensajeError = 'El número de personas debe ser al menos 1.';
                    } else {
                        $reserva = new Reserva();
                        $resultado = $reserva->crear(
                            $_SESSION['usuario_id'],
                            $_POST['horario_id'],
                            (int)$_POST['num_personas'],
                            isset($_POST['recurso_id']) ? (int)$_POST['recurso_id'] : 0
                        );
                        
                        if ($resultado['exito']) {
                            $mensajeExito = 'Reserva realizada correctamente.';
                            $mostrarRecursos = false;
                            $mostrarReservas = true;
                        } else {
                            $mensajeError = $resultado['error'];
                            $mostrarDetalle = true;
                            // Volver a cargar los datos del recurso y horarios
                            $recursoId = isset($_POST['recurso_id']) ? (int)$_POST['recurso_id'] : 0;
                            
                            $recurso = new Recurso();
                            $detalleRecurso = $recurso->obtenerPorId($recursoId);
                            
                            $horario = new Horario();
                            $horarios = $horario->obtenerPorRecurso($recursoId);
                        }
                    }
                }
            } else {
                $mensajeError = 'Debe iniciar sesión para realizar una reserva.';
            }
            break;
            
        case 'mis_reservas':
            if ($usuarioLogueado) {
                $mostrarLogin = false;
                $mostrarReservas = true;
                
                $reserva = new Reserva();
                $reservas = $reserva->obtenerPorUsuario($_SESSION['usuario_id']);
            } else {
                $mensajeError = 'Debe iniciar sesión para ver sus reservas.';
            }
            break;
            
        case 'anular_reserva':
            if ($usuarioLogueado) {
                $reservaId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
                
                $reserva = new Reserva();
                if ($reserva->anular($reservaId, $_SESSION['usuario_id'])) {
                    $mensajeExito = 'Reserva anulada correctamente.';
                } else {
                    $mensajeError = 'No se pudo anular la reserva.';
                }
                $mostrarLogin = false;
                $mostrarReservas = true;
                $reservas = $reserva->obtenerPorUsuario($_SESSION['usuario_id']);
            } else {
                $mensajeError = 'Debe iniciar sesión para anular una reserva.';
            }
            break;
            
        // Nueva acción para importar/exportar
        case 'imp_exp':
            if ($usuarioLogueado) {
                $mostrarLogin = false;
                $mostrarImpExp = true;
            } else {
                $mensajeError = 'Debe iniciar sesión para acceder a esta funcionalidad.';
            }
            break;
            
        // Nueva acción para manejar la importación
        case 'importar':
            if ($usuarioLogueado) {
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
                        $mostrarImpExp = true;
                    } else {
                        $mensajeError = "Debe seleccionar un archivo CSV para importar.";
                        $mostrarImpExp = true;
                    }
                }
            } else {
                $mensajeError = 'Debe iniciar sesión para realizar esta acción.';
            }
            break;
    }
} else {
    // Si no hay acción especificada y el usuario está logueado, mostrar recursos
    if ($usuarioLogueado) {
        $mostrarLogin = false;
        $mostrarRecursos = true;
        
        $recurso = new Recurso();
        $recursos = $recurso->obtenerTodos();
        
        $categoria = new Categoria();
        $categorias = $categoria->obtenerTodas();
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <meta name="description" content="Sistema de reservas turísticas en San Martín del Rey Aurelio, Asturias"/>
    <meta name="keywords" content="reservas, alojamiento, hoteles, turismo rural, San Martín del Rey Aurelio, vacaciones, escapada, Asturias"/>
    <meta name="author" content="Bruno Pérez Cuervo"/>
    <title>Reservas - San Martín del Rey Aurelio</title>
    <link rel="stylesheet" type="text/css" href="estilo/estilo.css"/>
    <link rel="stylesheet" type="text/css" href="estilo/layout.css"/>
</head>
<body>
    <header>
        <h1>San Martín del Rey Aurelio</h1>
        <h2>Reservas</h2>
    </header>

    <nav>
        <ul>
            <li><a href="index.html">Página principal</a></li>
            <li><a href="gastronomia.html">Gastronomía</a></li>
            <li><a href="rutas.html">Rutas</a></li>
            <li><a href="meteorologia.html">Meteorología</a></li>
            <li><a href="juego.html">Juego</a></li>
            <li><a href="reservas.php" class="activo">Reservas</a></li>
            <li><a href="ayuda.html">Ayuda</a></li>
        </ul>
    </nav>

    <main>
        <section>
            <h2>Sistema de reservas</h2>
            <p>Utiliza nuestro sistema para realizar reservas en alojamientos, restaurantes y experiencias turísticas de San Martín del Rey Aurelio.</p>
            <p>Garantiza tu plaza en los mejores establecimientos y actividades del concejo.</p>
            
            <?php if (!empty($mensajeExito)): ?>
                <p><?php echo $mensajeExito; ?></p>
            <?php endif; ?>
            
            <?php if (!empty($mensajeError)): ?>
                <p><?php echo $mensajeError; ?></p>
            <?php endif; ?>
        </section>
        
        <?php if ($usuarioLogueado): ?>
        <section>
            <nav>
                <ul>
                    <li><a href="reservas.php?accion=recursos">Ver recursos turísticos</a></li>
                    <li><a href="reservas.php?accion=mis_reservas">Mis reservas</a></li>
                    <li><a href="reservas.php?accion=imp_exp">Importar/Exportar datos</a></li>
                    <li><a href="reservas.php?accion=cerrar_sesion">Cerrar sesión</a></li>
                </ul>
            </nav>
            <p>Bienvenido/a, <?php echo htmlspecialchars($_SESSION['usuario_nombre']); ?></p>
        </section>
        <?php endif; ?>
        
        <?php if ($mostrarLogin): ?>
        <section>
            <h2>Iniciar sesión</h2>
            <form action="reservas.php?accion=login" method="post">
                <fieldset>
                    <legend>Datos de acceso</legend>
                    
                    <p>
                        <label for="email">Correo electrónico:</label>
                        <input type="email" id="email" name="email" required />
                    </p>
                    
                    <p>
                        <label for="password">Contraseña:</label>
                        <input type="password" id="password" name="password" required />
                    </p>
                    
                    <p>
                        <button type="submit">Iniciar sesión</button>
                    </p>
                </fieldset>
            </form>
            
            <p>¿No tienes una cuenta? <a href="reservas.php?accion=registro">Regístrate aquí</a></p>
        </section>
        <?php endif; ?>
        
        <?php if ($mostrarRegistro): ?>
        <section>
            <h2>Registro de usuario</h2>
            <form action="reservas.php?accion=registro" method="post">
                <fieldset>
                    <legend>Datos de registro</legend>
                    
                    <p>
                        <label for="nombre">Nombre completo:</label>
                        <input type="text" id="nombre" name="nombre" minlength="3" required />
                    </p>
                    
                    <p>
                        <label for="registro_email">Correo electrónico:</label>
                        <input type="email" id="registro_email" name="email" required />
                    </p>
                    
                    <p>
                        <label for="registro_password">Contraseña:</label>
                        <input type="password" id="registro_password" name="password" minlength="6" required />
                    </p>
                    
                    <p>
                        <label for="telefono">Teléfono:</label>
                        <input type="tel" id="telefono" name="telefono" pattern="[0-9]{9}" required />
                        <small>Formato: 9 dígitos numéricos</small>
                    </p>
                    
                    <p>
                        <button type="submit">Registrarse</button>
                    </p>
                </fieldset>
            </form>
            
            <p>¿Ya tienes una cuenta? <a href="reservas.php">Iniciar sesión</a></p>
        </section>
        <?php endif; ?>
        
        <?php if ($mostrarImpExp): ?>
        <section>
            <h2>Importar y Exportar Datos</h2>
            
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
            
            <section>
                <h3>Importar datos CSV</h3>
                <form action="reservas.php?accion=importar" method="post" enctype="multipart/form-data">
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
            <h3>Exportar datos a CSV</h3>
            <form action="php/exportar.php" method="get">
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
                </fieldset>
            </form>
            
            <form action="php/exportar.php" method="get">
                <fieldset>
                    <legend>Exportación completa</legend>
                    <p>Exporta todos los datos de la base de datos en un único archivo CSV.</p>
                    <input type="hidden" name="completa" value="1" />
                    <p>
                        <button type="submit">Exportar toda la información</button>
                    </p>
                </fieldset>
            </form>
            
            <p>
                <small>El navegador descargará automáticamente el archivo CSV.</small>
            </p>
        </section>
        </section>
        <?php endif; ?>
        
        <?php if ($mostrarRecursos && isset($recursos) && isset($categorias)): ?>
        <section>
            <h2>Recursos turísticos disponibles</h2>
            
            <section>
                <h3>Filtrar por categoría</h3>
                <ul>
                    <li><a href="reservas.php?accion=recursos">Todas las categorías</a></li>
                    <?php foreach ($categorias as $categoria): ?>
                    <li><a href="reservas.php?accion=recursos&categoria=<?php echo $categoria['id']; ?>"><?php echo htmlspecialchars($categoria['nombre']); ?></a></li>
                    <?php endforeach; ?>
                </ul>
            </section>
            
            <?php if (count($recursos) > 0): ?>
                <ul>
                <?php foreach ($recursos as $recurso): ?>
                    <li>
                        <article>
                            <h3><?php echo htmlspecialchars($recurso['nombre']); ?></h3>
                            <p><?php echo htmlspecialchars($recurso['descripcion']); ?></p>
                            <p>Categoría: <?php echo htmlspecialchars($recurso['categoria_nombre']); ?></p>
                            <p>Precio: <?php echo number_format($recurso['precio'], 2); ?>€</p>
                            <p>Plazas disponibles: <?php echo $recurso['plazas_totales']; ?></p>
                            <p><a href="reservas.php?accion=detalle_recurso&id=<?php echo $recurso['id']; ?>">Ver detalles y reservar</a></p>
                        </article>
                    </li>
                <?php endforeach; ?>
                </ul>
            <?php else: ?>
                <p>No hay recursos disponibles para la categoría seleccionada.</p>
            <?php endif; ?>
        </section>
        <?php endif; ?>
        
        <?php if ($mostrarDetalle && isset($detalleRecurso) && isset($horarios)): ?>
        <section>
            <h2><?php echo htmlspecialchars($detalleRecurso['nombre']); ?></h2>
            
            <section>
                <h3>Detalles del recurso</h3>
                <p><?php echo htmlspecialchars($detalleRecurso['descripcion']); ?></p>
                <p>Categoría: <?php echo htmlspecialchars($detalleRecurso['categoria_nombre']); ?></p>
                <p>Precio por persona: <?php echo number_format($detalleRecurso['precio'], 2); ?>€</p>
                <p>Plazas totales: <?php echo $detalleRecurso['plazas_totales']; ?></p>
                <p>Ubicación: <?php echo htmlspecialchars($detalleRecurso['ubicacion']); ?></p>
            </section>
            
            <?php if (count($horarios) > 0): ?>
            <section>
                <h3>Horarios disponibles</h3>
                
                <form action="reservas.php?accion=reservar" method="post">
                    <input type="hidden" name="recurso_id" value="<?php echo $detalleRecurso['id']; ?>" />
                    
                    <fieldset>
                        <legend>Seleccionar horario y número de personas</legend>
                        
                        <p>
                            <label for="horario_id">Seleccione un horario:</label>
                            <select id="horario_id" name="horario_id" required>
                                <option value="">-- Seleccione un horario --</option>
                                <?php foreach ($horarios as $horario): ?>
                                <?php if ($horario['disponible']): ?>
                                <option value="<?php echo $horario['id']; ?>">
                                    <?php 
                                        $inicio = new DateTime($horario['fecha_inicio']);
                                        $fin = new DateTime($horario['fecha_fin']);
                                        echo $inicio->format('d/m/Y H:i') . ' - ' . $fin->format('H:i'); 
                                    ?>
                                </option>
                                <?php endif; ?>
                                <?php endforeach; ?>
                            </select>
                        </p>
                        
                        <p>
                            <label for="num_personas">Número de personas:</label>
                            <input type="number" id="num_personas" name="num_personas" min="1" max="<?php echo $detalleRecurso['plazas_totales']; ?>" value="1" required />
                        </p>
                        
                        <p>
                            <button type="submit">Reservar</button>
                        </p>
                    </fieldset>
                </form>
            </section>
            <?php else: ?>
            <p>No hay horarios disponibles para este recurso en este momento.</p>
            <?php endif; ?>
            
            <p><a href="reservas.php?accion=recursos">Volver a la lista de recursos</a></p>
        </section>
        <?php endif; ?>
        
        <?php if ($mostrarReservas && isset($reservas)): ?>
        <section>
            <h2>Mis reservas</h2>
            
            <?php if (count($reservas) > 0): ?>
            <ul>
                <?php foreach ($reservas as $reserva): ?>
                <li>
                    <article>
                        <h3><?php echo htmlspecialchars($reserva['recurso_nombre']); ?></h3>
                        <p>Fecha: 
                            <?php 
                                $inicio = new DateTime($reserva['fecha_inicio']);
                                $fin = new DateTime($reserva['fecha_fin']);
                                echo $inicio->format('d/m/Y H:i') . ' - ' . $fin->format('H:i'); 
                            ?>
                        </p>
                        <p>Número de personas: <?php echo $reserva['num_personas']; ?></p>
                        <p>Precio total: <?php echo number_format($reserva['precio_total'], 2); ?>€</p>
                        <p>Estado: <?php echo ($reserva['estado'] == 'confirmada') ? 'Confirmada' : 'Cancelada'; ?></p>
                        <p>Fecha de reserva: <?php echo (new DateTime($reserva['fecha_reserva']))->format('d/m/Y H:i'); ?></p>
                        
                        <?php if ($reserva['estado'] == 'confirmada'): ?>
                        <p>
                            <a href="reservas.php?accion=anular_reserva&id=<?php echo $reserva['id']; ?>" onclick="return confirm('¿Está seguro de que desea anular esta reserva?');">Anular reserva</a>
                        </p>
                        <?php endif; ?>
                    </article>
                </li>
                <?php endforeach; ?>
            </ul>
            <?php else: ?>
            <p>No tiene reservas actualmente.</p>
            <?php endif; ?>
            
            <p><a href="reservas.php?accion=recursos">Ver recursos disponibles</a></p>
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