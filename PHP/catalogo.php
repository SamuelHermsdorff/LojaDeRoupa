<?php
session_start();

if (!isset($_SESSION['usuario_logado'])) {
    http_response_code(401);
    echo json_encode(["erro" => "Acesso não autorizado. Faça login primeiro."]);
    exit();
}

require 'db_connect.php';

$nome = $_GET['nome'] ?? '';
$genero = $_GET['genero'] ?? '';
$tipo = $_GET['tipo'] ?? '';

// Seleciona TODOS os campos necessários, incluindo o ID
$query = "SELECT codigo_produto, nome, tipo, genero, descricao, preco, cor, tamanho, imagem, quant_estoque 
          FROM Produtos 
          WHERE 1=1";

$params = [];
$types = '';

if (!empty($nome)) {
    $query .= " AND nome LIKE ?";
    $params[] = "%$nome%";
    $types .= 's';
}

if (!empty($genero) && $genero !== 'Gênero') {
    $query .= " AND genero = ?";
    $params[] = $genero;
    $types .= 's';
}

if (!empty($tipo) && $tipo !== 'Tipo') {
    $query .= " AND tipo = ?";
    $params[] = $tipo;
    $types .= 's';
}

$stmt = $conn->prepare($query);

if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
}

$stmt->execute();
$result = $stmt->get_result();

$produtos = [];

while ($row = $result->fetch_assoc()) {
    // Verifica se existe imagem e codifica corretamente
    $row['imagem'] = !empty($row['imagem']) ? base64_encode($row['imagem']) : null;
    
    // Garante que todos os campos esperados pelo front-end existam
    $produtoFormatado = [
        'id' => $row['codigo_produto'],
        'nome' => $row['nome'],
        'tipo' => $row['tipo'],
        'genero' => $row['genero'],
        'descricao' => $row['descricao'] ?? '',
        'preco' => (float)$row['preco'],
        'cor' => $row['cor'] ?? '',
        'tamanho' => $row['tamanho'] ?? '',
        'imagem' => $row['imagem'],
        'quant_estoque' => (int)$row['quant_estoque']
    ];
    
    $produtos[] = $produtoFormatado;
}

header('Content-Type: application/json');
echo json_encode($produtos);
?>