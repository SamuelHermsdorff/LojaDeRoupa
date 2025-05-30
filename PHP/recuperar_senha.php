<?php
header('Content-Type: application/json');

// Inclua sua conexão com o banco de dados
require 'db_connect.php';

$response = ['status' => 'erro', 'mensagem' => 'Erro desconhecido'];

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método não permitido');
    }

    $email = filter_input(INPUT_POST, 'email', FILTER_VALIDATE_EMAIL);
    if (!$email) {
        throw new Exception('E-mail inválido');
    }

    // Verifique se o e-mail existe no banco de dados
    $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = ?");
    $stmt->execute([$email]);
    $usuario = $stmt->fetch();

    if (!$usuario) {
        throw new Exception('E-mail não cadastrado');
    }

    // Gere um token único
    $token = bin2hex(random_bytes(32));
    $expiracao = date('Y-m-d H:i:s', strtotime('+1 hour')); // Token válido por 1 hora

    // Salve o token no banco de dados
    $stmt = $pdo->prepare("UPDATE usuarios SET token_recuperacao = ?, token_expiracao = ? WHERE id = ?");
    $stmt->execute([$token, $expiracao, $usuario['id']]);

    // Aqui você deve implementar o envio do e-mail com o link de recuperação
    // O link deve apontar para uma página como: resetar_senha.php?token=$token
    // Esta é uma implementação básica - em produção, use uma biblioteca como PHPMailer

    $response = [
        'status' => 'sucesso',
        'mensagem' => 'Um link para redefinir sua senha foi enviado para seu e-mail'
    ];

} catch (Exception $e) {
    $response = [
        'status' => 'erro',
        'mensagem' => $e->getMessage()
    ];
}

echo json_encode($response);
?>
