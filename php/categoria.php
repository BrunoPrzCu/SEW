<?php
class Categoria {
    private $conn;
    
    public function __construct() {
        $this->conn = DB::getInstance()->getConnection();
    }
    
    public function obtenerTodas() {
        try {
            $query = "SELECT * FROM categorias ORDER BY nombre";
            $stmt = $this->conn->query($query);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            return [];
        }
    }
    
    public function obtenerPorId($id) {
        try {
            $query = "SELECT * FROM categorias WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            return null;
        }
    }
}
?>