<?php
session_start();
require 'db_connect.php';

header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = $_POST['email'] ?? '';
    $senha = $_POST['senha'] ?? '';

    if (empty($email) || empty($senha)) {
        echo json_encode(["status" => "erro", "mensagem" => "Preencha todos os campos."]);
        exit();
    }

    $query = "SELECT * FROM Usuarios WHERE email = ?";

    $stmt = $conn->prepare($query);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $resultado = $stmt->get_result();

    if ($resultado->num_rows === 1) {
        $usuario = $resultado->fetch_assoc();

        if (password_verify($senha, $usuario['senha'])) {
            $_SESSION['usuario_logado'] = $usuario['id'];

            $_SESSION["usuario"] = [
                "id" => $usuario["id"],
                "nome" => $usuario["nome"],
                "email" => $usuario["email"],
                "cpf" => $usuario["cpf"],
                "telefone" => $usuario["telefone"],
                "funcionario" => $usuario["funcionario"],
                "administrador" => $usuario["administrador"]
            ];

            echo json_encode(["status" => "sucesso"]);
            exit();
        } else {
            echo json_encode(["status" => "erro", "mensagem" => "Senha incorreta."]);
            exit();
        }
    } else {
        echo json_encode(["status" => "erro", "mensagem" => "Usuário não encontrado."]);
        exit();
    }
}
?>
