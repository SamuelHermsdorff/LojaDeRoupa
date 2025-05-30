<?php
session_start();
header('Content-Type: application/json');
require 'db_connect.php';

if (!isset($_SESSION['usuario_logado'])) {
    http_response_code(401);
    echo json_encode(["erro" => "Acesso não autorizado"]);
    exit();
}

try {
    $query = "SELECT 
                codigo_produto, 
                nome, 
                tipo, 
                genero, 
                descricao, 
                preco, 
                tamanho, 
                imagem, 
                quant_estoque 
              FROM Produtos 
              ORDER BY nome"; // Removi a condição quant_estoque > 0 para testar
    
    $stmt = $conn->prepare($query);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $produtos = [];
    while ($row = $result->fetch_assoc()) {
        // Verifica se há imagem e codifica, senão mantém vazio
        $row['imagem'] = ($row['imagem'] && strlen($row['imagem']) > 0) ? 
                         base64_encode($row['imagem']) : '';
        $produtos[] = $row;
    }
    
    // Log para debug (remova em produção)
    error_log("Produtos encontrados: " . count($produtos));
    
    echo json_encode($produtos);
    
} catch (Exception $e) {
    error_log("Erro ao buscar produtos: " . $e->getMessage());
    echo json_encode(["error" => $e->getMessage()]);
}
?>
