<?php
class Horario {
    private $conn;
    
    public function __construct() {
        $this->conn = DB::getInstance()->getConnection();
    }
    
    public function obtenerPorRecurso($recursoId) {
        try {
            $query = "SELECT * FROM horarios 
                     WHERE recurso_id = :recurso_id 
                     AND fecha_inicio > NOW() 
                     AND disponible = 1
                     ORDER BY fecha_inicio";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':recurso_id', $recursoId, PDO::PARAM_INT);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            return [];
        }
    }
    
    public function obtenerPorId($id) {
        try {
            $query = "SELECT h.*, r.precio, r.nombre as recurso_nombre 
                     FROM horarios h
                     JOIN recursos_turisticos r ON h.recurso_id = r.id
                     WHERE h.id = :id";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            return null;
        }
    }
    
    public function actualizarDisponibilidad($id, $disponible) {
        try {
            $query = "UPDATE horarios SET disponible = :disponible WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':disponible', $disponible, PDO::PARAM_BOOL);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            
            return $stmt->execute();
        } catch (PDOException $e) {
            return false;
        }
    }
}
?>