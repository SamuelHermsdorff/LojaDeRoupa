<?php
header('Content-Type: application/json');
ini_set('display_errors', 0);

include 'db_connect.php';

function responder($status, $mensagem, $dados = []) {
    echo json_encode([
        'status' => $status,
        'mensagem' => $mensagem,
        'dados' => $dados
    ]);
    exit();
}

function validarCPF($cpf) {
    $cpf = preg_replace('/\D/', '', $cpf);
    
    // Validação completa do CPF (incluindo dígitos verificadores)
    if (strlen($cpf) != 11 || preg_match('/(\d)\1{10}/', $cpf)) {
        return false;
    }
    
    // Cálculo dos dígitos verificadores
    for ($t = 9; $t < 11; $t++) {
        for ($d = 0, $c = 0; $c < $t; $c++) {
            $d += $cpf[$c] * (($t + 1) - $c);
        }
        $d = ((10 * $d) % 11) % 10;
        if ($cpf[$c] != $d) {
            return false;
        }
    }
    return true;
}

try {
    // Verifica método HTTP
    if ($_SERVER['REQUEST_METHOD'] != 'POST') {
        responder('erro', 'Método não permitido');
    }

    // Recebe e sanitiza dados
    $dados = [
        'nome' => trim($_POST['nome'] ?? ''),
        'cpf' => trim($_POST['cpf'] ?? ''),//preg_replace('/\D/', '', $_POST['cpf'] ?? ''),
        'telefone' => trim($_POST['telefone'] ?? ''),
        'email' => filter_var(trim($_POST['email'] ?? ''), FILTER_SANITIZE_EMAIL),
        'senha' => $_POST['senha'] ?? ''
    ];

    // Validações
    if (empty($dados['nome'])) responder('erro', 'Nome é obrigatório');
    if (empty($dados['cpf'])) responder('erro', 'CPF é obrigatório');
    if (!validarCPF($dados['cpf'])) responder('erro', 'CPF inválido');
    if (empty($dados['telefone'])) responder('erro', 'Telefone é obrigatório');
    if (empty($dados['email'])) responder('erro', 'E-mail é obrigatório');
    if (!filter_var($dados['email'], FILTER_VALIDATE_EMAIL)) responder('erro', 'E-mail inválido');
    if (empty($dados['senha'])) responder('erro', 'Senha é obrigatória');
    if (strlen($dados['senha']) < 6) responder('erro', 'Senha deve ter no mínimo 6 caracteres');

    // Verifica se CPF/Email já existem
    $stmt = $conn->prepare("SELECT cpf, email FROM Usuarios WHERE cpf = ? OR email = ?");
    $stmt->bind_param("ss", $dados['cpf'], $dados['email']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        if ($row['cpf'] === $dados['cpf']) responder('erro', 'CPF já cadastrado');
        if ($row['email'] === $dados['email']) responder('erro', 'E-mail já cadastrado');
    }

    // Cadastra usuário
    $hash_senha = password_hash($dados['senha'], PASSWORD_DEFAULT);
    $stmt = $conn->prepare("INSERT INTO Usuarios (nome, cpf, telefone, email, senha, funcionario, administrador) VALUES (?, ?, ?, ?, ?, 0, 0)");
    
    if (!$stmt->bind_param("sssss", $dados['nome'], $dados['cpf'], $dados['telefone'], $dados['email'], $hash_senha)) {
        responder('erro', 'Erro no cadastro');
    }

    if ($stmt->execute()) {
        responder('sucesso', 'Cadastro realizado com sucesso!', [
            'nome' => $dados['nome'],
            'email' => $dados['email']
        ]);
    } else {
        responder('erro', 'Erro ao cadastrar no banco de dados');
    }

} catch (Exception $e) {
    //responder('erro', 'Erro no servidor: ' . $e->getMessage());
}
?>

