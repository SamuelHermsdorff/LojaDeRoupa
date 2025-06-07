<?php
// Garante que nenhum output é enviado antes do JSON
ob_start();

session_start();
header('Content-Type: application/json; charset=utf-8');

// Configuração de erro detalhada
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', 'php_errors.log');

require 'db_connect.php';

try {
    // Verifica método HTTP
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception("Método não permitido", 405);
    }

    // Verifica autenticação
    if (!isset($_SESSION['usuario_logado'])) {
        throw new Exception("Não autenticado", 401);
    }

    // Lê os dados de entrada
    $input = file_get_contents('php://input');
    if (empty($input)) {
        throw new Exception("Nenhum dado recebido", 400);
    }

    // Decodifica o JSON
    $data = json_decode($input, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("JSON inválido: " . json_last_error_msg(), 400);
    }

    // Valida o carrinho
    if (empty($data['carrinho']) || !is_array($data['carrinho'])) {
        throw new Exception("Carrinho inválido", 400);
    }

    // Prepara os produtos
    $produtos = array();
    foreach ($data['carrinho'] as $item) {
        $produtos[] = array(
            'id' => intval($item['id'] ?? 0),
            'nome' => substr($item['nome'] ?? 'Produto sem nome', 0, 255),
            'preco' => floatval($item['preco'] ?? 0),
            'quantidade' => intval($item['quantidade'] ?? 1)
        );
    }

    // Prepara a query SQL
    $query = "INSERT INTO Pedidos (
        nome_cliente, cpf_cliente, email_cliente, telefone_cliente, 
        produtos, data_pedido, status, usuario_id
    ) VALUES (?, ?, ?, ?, ?, NOW(), 'A pagar', ?)";

    $stmt = $conn->prepare($query);
    if (!$stmt) {
        throw new Exception("Erro ao preparar consulta: " . $conn->error, 500);
    }

    $produtosJson = json_encode($produtos, JSON_UNESCAPED_UNICODE);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Erro ao codificar produtos", 500);
    }

    $stmt->bind_param(
        "sssssi",
        $_SESSION['usuario']['nome'],
        $_SESSION['usuario']['cpf'],
        $_SESSION['usuario']['email'],
        $_SESSION['usuario']['telefone'],
        $produtosJson,
        $_SESSION['usuario']['id']
    );

    if (!$stmt->execute()) {
        throw new Exception("Erro ao executar consulta: " . $stmt->error, 500);
    }

    // Limpa qualquer output potencial
    ob_end_clean();

    // Retorna sucesso
    echo json_encode([
        'status' => 'sucesso',
        'pedido_id' => $conn->insert_id,
        'mensagem' => 'Pedido criado com sucesso'
    ]);

} catch (Exception $e) {
    // Limpa buffers antes do erro
    while (ob_get_level()) ob_end_clean();
    
    http_response_code($e->getCode() ?: 500);
    echo json_encode([
        'status' => 'erro',
        'mensagem' => $e->getMessage()
    ]);
} finally {
    if (isset($conn)) $conn->close();
}
?>
