<?php
require '../PHP/db_connect.php';

// Verifique se o token é válido
$token = $_GET['token'] ?? '';
$mensagem = '';
$valido = false;

if ($token) {
    $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE token_recuperacao = ? AND token_expiracao > NOW()");
    $stmt->execute([$token]);
    $usuario = $stmt->fetch();
    
    if ($usuario) {
        $valido = true;
    } else {
        $mensagem = 'Token inválido ou expirado';
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $valido) {
    $novaSenha = $_POST['senha'] ?? '';
    $confirmarSenha = $_POST['confirmar_senha'] ?? '';
    
    if (strlen($novaSenha) < 6) {
        $mensagem = 'A senha deve ter pelo menos 6 caracteres';
    } elseif ($novaSenha !== $confirmarSenha) {
        $mensagem = 'As senhas não coincidem';
    } else {
        // Atualize a senha e limpe o token
        $senhaHash = password_hash($novaSenha, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("UPDATE usuarios SET senha = ?, token_recuperacao = NULL, token_expiracao = NULL WHERE id = ?");
        $stmt->execute([$senhaHash, $usuario['id']]);
        
        $mensagem = 'Senha alterada com sucesso!';
        $valido = false; // Para esconder o formulário
    }
}
?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Redefinir Senha</title>
    <link rel="icon" type="image/x-icon" href="../Fotos/favicon.ico">
    <link rel="stylesheet" href="CSS/index_style.css">
</head>
<body>
    <div class="container">
        <div class="form-box">
            <img src="Fotos/Logo.png" alt="Identidade" class="logo">
            <h2>Redefinir Senha</h2>
            
            <?php if ($mensagem): ?>
                <div class="mensagem <?= $valido ? 'erro' : 'sucesso' ?>"><?= $mensagem ?></div>
            <?php endif; ?>
            
            <?php if ($valido): ?>
                <form method="POST">
                    <input type="password" name="senha" placeholder="Nova senha" required>
                    <input type="password" name="confirmar_senha" placeholder="Confirmar nova senha" required>
                    <button type="submit" class="btn">Redefinir Senha</button>
                </form>
            <?php elseif (!$mensagem): ?>
                <p>Token inválido ou não fornecido</p>
            <?php endif; ?>
            
            <p><a href="index.php">Voltar para o login</a></p>
        </div>
    </div>
</body>
</html>
