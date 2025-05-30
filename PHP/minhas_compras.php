<?php
session_start();

// Verifica se o usuário está logado
if (!isset($_SESSION['usuario_logado'])) {
    http_response_code(401);
    echo json_encode(["erro" => "Não autorizado"]);
    exit();
}

require 'db_connect.php';

// Pega o ID do usuário da sessão
$id = $_SESSION['usuario']['id']; // OU $_SESSION['usuario_logado']['codigo_pessoa'] dependendo de como salvou

// Busca os pedidos do usuário
$sql = "SELECT id, produtos, data_pedido, status FROM Pedidos WHERE usuario_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();

$pedidos = [];
while ($row = $result->fetch_assoc()) {
    $pedidos[] = $row;
}

// Retorna os pedidos em JSON
header('Content-Type: application/json');
echo json_encode($pedidos);

// Fecha conexões
$stmt->close();
$conn->close();
?>
