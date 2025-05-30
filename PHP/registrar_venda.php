<?php
session_start();
header('Content-Type: application/json');
require 'db_connect.php';

if (!isset($_SESSION['usuario_logado'])) {
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
    $requiredFields = ['nome_cliente', 'cpf_cliente', 'telefone_cliente', 'produtos'];
    foreach ($requiredFields as $field) {
        if (empty($data[$field])) {
            throw new Exception("O campo $field é obrigatório");
        }
    }

    // Validação do CPF
    if (!validarCPF($data['cpf_cliente'])) {
        throw new Exception("CPF inválido");
    }

    // Formatar CPF (remove formatação existente e aplica padrão)
    $cpf_cliente = $data['cpf_cliente'];

    // Formatar telefone
    $telefone_cliente = $data['telefone_cliente'];

    // Preparar dados
    $nome_cliente = ucwords(strtolower(trim($data['nome_cliente']))); // Formata nome
    $email_cliente = filter_var($data['email_cliente'] ?? '', FILTER_SANITIZE_EMAIL);
    $produtos = json_encode($data['produtos']);
    $usuario_id = $_SESSION['usuario_logado']['id'];

    // Query SQL
    $query = "INSERT INTO Pedidos (
        nome_cliente, 
        cpf_cliente, 
        email_cliente,
        telefone_cliente, 
        produtos, 
        data_pedido,
        status,
        usuario_id
    ) VALUES (?, ?, ?, ?, ?, NOW(), DEFAULT, ?)";

    $stmt = $conn->prepare($query);
    if (!$stmt) {
        throw new Exception("Erro ao preparar a query: " . $conn->error);
    }

    $stmt->bind_param(
        "sssssi",
        $nome_cliente,
        $cpf_cliente,
        $email_cliente,
        $telefone_cliente,
        $produtos,
        $usuario_id
    );

    if ($stmt->execute()) {
        // Limpe o buffer de saída antes de enviar JSON
        if (ob_get_level() > 0) {
            ob_clean();
        }
        
        echo json_encode(["status" => "success", "message" => "Pedido registrado com sucesso"]);
        exit; // Encerre a execução imediatamente após o JSON
    } else {
        throw new Exception("Erro ao executar a query: " . $stmt->error);
    }

    // Atualizar estoque (com verificação segura)
    foreach ($data['produtos'] as $produto) {
        if (!isset($produto['codigo_produto'])) {
            continue;
        }
        
        $updateStmt = $conn->prepare(
            "UPDATE Produtos SET quant_estoque = quant_estoque - 1 WHERE codigo_produto = ?"
        );
        $updateStmt->bind_param("i", $produto['codigo_produto']);
        $updateStmt->execute();
        $updateStmt->close();
    }
    
    echo json_encode(["status" => "success", "message" => "Pedido registrado com sucesso"]);
} catch (Exception $e) {
    // Limpe o buffer de saída antes de enviar JSON de erro
    if (ob_get_level() > 0) {
        ob_clean();
    }
    
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
