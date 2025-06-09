<?php
session_start();
header('Content-Type: application/json');
require 'db_connect.php';

if (!isset($_SESSION['usuario_logado'])) {
    http_response_code(401); // Unauthorized
    echo json_encode(["status" => "error", "message" => "Acesso não autorizado"]);
    exit();
}

// Verifique se há saída acidental antes da tag PHP de abertura
if (headers_sent()) {
    die(json_encode(["status" => "error", "message" => "Headers already sent"]));
}

try {
    $json = file_get_contents('php://input');
    if ($json === false) {
        throw new Exception("Erro ao ler dados do pedido");
    }
    
    $data = json_decode($json, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Dados JSON inválidos");
    }

    // Validação dos campos obrigatórios
    $requiredFields = ['nome_cliente', 'cpf_cliente', 'telefone_cliente', 'produtos', 'valor_total'];
    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || (is_array($data[$field]) && empty($data[$field]))) {
            throw new Exception("O campo $field é obrigatório");
        }
    }

    // Validação do CPF
    if (!validarCPF($data['cpf_cliente'])) {
        throw new Exception("CPF inválido");
    }

    // Preparar dados
    $nome_cliente = ucwords(strtolower(trim($data['nome_cliente']))); // Formata nome
    $cpf_cliente = preg_replace('/\D/', '', $data['cpf_cliente']); // Remove formatação do CPF
    $telefone_cliente = preg_replace('/\D/', '', $data['telefone_cliente']); // Remove formatação do telefone
    $email_cliente = filter_var($data['email_cliente'] ?? '', FILTER_SANITIZE_EMAIL);
    $produtos_json = json_encode($data['produtos'], JSON_UNESCAPED_UNICODE); // Armazena produtos como JSON
    $valor_total = floatval($data['valor_total']);
    $forma_pagamento = $data['forma_pagamento'] ?? 'Não especificado'; // Pega do front ou define padrão
    $usuario_id = $_SESSION['usuario_logado']['id'];

    // Iniciar transação para garantir atomicidade
    $conn->begin_transaction();

    // Query SQL para inserir o pedido
    $query = "INSERT INTO Pedidos (
        nome_cliente, 
        cpf_cliente, 
        email_cliente,
        telefone_cliente, 
        produtos, 
        data_pedido,
        status,
        usuario_id,
        forma_pagamento,
        valor_total
    ) VALUES (?, ?, ?, ?, ?, NOW(), 'Pago', ?, ?, ?)";

    $stmt = $conn->prepare($query);
    if (!$stmt) {
        throw new Exception("Erro ao preparar a query: " . $conn->error);
    }

    $stmt->bind_param(
        "sssssisd", // ssss: nome, cpf, email, telefone (strings); s: produtos (string); i: usuario_id (int); s: forma_pagamento (string); d: valor_total (double)
        $nome_cliente,
        $cpf_cliente,
        $email_cliente,
        $telefone_cliente,
        $produtos_json,
        $usuario_id,
        $forma_pagamento,
        $valor_total
    );

    if (!$stmt->execute()) {
        throw new Exception("Erro ao executar a query de inserção do pedido: " . $stmt->error);
    }
    $stmt->close();

    // Atualizar estoque para CADA PRODUTO COM SUA QUANTIDADE
    foreach ($data['produtos'] as $produto) {
        if (!isset($produto['codigo_produto']) || !isset($produto['quantidade']) || !is_numeric($produto['quantidade'])) {
            error_log("Produto inválido ou sem quantidade no payload: " . json_encode($produto));
            continue; // Pula este produto se os dados estiverem incompletos
        }
        
        $codigo_produto = (int)$produto['codigo_produto'];
        $quantidade_vendida = (int)$produto['quantidade'];

        if ($quantidade_vendida < 1) {
             error_log("Quantidade vendida inválida para o produto " . $codigo_produto . ": " . $quantidade_vendida);
             continue;
        }

        // Verifica o estoque atual antes de atualizar
        $checkStockStmt = $conn->prepare("SELECT quant_estoque FROM Produtos WHERE codigo_produto = ?");
        $checkStockStmt->bind_param("i", $codigo_produto);
        $checkStockStmt->execute();
        $result = $checkStockStmt->get_result();
        $currentStockRow = $result->fetch_assoc();
        $checkStockStmt->close();

        if (!$currentStockRow || $currentStockRow['quant_estoque'] < $quantidade_vendida) {
            // Se o estoque for insuficiente ou o produto não existir, reverte a transação
            $conn->rollback();
            throw new Exception("Estoque insuficiente para o produto " . $produto['nome'] . " (Código: " . $codigo_produto . "). Quantidade disponível: " . ($currentStockRow['quant_estoque'] ?? 0) . ". Tentou vender: " . $quantidade_vendida . ".");
        }

        $updateStmt = $conn->prepare(
            "UPDATE Produtos SET quant_estoque = quant_estoque - ? WHERE codigo_produto = ?"
        );
        if (!$updateStmt) {
            throw new Exception("Erro ao preparar a query de atualização de estoque: " . $conn->error);
        }
        $updateStmt->bind_param("ii", $quantidade_vendida, $codigo_produto); // 'ii' para dois inteiros
        
        if (!$updateStmt->execute()) {
             // Se houver um erro de execução na atualização do estoque, reverte a transação
            $conn->rollback();
            throw new Exception("Erro ao atualizar estoque para o produto " . $produto['nome'] . " (Código: " . $codigo_produto . "): " . $updateStmt->error);
        }
        $updateStmt->close();
    }
    
    // Commit da transação se tudo deu certo
    $conn->commit();
    
    // Limpe o buffer de saída antes de enviar JSON
    if (ob_get_level() > 0) {
        ob_clean();
    }
    
    echo json_encode(["status" => "success", "message" => "Pedido registrado com sucesso"]);
    exit;

} catch (Exception $e) {
    // Rollback da transação em caso de erro
    if (isset($conn) && $conn->in_transaction) {
        $conn->rollback();
    }

    // Limpe o buffer de saída antes de enviar JSON de erro
    if (ob_get_level() > 0) {
        ob_clean();
    }
    
    error_log("Erro no registro do pedido: " . $e->getMessage());
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    exit;
}    

function validarCPF($cpf) {
    $cpf = preg_replace('/\D/', '', $cpf);
    
    // Validação completa do CPF (incluindo dígitos verificadores)
    if (strlen($cpf) != 11 || preg_match('/(\d)\1{10}/', $cpf)) {
        return false;
    }
    
    // Cálculo dos dígitos verificadores
    for ($t = 9; $t < 11; $t++) {
        for ($d = 0, $c = 0; $c < $t; $c++) {
            $d += $cpf[$c] * (($t + 1) - $c);
        }
        $d = ((10 * $d) % 11) % 10;
        if ($cpf[$c] != $d) {
            return false;
        }
    }
    return true;
}
?>
