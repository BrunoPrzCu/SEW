<?php
class Recurso {
    private $conn;
    
    public function __construct() {
        $this->conn = DB::getInstance()->getConnection();
    }
    
    public function obtenerTodos() {
        try {
            $query = "SELECT r.*, c.nombre as categoria_nombre 
                     FROM recursos_turisticos r
                     JOIN categorias c ON r.categoria_id = c.id
                     ORDER BY r.nombre";
            
            $stmt = $this->conn->query($query);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            return [];
        }
    }
    
    public function obtenerPorCategoria($categoriaId) {
        try {
            $query = "SELECT r.*, c.nombre as categoria_nombre 
                     FROM recursos_turisticos r
                     JOIN categorias c ON r.categoria_id = c.id
                     WHERE r.categoria_id = :categoria_id
                     ORDER BY r.nombre";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':categoria_id', $categoriaId, PDO::PARAM_INT);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            return [];
        }
    }
    
    public function obtenerPorId($id) {
        try {
            $query = "SELECT r.*, c.nombre as categoria_nombre 
                     FROM recursos_turisticos r
                     JOIN categorias c ON r.categoria_id = c.id
                     WHERE r.id = :id";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            return null;
        }
    }
    
    public function obtenerCategorias() {
        $categoria = new Categoria();
        return $categoria->obtenerTodas();
    }
}
?>