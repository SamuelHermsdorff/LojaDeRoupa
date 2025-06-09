<?php
// Garante que nenhum output é enviado antes do JSON
ob_start();

session_start();
header('Content-Type: application/json; charset=utf-8');

require 'db_connect.php'; // Certifique-se de que db_connect.php está configurado para retornar $conn (objeto mysqli)

try {
    // Verifica método HTTP
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception("Método não permitido", 405);
    }

    // Verifica autenticação
    if (!isset($_SESSION['usuario_logado']) || !isset($_SESSION['usuario']['id'])) {
        throw new Exception("Não autenticado ou informações de usuário incompletas", 401);
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
        throw new Exception("Carrinho vazio ou inválido", 400);
    }

    // Prepara os dados do cliente logado
    $nome_cliente = $_SESSION['usuario']['nome'];
    $cpf_cliente = $_SESSION['usuario']['cpf'];
    $email_cliente = $_SESSION['usuario']['email'];
    $telefone_cliente = $_SESSION['usuario']['telefone'];
    $usuario_id = $_SESSION['usuario']['id'];

    // Iniciar transação para garantir atomicidade
    $conn->begin_transaction();

    $produtosParaPedido = [];
    $totalPedido = 0; // Para calcular o valor total do pedido no backend

    //// Primeiro, vamos verificar o estoque para todos os produtos e construir a lista final
    //foreach ($data['carrinho'] as $item) {
    //    $codigo_produto = intval($item['id'] ?? 0);
    //    $quantidade_desejada = intval($item['quantidade'] ?? 1);

    //    if ($codigo_produto <= 0 || $quantidade_desejada < 1) {
    //        $conn->rollback();
    //        throw new Exception("Dados de produto inválidos no carrinho.", 400);
    //    }

    //    // Busca informações do produto no banco de dados para verificar estoque
    //    $stmt_check_stock = $conn->prepare("SELECT nome, preco, quant_estoque FROM Produtos WHERE codigo_produto = ?");
    //    if (!$stmt_check_stock) {
    //        $conn->rollback();
    //        throw new Exception("Erro ao preparar consulta de estoque: " . $conn->error, 500);
    //    }
    //    $stmt_check_stock->bind_param("i", $codigo_produto);
    //    $stmt_check_stock->execute();
    //    $result_stock = $stmt_check_stock->get_result();
    //    $produto_db = $result_stock->fetch_assoc();
    //    $stmt_check_stock->close();

    //    if (!$produto_db) {
    //        $conn->rollback();
    //        throw new Exception("Produto com ID " . $codigo_produto . " não encontrado.", 404);
    //    }

    //    if ($produto_db['quant_estoque'] < $quantidade_desejada) {
    //        $conn->rollback();
    //        throw new Exception("Estoque insuficiente para o produto '" . $produto_db['nome'] . "'. Disponível: " . $produto_db['quant_estoque'] . ", Solicitado: " . $quantidade_desejada, 400);
    //    }

    //    // Adiciona o produto à lista final para o pedido, com as informações do DB
    //    $produtosParaPedido[] = [
    //        'codigo_produto' => $codigo_produto,
    //        'nome' => $produto_db['nome'],
    //        'preco' => floatval($produto_db['preco']),
    //        'quantidade' => $quantidade_desejada
    //    ];
    //    $totalPedido += floatval($produto_db['preco']) * $quantidade_desejada;
    //}
    foreach ($data['carrinho'] as $item) {
        $produto_id_do_frontend = intval($item['id'] ?? 0); 
        $quantidade_desejada = intval($item['quantidade'] ?? 1);

        if ($produto_id_do_frontend <= 0 || $quantidade_desejada < 1) {
            $conn->rollback();
            throw new Exception("Dados de produto inválidos no carrinho. Verifique o ID do produto e a quantidade. Recebido: ID=" . ($item['id'] ?? 'N/A') . ", quantidade=" . ($item['quantidade'] ?? 'N/A'), 400);
        }

        // Busca informações completas do produto no banco de dados
        $stmt_check_stock = $conn->prepare("SELECT codigo_produto, nome, preco, quant_estoque, tamanho, cor, descricao FROM Produtos WHERE codigo_produto = ?"); 
        if (!$stmt_check_stock) {
            $conn->rollback();
            throw new Exception("Erro ao preparar consulta de estoque: " . $conn->error, 500);
        }
        $stmt_check_stock->bind_param("i", $produto_id_do_frontend); 
        $stmt_check_stock->execute();
        $result_stock = $stmt_check_stock->get_result();
        $produto_db = $result_stock->fetch_assoc();
        $stmt_check_stock->close();

        if (!$produto_db) {
            $conn->rollback();
            throw new Exception("Produto com ID " . $produto_id_do_frontend . " não encontrado no catálogo.", 404);
        }

        if ($produto_db['quant_estoque'] < $quantidade_desejada) {
            $conn->rollback();
            throw new Exception("Estoque insuficiente para o produto '" . $produto_db['nome'] . "'. Disponível: " . $produto_db['quant_estoque'] . ", Solicitado: " . $quantidade_desejada, 400);
        }

        // Adiciona o produto à lista final para o pedido, com as informações do DB
        $produtosParaPedido[] = [
            'codigo_produto' => $produto_db['codigo_produto'], 
            'nome' => $produto_db['nome'],
            'preco' => floatval($produto_db['preco']),
            'quantidade' => $quantidade_desejada,
            'tamanho' => $produto_db['tamanho'], // ADICIONADO
            'cor' => $produto_db['cor'],         // ADICIONADO
            'descricao' => $produto_db['descricao'] // ADICIONADO
        ];
        $totalPedido += floatval($produto_db['preco']) * $quantidade_desejada;
    }

    // Query SQL para inserir o pedido
    // Incluímos 'forma_pagamento' e 'valor_total'
    $query_pedido = "INSERT INTO Pedidos (
        nome_cliente, cpf_cliente, email_cliente, telefone_cliente, 
        produtos, data_pedido, status, usuario_id, forma_pagamento, valor_total
    ) VALUES (?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?)";

    $stmt_pedido = $conn->prepare($query_pedido);
    if (!$stmt_pedido) {
        $conn->rollback();
        throw new Exception("Erro ao preparar consulta de pedido: " . $conn->error, 500);
    }

    $forma_pagamento = "Não especificado";
    $status_pedido = "A pagar";

    $produtosJson = json_encode($produtosParaPedido, JSON_UNESCAPED_UNICODE);
    if (json_last_error() !== JSON_ERROR_NONE) {
        $conn->rollback();
        throw new Exception("Erro ao codificar produtos para JSON: " . json_last_error_msg(), 500);
    }

    $stmt_pedido->bind_param(
        "ssssssisd", // ssss: cliente data, s: produtos JSON, i: usuario_id, s: status, s: forma_pagamento, d: valor_total
        $nome_cliente,
        $cpf_cliente,
        $email_cliente,
        $telefone_cliente,
        $produtosJson,
        $status_pedido, // Adicionado o status
        $usuario_id,
        $forma_pagamento, // Adicionado a forma de pagamento
        $totalPedido // Adicionado o valor total calculado no backend
    );

    if (!$stmt_pedido->execute()) {
        $conn->rollback();
        throw new Exception("Erro ao executar consulta de pedido: " . $stmt_pedido->error, 500);
    }
    $stmt_pedido->close();

    // Agora, subtrair o estoque para cada produto
    $stmt_update_stock = $conn->prepare("UPDATE Produtos SET quant_estoque = quant_estoque - ? WHERE codigo_produto = ?");
    if (!$stmt_update_stock) {
        $conn->rollback();
        throw new Exception("Erro ao preparar consulta de atualização de estoque: " . $conn->error, 500);
    }

    foreach ($produtosParaPedido as $produto) {
        $quantidade_vendida = $produto['quantidade'];
        $codigo_produto = $produto['codigo_produto'];
        
        $stmt_update_stock->bind_param("ii", $quantidade_vendida, $codigo_produto);
        if (!$stmt_update_stock->execute()) {
            $conn->rollback();
            throw new Exception("Erro ao atualizar estoque para o produto " . $produto['nome'] . ": " . $stmt_update_stock->error, 500);
        }
    }
    $stmt_update_stock->close();

    // Commit da transação se tudo deu certo
    $conn->commit();
    
    // Limpa qualquer output potencial
    ob_end_clean();

    // Retorna sucesso
    echo json_encode([
        'status' => 'sucesso',
        'pedido_id' => $conn->insert_id,
        'mensagem' => 'Pedido criado com sucesso e estoque atualizado.'
    ]);

} catch (Exception $e) {
    // Rollback da transação em caso de erro
    if (isset($conn) && $conn->in_transaction) {
        $conn->rollback();
    }
    
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
