<?php
class Reserva {
    private $conn;
    
    public function __construct() {
        $this->conn = DB::getInstance()->getConnection();
    }
    
    public function crear($usuarioId, $horarioId, $numPersonas, $recursoId = 0) {
        try {
            // Validar que exista el horario y esté disponible
            $horario = new Horario();
            $datosHorario = $horario->obtenerPorId($horarioId);
            
            if (!$datosHorario || !$datosHorario['disponible']) {
                return ['exito' => false, 'error' => 'El horario seleccionado no está disponible.'];
            }
            
            // Validar el recurso y las plazas disponibles
            $recurso = new Recurso();
            if ($recursoId > 0) {
                $datosRecurso = $recurso->obtenerPorId($recursoId);
            } else {
                // Si no se proporciona recursoId, obtenerlo del horario
                $datosRecurso = $recurso->obtenerPorId($datosHorario['recurso_id']);
            }
            
            if (!$datosRecurso) {
                return ['exito' => false, 'error' => 'El recurso no está disponible.'];
            }
            
            if ($numPersonas > $datosRecurso['plazas_totales']) {
                return ['exito' => false, 'error' => 'No hay suficientes plazas disponibles.'];
            }
            
            // Calcular el precio total
            $precioTotal = $datosRecurso['precio'] * $numPersonas;
            
            // Iniciar transacción
            $this->conn->beginTransaction();
            
            // Insertar la reserva
            $query = "INSERT INTO reservas (usuario_id, horario_id, num_personas, precio_total, fecha_reserva, estado)
                     VALUES (:usuario_id, :horario_id, :num_personas, :precio_total, NOW(), 'confirmada')";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':usuario_id', $usuarioId, PDO::PARAM_INT);
            $stmt->bindParam(':horario_id', $horarioId, PDO::PARAM_INT);
            $stmt->bindParam(':num_personas', $numPersonas, PDO::PARAM_INT);
            $stmt->bindParam(':precio_total', $precioTotal, PDO::PARAM_STR);
            
            if (!$stmt->execute()) {
                $this->conn->rollBack();
                return ['exito' => false, 'error' => 'Error al crear la reserva.'];
            }
            
            // Actualizar las plazas disponibles del recurso
            $nuevasPlazas = $datosRecurso['plazas_totales'] - $numPersonas;
            $queryActualizarPlazas = "UPDATE recursos_turisticos SET plazas_totales = :plazas WHERE id = :id";
            $stmtPlazas = $this->conn->prepare($queryActualizarPlazas);
            $stmtPlazas->bindParam(':plazas', $nuevasPlazas, PDO::PARAM_INT);
            $stmtPlazas->bindParam(':id', $datosRecurso['id'], PDO::PARAM_INT);
            
            if (!$stmtPlazas->execute()) {
                $this->conn->rollBack();
                return ['exito' => false, 'error' => 'Error al actualizar las plazas disponibles.'];
            }
            
            // Si no quedan plazas disponibles, marcar el horario como no disponible
            if ($nuevasPlazas <= 0) {
                if (!$horario->actualizarDisponibilidad($horarioId, 0)) {
                    $this->conn->rollBack();
                    return ['exito' => false, 'error' => 'Error al actualizar la disponibilidad del horario.'];
                }
            }
            
            $this->conn->commit();
            return ['exito' => true];
            
        } catch (PDOException $e) {
            if ($this->conn->inTransaction()) {
                $this->conn->rollBack();
            }
            return ['exito' => false, 'error' => 'Error en la base de datos al procesar la reserva: ' . $e->getMessage()];
        }
    }
    
    public function obtenerPorUsuario($usuarioId) {
        try {
            $query = "SELECT r.*, 
                     rt.nombre as recurso_nombre,
                     h.fecha_inicio,
                     h.fecha_fin,
                     h.recurso_id
                     FROM reservas r
                     JOIN horarios h ON r.horario_id = h.id
                     JOIN recursos_turisticos rt ON h.recurso_id = rt.id
                     WHERE r.usuario_id = :usuario_id
                     ORDER BY r.fecha_reserva DESC";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':usuario_id', $usuarioId, PDO::PARAM_INT);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            return [];
        }
    }
    
    public function anular($reservaId, $usuarioId) {
        try {
            // Verificar que la reserva pertenezca al usuario
            $query = "SELECT r.*, h.recurso_id 
                     FROM reservas r
                     JOIN horarios h ON r.horario_id = h.id
                     WHERE r.id = :id AND r.usuario_id = :usuario_id AND r.estado = 'confirmada'";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $reservaId, PDO::PARAM_INT);
            $stmt->bindParam(':usuario_id', $usuarioId, PDO::PARAM_INT);
            $stmt->execute();
            
            if ($stmt->rowCount() == 0) {
                return false; // La reserva no existe o no pertenece al usuario
            }
            
            $reserva = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Iniciar transacción
            $this->conn->beginTransaction();
            
            // Actualizar estado de la reserva
            $query = "UPDATE reservas SET estado = 'cancelada' WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $reservaId, PDO::PARAM_INT);
            
            if (!$stmt->execute()) {
                $this->conn->rollBack();
                return false;
            }
            
            // Obtener datos del recurso para actualizar plazas
            $recurso = new Recurso();
            $datosRecurso = $recurso->obtenerPorId($reserva['recurso_id']);
            
            if (!$datosRecurso) {
                $this->conn->rollBack();
                return false;
            }
            
            // Actualizar las plazas disponibles del recurso (devolver las plazas)
            $nuevasPlazas = $datosRecurso['plazas_totales'] + $reserva['num_personas'];
            $queryActualizarPlazas = "UPDATE recursos_turisticos SET plazas_totales = :plazas WHERE id = :id";
            $stmtPlazas = $this->conn->prepare($queryActualizarPlazas);
            $stmtPlazas->bindParam(':plazas', $nuevasPlazas, PDO::PARAM_INT);
            $stmtPlazas->bindParam(':id', $reserva['recurso_id'], PDO::PARAM_INT);
            
            if (!$stmtPlazas->execute()) {
                $this->conn->rollBack();
                return false;
            }
            
            // Actualizar disponibilidad del horario (si estaba completo, ahora hay plazas)
            $horario = new Horario();
            if (!$horario->actualizarDisponibilidad($reserva['horario_id'], 1)) {
                $this->conn->rollBack();
                return false;
            }
            
            $this->conn->commit();
            return true;
            
        } catch (PDOException $e) {
            if ($this->conn->inTransaction()) {
                $this->conn->rollBack();
            }
            return false;
        }
    }
}
?>