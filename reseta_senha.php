<?php
session_start();
require 'PHP/db_connect.php';

$token_valido = false;
$mensagem = "";
$token = $_GET['token'] ?? '';
$usuario_id = null;

if (empty($token)) {
    $mensagem = "Token não fornecido. Link inválido.";
} else {
    // 1. Verificar se o token existe e não expirou
    $agora = date('Y-m-d H:i:s');
    $stmt = $conn->prepare("SELECT id FROM Usuarios WHERE reset_token = ? AND reset_expires > ?");
    $stmt->bind_param("ss", $token, $agora);
    $stmt->execute();
    $resultado = $stmt->get_result();

    if ($resultado->num_rows === 1) {
        $token_valido = true;
        $usuario = $resultado->fetch_assoc();
        $usuario_id = $usuario['id'];
    } else {
        $mensagem = "Token inválido ou expirado. Por favor, solicite um novo link.";
    }
    $stmt->close();
}

// 2. Processar o formulário se a senha for enviada (POST)
if ($token_valido && $_SERVER["REQUEST_METHOD"] == "POST") {
    $senha = $_POST['senha'] ?? '';
    $senha_confirma = $_POST['senha_confirma'] ?? '';

    if (empty($senha) || empty($senha_confirma)) {
        $mensagem = "Por favor, preencha as duas senhas.";
    } elseif ($senha !== $senha_confirma) {
        $mensagem = "As senhas não coincidem.";
    } elseif (strlen($senha) < 6) { // Adicione sua própria regra de senha se quiser
        $mensagem = "A senha deve ter pelo menos 6 caracteres.";
    } else {
        // 3. Atualizar a senha no banco
        $nova_senha_hash = password_hash($senha, PASSWORD_DEFAULT);
        
        // Limpa o token para que não possa ser usado novamente
        $stmt_update = $conn->prepare("UPDATE Usuarios SET senha = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?");
        $stmt_update->bind_param("si", $nova_senha_hash, $usuario_id);
        
        if ($stmt_update->execute()) {
            $mensagem = "Senha alterada com sucesso! Você já pode <a href='index.html'>fazer login</a>.";
            $token_valido = false; // Esconde o formulário após o sucesso
        } else {
            $mensagem = "Erro ao atualizar a senha. Tente novamente.";
        }
        $stmt_update->close();
    }
}

$conn->close();
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Identidade - Nova Senha</title>
    <link rel="icon" type="image/x-icon" href="./Fotos/favicon.ico">
    <link rel="stylesheet" href="CSS/index_style.css">
    
    <style>
        .mensagem-reset {
            color: #dc3545; /* Vermelho erro */
            font-weight: bold;
            margin-bottom: 15px;
            font-size: 0.9rem;
        }
        .mensagem-reset.sucesso {
            color: #28a745; /* Verde sucesso */
        }
        .mensagem-reset a {
            color: red;
            font-weight: bold;
        }
    </style>
</head>
<body>

    <div class="container">
        <div class="form-box active"> <img src="Fotos/Logo.png" alt="Identidade" class="logo">
            <h2>Definir Nova Senha</h2>

            <?php if ($token_valido): ?>
                <form method="POST" action="reseta_senha.php?token=<?php echo htmlspecialchars($token); ?>">
                    
                    <?php if ($_SERVER["REQUEST_METHOD"] == "POST" && !empty($mensagem)): ?>
                        <p class="mensagem-reset"><?php echo $mensagem; ?></p>
                    <?php endif; ?>
                    
                    <input type="password" name="senha" placeholder="Nova Senha" required>
                    <input type="password" name="senha_confirma" placeholder="Confirme a Nova Senha" required>
                    <button class="btn" type="submit">Alterar Senha</button>
                </form>

            <?php else: ?>
                <p class="mensagem-reset <?php if (str_contains($mensagem, 'sucesso')) echo 'sucesso'; ?>">
                    <?php echo $mensagem; ?>
                </p>
                <?php if (!str_contains($mensagem, 'sucesso')): ?>
                    <br>
                    <p><a href="index.html" class="toggle">Voltar ao login</a></p>
                <?php endif; ?>
            <?php endif; ?>

        </div>
    </div>
    
</body>
</html>
