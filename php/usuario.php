<?php
class Usuario {
    private $conn;
    private $id;
    private $nombre;
    private $email;
    private $telefono;
    
    public function __construct() {
        $this->conn = DB::getInstance()->getConnection();
    }
    
    public function getId() {
        return $this->id;
    }
    
    public function getNombre() {
        return $this->nombre;
    }
    
    public function getEmail() {
        return $this->email;
    }
    
    public function registrar($nombre, $email, $password, $telefono) {
        // Validación adicional en el servidor
        if (empty($nombre) || strlen($nombre) < 3) {
            return false;
        }
        
        if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return false;
        }
        
        if (empty($password) || strlen($password) < 6) {
            return false;
        }
        
        if (empty($telefono) || !preg_match('/^[0-9]{9}$/', $telefono)) {
            return false;
        }
        
        // Verificar que el email no esté ya registrado
        if ($this->existeEmail($email)) {
            return false;
        }
        
        try {
            $passwordHash = password_hash($password, PASSWORD_DEFAULT);
            
            $query = "INSERT INTO usuarios (nombre, email, password, telefono, fecha_registro) 
                     VALUES (:nombre, :email, :password, :telefono, NOW())";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':nombre', $nombre);
            $stmt->bindParam(':email', $email);
            $stmt->bindParam(':password', $passwordHash);
            $stmt->bindParam(':telefono', $telefono);
            
            return $stmt->execute();
        } catch (PDOException $e) {
            return false;
        }
    }
    
    public function login($email, $password) {
        try {
            $query = "SELECT id, nombre, email, password FROM usuarios WHERE email = :email";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':email', $email);
            $stmt->execute();
            
            if ($stmt->rowCount() > 0) {
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if (password_verify($password, $row['password'])) {
                    $this->id = $row['id'];
                    $this->nombre = $row['nombre'];
                    $this->email = $row['email'];
                    
                    // Guardar datos en sesión
                    $_SESSION['usuario_id'] = $this->id;
                    $_SESSION['usuario_nombre'] = $this->nombre;
                    $_SESSION['usuario_email'] = $this->email;
                    
                    return true;
                }
            }
            
            return false;
        } catch (PDOException $e) {
            return false;
        }
    }
    
    public function existeEmail($email) {
        try {
            $query = "SELECT COUNT(*) FROM usuarios WHERE email = :email";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':email', $email);
            $stmt->execute();
            
            return ($stmt->fetchColumn() > 0);
        } catch (PDOException $e) {
            return false;
        }
    }
    
    public function obtenerPorId($id) {
        try {
            $query = "SELECT * FROM usuarios WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();
            
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($row) {
                $this->id = $row['id'];
                $this->nombre = $row['nombre'];
                $this->email = $row['email'];
                $this->telefono = $row['telefono'];
                return $row;
            }
            
            return null;
        } catch (PDOException $e) {
            return null;
        }
    }
}
?>