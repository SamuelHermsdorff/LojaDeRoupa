<?php
session_start();
if (!isset($_SESSION['usuario_logado'])) {
    header('Content-Type: application/json');
    echo json_encode(['erro' => 'Usuário não logado.']);
    exit();
}

require "db_connect.php";

$action = $_REQUEST['action'] ?? '';

switch ($action) {
    case 'listar':
        listarUsuarios($conn);
        break;
    case 'buscar':
        buscarUsuario($conn);
        break;
    case 'cadastrar':
        cadastrarUsuario($conn);
        break;
    case 'editar':
        editarUsuario($conn);
        break;
    case 'deletar':
        deletarUsuario($conn);
        break;
    case 'verificar_email':
        verificarEmail($conn);
        break;
    default:
        echo json_encode(['erro' => 'Ação inválida.']);
}

function verificarEmail($conn) {
    header('Content-Type: application/json');
    
    try {
        if (!isset($_GET['email'])) {
            throw new Exception('Email não fornecido');
        }
        
        $email = filter_var($_GET['email'], FILTER_VALIDATE_EMAIL);
        if (!$email) {
            throw new Exception('Email inválido');
        }
        
        $id = isset($_GET['id']) ? intval($_GET['id']) : null;
        
        $sql = "SELECT id FROM Usuarios WHERE email = ?";
        $params = [$email];
        
        if ($id) {
            $sql .= " AND id != ?";
            $params[] = $id;
        }
        
        $stmt = $conn->prepare($sql);
        $types = str_repeat('s', count($params));
        $stmt->bind_param($types, ...$params);
        $stmt->execute();
        
        echo json_encode([
            'status' => 'sucesso',
            'existe' => $stmt->get_result()->num_rows > 0
        ]);
        
    } catch (Exception $e) {
        echo json_encode([
            'status' => 'erro',
            'mensagem' => $e->getMessage()
        ]);
    }
    exit();
    return;
}

function listarUsuarios($conn) {
    $search = $conn->real_escape_string($_GET['search'] ?? '');
    
    $sql = "SELECT id, nome, cpf, telefone, email, funcionario, administrador FROM Usuarios";
    
    if (!empty($search)) {
        $sql .= " WHERE nome LIKE '%$search%' OR 
                 cpf LIKE '%$search%' OR 
                 telefone LIKE '%$search%' OR 
                 email LIKE '%$search%'";
    }
    
    $sql .= " ORDER BY nome ASC";
    
    $result = $conn->query($sql);
    
    $usuarios = [];
    while ($row = $result->fetch_assoc()) {
        $usuarios[] = $row;
    }
    
    echo json_encode($usuarios);
}

function buscarUsuario($conn) {
    $id = $conn->real_escape_string($_GET['id']);
    
    $stmt = $conn->prepare("SELECT id, nome, cpf, telefone, email, funcionario FROM Usuarios WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($usuario = $result->fetch_assoc()) {
        echo json_encode($usuario);
    } else {
        echo json_encode(['erro' => 'Usuário não encontrado.']);
    }
}
function cadastrarUsuario($conn) {
    $action = $_POST['action'] ?? '';
    //$funcionario = isset($_POST['funcionario']) && $_POST['funcionario'] === '1' ? 1 : 0;
    $funcionario = 0;
    
    if ($action === 'editar') {
        $id = intval($_POST['id']);
        $nome = $conn->real_escape_string($_POST['nome']);
        $cpf = $conn->real_escape_string($_POST['cpf']);
        $telefone = $conn->real_escape_string($_POST['telefone']);
        $email = $conn->real_escape_string($_POST['email']);
        
        // Query de atualização
        $sql = "UPDATE Usuarios SET nome=?, cpf=?, telefone=?, email=?, funcionario=?";
        $params = [$nome, $cpf, $telefone, $email, $funcionario];
        $types = "ssssi";
        
        // Adiciona senha se foi fornecida
        if (!empty($_POST['senha'])) {
            $senha = password_hash($_POST['senha'], PASSWORD_DEFAULT);
            $sql .= ", senha=?";
            $params[] = $senha;
            $types .= "s";
        }
        
        $sql .= " WHERE id=?";
        $params[] = $id;
        $types .= "i";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param($types, ...$params);
        
    } else { // Cadastro
        $nome = $conn->real_escape_string($_POST['nome']);
        $cpf = $conn->real_escape_string($_POST['cpf']);
        $telefone = $conn->real_escape_string($_POST['telefone']);
        $email = $conn->real_escape_string($_POST['email']);
        $senha = password_hash($_POST['senha'], PASSWORD_DEFAULT);
        
        // TODO: dont pass the funcionario
        //$stmt = $conn->prepare("INSERT INTO Usuarios (nome, cpf, telefone, email, senha, funcionario) VALUES (?, ?, ?, ?, ?, ?)");
        //$stmt->bind_param("sssssi", $nome, $cpf, $telefone, $email, $senha, $funcionario);
        $stmt = $conn->prepare("INSERT INTO Usuarios (nome, cpf, telefone, email, senha, funcionario) VALUES (?, ?, ?, ?, ?, 0)");
        $stmt->bind_param("sssss", $nome, $cpf, $telefone, $email, $senha);
    }
    
    if ($stmt->execute()) {
        echo json_encode(['status' => 'sucesso', 'mensagem' => 'Usuário salvo com sucesso!']);
    } else {
        echo json_encode(['status' => 'erro', 'mensagem' => 'Erro ao salvar usuário: ' . $conn->error]);
    }
}

function editarUsuario($conn) {
    header('Content-Type: application/json');
    
    try {
        // Verificar se o usuário logado é funcionario
        if (!$_SESSION['usuario']['funcionario'] && !$_SESSION['usuario']['administrador']) {
            throw new Exception('Apenas funcionarios podem editar usuários.');
        }

        // Validação do ID
        if (!isset($_POST['id']) || !is_numeric($_POST['id'])) {
            throw new Exception('ID do usuário inválido.');
        }
        $id = intval($_POST['id']);

        // Sanitização dos dados
        $dados = [
            'nome' => $conn->real_escape_string($_POST['nome'] ?? ''),
            'cpf' => $conn->real_escape_string($_POST['cpf'] ?? ''),
            'telefone' => $conn->real_escape_string($_POST['telefone'] ?? ''),
            'email' => filter_var($_POST['email'] ?? '', FILTER_SANITIZE_EMAIL),
            //'funcionario' => isset($_POST['funcionario']) && $_POST['funcionario'] === '1' ? 1 : 0
        ];

        // Validações básicas
        if (empty($dados['nome']) || empty($dados['cpf']) || empty($dados['email'])) {
            throw new Exception('Todos os campos obrigatórios devem ser preenchidos.');
        }

        if (!filter_var($dados['email'], FILTER_VALIDATE_EMAIL)) {
            throw new Exception('Email inválido.');
        }

        // Verificar se email foi alterado
        $stmt_current = $conn->prepare("SELECT email FROM Usuarios WHERE id = ?");
        $stmt_current->bind_param("i", $id);
        $stmt_current->execute();
        $current = $stmt_current->get_result();

        if ($current->num_rows > 0) {
            $currentEmail = $current->fetch_assoc()['email'];
            if ($dados['email'] !== $currentEmail) {
                // Verificar se novo email já existe
                $stmt_check = $conn->prepare("SELECT id FROM Usuarios WHERE email = ? AND id != ?");
                $stmt_check->bind_param("si", $dados['email'], $id);
                $stmt_check->execute();
                
                if ($stmt_check->get_result()->num_rows > 0) {
                    throw new Exception('Email já cadastrado.');
                }
            }
        }

        $sql = "UPDATE Usuarios SET nome = ?, cpf = ?, telefone = ?, email = ?";
        $types = "ssss";
        $params = [
            $dados['nome'],
            $dados['cpf'],
            $dados['telefone'],
            $dados['email']
        ];

        // Montar a query dinamicamente
        //$sql = "UPDATE Usuarios SET nome = ?, cpf = ?, telefone = ?, email = ?, funcionario = ?";
        //$types = "ssssi";
        //$params = [
        //    $dados['nome'],
        //    $dados['cpf'],
        //    $dados['telefone'],
        //    $dados['email'],
        //    $dados['funcionario']
        //];

        // Adicionar senha se fornecida
        if (!empty($_POST['senha'])) {
            $sql .= ", senha = ?";
            $types .= "s";
            $params[] = password_hash($_POST['senha'], PASSWORD_DEFAULT);
        }

        $sql .= " WHERE id = ?";
        $types .= "i";
        $params[] = $id;

        // Executar a query
        $stmt = $conn->prepare($sql);
        $stmt->bind_param($types, ...$params);

        if ($stmt->execute()) {
            echo json_encode([
                'status' => 'sucesso',
                'mensagem' => 'Usuário atualizado com sucesso!'
            ]);
        } else {
            throw new Exception('Erro ao atualizar usuário: ' . $conn->error);
        }

    } catch (Exception $e) {
        echo json_encode([
            'status' => 'erro',
            'mensagem' => $e->getMessage()
        ]);
    }
}

function deletarUsuario($conn) {
    header('Content-Type: application/json');
    
    try {
        // Verificar se é funcionario ou admin
        if (!$_SESSION['usuario']['funcionario'] && !$_SESSION['usuario']['administrador']) {
            throw new Exception('Apenas funcionários podem deletar usuários.');
        }

        // Obter dados JSON do corpo da requisição
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);
        
        if (!$data || !isset($data['id'])) {
            throw new Exception('Dados inválidos para deletar usuário.');
        }
        
        $id = intval($data['id']);
        
        // Verificar se usuário existe
        $stmt_check = $conn->prepare("SELECT id FROM Usuarios WHERE id = ?");
        $stmt_check->bind_param("i", $id);
        $stmt_check->execute();
        
        if ($stmt_check->get_result()->num_rows === 0) {
            throw new Exception('Usuário não encontrado.');
        }
        
        // Deletar usuário
        $stmt = $conn->prepare("DELETE FROM Usuarios WHERE id = ?");
        $stmt->bind_param("i", $id);
        
        if ($stmt->execute()) {
            echo json_encode([
                'status' => 'sucesso',
                'mensagem' => 'Usuário deletado com sucesso!'
            ]);
        } else {
            throw new Exception('Erro ao deletar usuário: ' . $conn->error);
        }
    } catch (Exception $e) {
        echo json_encode([
            'status' => 'erro',
            'mensagem' => $e->getMessage()
        ]);
    }
}
?>
