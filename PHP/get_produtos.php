<?php
session_start();

// Verifica se o usuário está logado
if (!isset($_SESSION['usuario_logado'])) {
    http_response_code(401); // não autorizado
    echo json_encode(["erro" => "Acesso não autorizado. Faça login primeiro."]);
    exit();
}

require 'db_connect.php';

$nome = $_GET['nome'] ?? '';
$genero = $_GET['genero'] ?? '';
$tipo = $_GET['tipo'] ?? '';

$query = "SELECT codigo_produto, nome, tipo, genero, preco, quant_estoque, imagem, fk_fornecedor 
          FROM Produtos 
          WHERE 1=1";

$params = [];

if (!empty($nome)) {
    $query .= " AND nome LIKE ?";
    $params[] = "%$nome%";
}
if (!empty($genero) && $genero !== 'Gênero') {
    $query .= " AND genero = ?";
    $params[] = $genero;
}
if (!empty($tipo) && $tipo !== 'Tipo') {
    $query .= " AND tipo = ?";
    $params[] = $tipo;
}

$stmt = $conn->prepare($query);
$stmt->execute($params);
$result = $stmt->get_result();

$produtos = [];

while ($row = $result->fetch_assoc()) {
    $row['imagem'] = base64_encode($row['imagem']); 
    $produtos[] = $row;
}

echo json_encode($produtos);
?>
