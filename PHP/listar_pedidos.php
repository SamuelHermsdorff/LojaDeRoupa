<?php
session_start();
header('Content-Type: application/json');

require "db_connect.php";

// Verifique se o usuário está logado e se é um funcionário
if (!$_SESSION['usuario']['funcionario'] && !$_SESSION['usuario']['administrador']) {
    echo json_encode(["status" => "erro", "mensagem" => "Acesso negado. Apenas funcionários podem acessar esta página."]);
    exit();
}

// Consulta para listar todos os pedidos
$query = "SELECT * FROM Pedidos";
$result = mysqli_query($conn, $query);

$pedidos = [];
while ($row = mysqli_fetch_assoc($result)) {
    // Decodificar o campo produtos, se necessário
    $row['produtos'] = json_decode($row['produtos'], true);  // Converte JSON em array, caso seja JSON
    $pedidos[] = $row;
}

// Retorne os pedidos como um array JSON
echo json_encode($pedidos);
?>