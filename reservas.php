<?php
// Iniciar sesión para manejar la autenticación del usuario
session_start();

// Incluir archivos necesarios (todos en la carpeta php)
require_once 'php/config.php';
require_once 'php/db.php';
require_once 'php/usuario.php';
require_once 'php/categoria.php';
require_once 'php/recurso.php';
require_once 'php/horario.php';
require_once 'php/reserva.php';

// Variables para controlar la visualización
$mostrarLogin = true;
$mostrarRegistro = false;
$mostrarRecursos = false;
$mostrarDetalle = false;
$mostrarReservas = false;
$mensajeExito = '';
$mensajeError = '';

// Verificar si hay un usuario logueado
$usuarioLogueado = isset($_SESSION['usuario_id']);

// Procesar acciones según el parámetro 'accion'
if (isset($_GET['accion'])) {
    switch ($_GET['accion']) {
        case 'login':
            if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['email']) && isset($_POST['password'])) {
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
            break;
            
        case 'registro':
            $mostrarLogin = false;
            $mostrarRegistro = true;
            
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $usuario = new Usuario();
                
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
                        
                        // Cargar las reservas del usuario
                        $reservas = $reserva->obtenerPorUsuario($_SESSION['usuario_id']);
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