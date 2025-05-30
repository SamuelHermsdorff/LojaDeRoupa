<?php
session_start();
header('Content-Type: application/json');

include "db_connect.php";

// Verifique se o usuário está logado
if (!isset($_SESSION['usuario_logado'])) {
    echo json_encode(['status' => 'erro', 'mensagem' => 'Usuário não logado.']);
    exit();
}

// Obter dados do POST
$data = json_decode(file_get_contents("php://input"), true);
if (!$data) {
    echo json_encode(['status' => 'erro', 'mensagem' => 'Erro ao decodificar os dados JSON.']);
    exit();
}

$nome = $data['nome'] ?? '';
$telefone = $data['telefone'] ?? '';
$usuario_id = $_SESSION["usuario"]["id"];

// Verifique se os dados são válidos
if (empty($nome) || empty($telefone)) {
    echo json_encode(['status' => 'erro', 'mensagem' => 'Nome e telefone são obrigatórios.']);
    exit();
}

if (!preg_match('/^\(\d{2}\)\s?\d{4,5}-\d{4}$/', $telefone)) {
    echo json_encode(["status" => "erro", "mensagem" => "Telefone inválido. O telefone deve ter o formato (XX) XXXXX-XXXX."]);
    exit();
}

// Atualizar os dados na tabela Usuarios
$sql = "UPDATE Usuarios SET nome = ?, telefone = ? WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ssi", $nome, $telefone, $usuario_id);

if ($stmt->execute()) {
    // Atualizar a sessão também, já que o nome/telefone mudaram
    $_SESSION["usuario"]["nome"] = $nome;
    $_SESSION["usuario"]["telefone"] = $telefone;

    echo json_encode(['status' => 'sucesso', 'mensagem' => 'Informações atualizadas com sucesso!']);
} else {
    echo json_encode(['status' => 'erro', 'mensagem' => 'Erro ao atualizar as informações: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
