<?php
session_start();
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

include 'db_connect.php';

if (!isset($_SESSION['usuario_logado'])) {
    echo json_encode(["status" => "erro", "mensagem" => "Usuário não autenticado."]);
    exit();
}

$id = $_SESSION['usuario_logado'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $query = "SELECT id, nome, cpf, telefone, email, funcionario, administrador FROM Usuarios WHERE id = ?";

    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $usuario = $result->fetch_assoc();

        echo json_encode([
            "status" => "sucesso",
            "usuario" => [
                "id" => $usuario['id'],
                "nome" => $usuario['nome'],
                "cpf" => $usuario['cpf'],
                "telefone" => $usuario['telefone'],
                "email" => $usuario['email'],
                "funcionario" => $usuario['funcionario'],
                "administrador" => $usuario['administrador']
            ]
        ]);
    } else {
        echo json_encode(["status" => "erro", "mensagem" => "Usuário não encontrado."]);
    }

    $stmt->close();
    $conn->close();
}
?>
