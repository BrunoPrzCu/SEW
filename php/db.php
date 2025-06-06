<?php
class DB {
    private static $instance = null;
    private $conn;
    
    private function __construct() {
        try {
            // Credenciales especificadas en los requisitos
            $host = "localhost";
            $dbname = "turismo_smra";
            $username = "DBUSER2025";
            $password = "DBPWD2025";
            
            $this->conn = new PDO(
                "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
                $username,
                $password,
                [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
            );
        } catch (PDOException $e) {
            die("Error de conexión: " . $e->getMessage());
        }
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    public function getConnection() {
        return $this->conn;
    }
}
?>