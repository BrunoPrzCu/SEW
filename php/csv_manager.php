<?php
/**
 * Gestor de importación y exportación CSV
 * Permite importar datos desde archivos CSV a la base de datos
 * y exportar datos de la base de datos a archivos CSV
 */
class CSVManager {
    private $conn;
    
    /**
     * Constructor
     */
    public function __construct() {
        $this->conn = DB::getInstance()->getConnection();
    }
    
    /**
     * Importa datos de un archivo CSV a una tabla de la base de datos
     * 
     * @param string $tableName Nombre de la tabla
     * @param string $csvFile Ruta del archivo CSV temporal
     * @param array $columnMapping Mapeo de columnas CSV a columnas de la tabla
     * @return array Resultado de la importación
     */
    public function importarDesdeCSV($tableName, $csvFile, $columnMapping = []) {
        $resultado = [
            'exito' => false,
            'registrosImportados' => 0,
            'errores' => [],
        ];
        
        if (!file_exists($csvFile)) {
            $resultado['errores'][] = "El archivo no existe.";
            return $resultado;
        }
        
        try {
            $handle = fopen($csvFile, "r");
            if ($handle === false) {
                $resultado['errores'][] = "No se pudo abrir el archivo.";
                return $resultado;
            }
            
            // Leer la primera línea como cabeceras
            $cabeceras = fgetcsv($handle, 1000, ",");
            if ($cabeceras === false) {
                $resultado['errores'][] = "No se pudo leer la cabecera del archivo CSV.";
                fclose($handle);
                return $resultado;
            }
            
            // Si no hay mapeo definido, usar las cabeceras como nombres de columnas
            if (empty($columnMapping)) {
                $columnMapping = array_combine($cabeceras, $cabeceras);
            }
            
            // Comenzar transacción
            $this->conn->beginTransaction();
            
            $insertados = 0;
            $lineaNum = 1;
            
            // Leer cada línea del archivo CSV
            while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
                $lineaNum++;
                
                // Verificar que la línea tenga el número correcto de campos
                if (count($data) !== count($cabeceras)) {
                    $resultado['errores'][] = "La línea $lineaNum tiene un número incorrecto de campos.";
                    continue;
                }
                
                // Combinar cabeceras con datos
                $fila = array_combine($cabeceras, $data);
                
                // Verificar si hay una columna 'tabla' en el CSV para importaciones multi-tabla
                if (isset($fila['tabla']) && $tableName === '') {
                    $tablaActual = $fila['tabla'];
                } else {
                    $tablaActual = $tableName;
                }
                
                // Preparar columnas y valores para la inserción
                $columnas = [];
                $valores = [];
                $placeholders = [];
                
                // Mapear columnas según la configuración
                foreach ($columnMapping as $csvColumn => $dbColumn) {
                    if (isset($fila[$csvColumn]) && $fila[$csvColumn] !== '' && $dbColumn !== 'tabla') {
                        $columnas[] = $dbColumn;
                        $valores[] = $fila[$csvColumn];
                        $placeholders[] = '?';
                    }
                }
                
                // Construir y ejecutar la consulta SQL
                if (!empty($columnas)) {
                    $sql = "INSERT INTO " . $tablaActual . " (" . implode(', ', $columnas) . ") VALUES (" . implode(', ', $placeholders) . ")";
                    $stmt = $this->conn->prepare($sql);
                    
                    if ($stmt->execute($valores)) {
                        $insertados++;
                    } else {
                        $resultado['errores'][] = "Error al insertar la fila $lineaNum: " . implode(' ', $stmt->errorInfo());
                    }
                }
            }
            
            fclose($handle);
            
            // Si todo fue bien, confirmar la transacción
            if (empty($resultado['errores'])) {
                $this->conn->commit();
                $resultado['exito'] = true;
                $resultado['registrosImportados'] = $insertados;
            } else {
                $this->conn->rollBack();
            }
            
        } catch (Exception $e) {
            if ($this->conn->inTransaction()) {
                $this->conn->rollBack();
            }
            $resultado['errores'][] = "Error: " . $e->getMessage();
        }
        
        return $resultado;
    }
    
    /**
     * Exporta datos de una tabla para descarga directa
     * 
     * @param string $tableName Nombre de la tabla
     * @param string $whereClause Cláusula WHERE opcional para filtrar datos
     * @return array Resultado de la operación para ser manejado por el controlador
     */
    public function prepararExportacionCSV($tableName, $whereClause = '') {
        $resultado = [
            'exito' => false,
            'datos' => [],
            'errores' => [],
            'nombreArchivo' => $tableName . '_' . date('YmdHis') . '.csv'
        ];
        
        try {
            // Preparar la consulta SQL
            $sql = "SELECT * FROM $tableName";
            if (!empty($whereClause)) {
                $sql .= " WHERE $whereClause";
            }
            
            $stmt = $this->conn->prepare($sql);
            $stmt->execute();
            
            // Obtener todos los resultados
            $resultado['datos'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            if (!empty($resultado['datos'])) {
                $resultado['exito'] = true;
            } else {
                $resultado['errores'][] = "No hay datos para exportar en la tabla $tableName.";
            }
            
        } catch (Exception $e) {
            $resultado['errores'][] = "Error: " . $e->getMessage();
        }
        
        return $resultado;
    }
}
?>