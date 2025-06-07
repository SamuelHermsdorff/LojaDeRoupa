<?php
session_start();
header('Content-Type: application/json');

require "db_connect.php";

// Verificação de acesso
if (!isset($_SESSION['usuario']) || (!$_SESSION['usuario']['funcionario'] && !$_SESSION['usuario']['administrador'])) {
    echo json_encode(["status" => "erro", "mensagem" => "Acesso negado. Apenas funcionários podem acessar esta página."]);
    exit();
}

// Consulta para listar todos os pedidos
$query = "SELECT id, data_pedido, status, produtos FROM Pedidos";
$result = mysqli_query($conn, $query);

if (!$result) {
    echo json_encode(["status" => "erro", "mensagem" => "Erro ao consultar pedidos: " . mysqli_error($conn)]);
    exit();
}

$pedidos = [];
while ($row = mysqli_fetch_assoc($result)) {
    // Tratamento robusto para o campo produtos
    $produtos = [];
    
    if (!empty($row['produtos'])) {
        // Remove possíveis caracteres inválidos antes de decodificar
        $produtosData = preg_replace('/[\x00-\x1F\x80-\xFF]/', '', $row['produtos']);
        
        // Tenta decodificar o JSON
        $decoded = json_decode($produtosData, true);
        
        if (json_last_error() === JSON_ERROR_NONE) {
            $produtos = $decoded;
        } else {
            // Log do erro para debug (remova em produção)
            error_log("Erro ao decodificar produtos do pedido {$row['id']}: " . json_last_error_msg());
            error_log("Conteúdo original: " . substr($row['produtos'], 0, 100));
        }
    }
    
    // Filtra e sanitiza os produtos
    $produtosSanitizados = [];
    foreach ($produtos as $produto) {
        $produtoSanitizado = [
            'nome' => isset($produto['nome']) ? htmlspecialchars($produto['nome']) : 'Produto sem nome',
            'preco' => isset($produto['preco']) ? floatval($produto['preco']) : 0,
            // Remove a imagem da serialização se existir (ou sanitiza se necessário)
            'imagem' => isset($produto['imagem']) ? null : null
        ];
        $produtosSanitizados[] = $produtoSanitizado;
    }
    
    $row['produtos'] = $produtosSanitizados;
    $pedidos[] = $row;
}

// Retorne os pedidos como um array JSON
echo json_encode($pedidos, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
?>
