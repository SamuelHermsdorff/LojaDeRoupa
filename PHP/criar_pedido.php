<?php
session_start();
header('Content-Type: application/json');
require 'db_connect.php'; 

// Verifique se o usuário está logado
if (!isset($_SESSION['usuario_logado'])) {
    echo json_encode(['erro' => 'Usuário não logado.']);
    exit();
}

// Obtendo os dados do carrinho
$carrinho = json_decode($_POST['carrinho'], true); // Recebe o carrinho como JSON

$nome_cliente = $_SESSION['usuario']['nome'];
$cpf_cliente = $_SESSION['usuario']['cpf'];
$email_cliente = $_SESSION['usuario']['email'];
$telefone_cliente = $_SESSION['usuario']['telefone'];
$usuario_id = $_SESSION['usuario']['id']; // ID do usuário logado


// Preparando os dados para salvar no banco
$produtos = json_encode($carrinho); // Salva os produtos como um JSON
$data_pedido = date('Y-m-d H:i:s'); // Data e hora atual

// Insere o pedido no banco
$query = "INSERT INTO Pedidos (nome_cliente, cpf_cliente, email_cliente, telefone_cliente, produtos, data_pedido, usuario_id)
          VALUES ('$nome_cliente', '$cpf_cliente', '$email_cliente', '$telefone_cliente', '$produtos', '$data_pedido', '$usuario_id')";

if (mysqli_query($conn, $query)) {
    echo json_encode(["status" => "sucesso", "mensagem" => "Pedido Realizado com sucesso!"]);
} else {
    echo json_encode(["status" => "erro", "mensagem" => "Falha ao realizar pedido."]);
}
?>