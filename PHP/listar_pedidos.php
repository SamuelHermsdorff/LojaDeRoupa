<?php
session_start();
header('Content-Type: application/json');

// Inclui o arquivo de conexão com o banco de dados
require 'db_connect.php';

// Verifica se o usuário está logado e tem permissão (funcionário ou administrador)
if (!isset($_SESSION['usuario_logado']) || (!$_SESSION['usuario']['funcionario'] && !$_SESSION['usuario']['administrador'])) {
    http_response_code(401); // Não autorizado
    echo json_encode(["erro" => "Acesso não autorizado. Permissão insuficiente."]);
    exit();
}

try {
    // Busca todos os pedidos, incluindo informações do cliente e dados de pagamento
    // A chave usuario_id na tabela Pedidos faz referência ao id na tabela Usuarios
    $sql = "SELECT 
                p.id, 
                p.nome_cliente, 
                p.cpf_cliente, 
                p.email_cliente, 
                p.telefone_cliente, 
                p.produtos, 
                p.data_pedido, 
                p.status,
                p.forma_pagamento, 
                p.valor_total
            FROM 
                Pedidos p
            ORDER BY 
                p.data_pedido DESC"; // Ordena do mais recente para o mais antigo
    
    $stmt = $conn->prepare($sql);
    
    if (!$stmt) {
        throw new Exception("Erro ao preparar a consulta SQL: " . $conn->error);
    }

    $stmt->execute();
    $result = $stmt->get_result();

    $pedidos = [];
    while ($row = $result->fetch_assoc()) {
        // Converte a string JSON de produtos de volta para um array/objeto PHP
        // Se a coluna 'produtos' estiver vazia ou não for JSON válido, usará um array vazio
        $row['produtos'] = json_decode($row['produtos'], true) ?? [];
        
        // Garante que 'forma_pagamento' e 'valor_total' tenham valores padrão se forem nulos no banco
        $row['forma_pagamento'] = $row['forma_pagamento'] ?? 'Não especificado';
        $row['valor_total'] = floatval($row['valor_total'] ?? 0); // Garante que seja um float

        $pedidos[] = $row;
    }

    echo json_encode($pedidos);

} catch (Exception $e) {
    error_log("Erro ao listar pedidos no controle: " . $e->getMessage());
    http_response_code(500); // Erro interno do servidor
    echo json_encode(["erro" => "Erro ao carregar pedidos: " . $e->getMessage()]);
} finally {
    if (isset($conn)) {
        $conn->close();
    }
}
?>
