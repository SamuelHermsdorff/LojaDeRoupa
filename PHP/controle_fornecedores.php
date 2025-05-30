<?php
header('Content-Type: application/json');
session_start();

if (!isset($_SESSION['usuario_logado'])) {
    echo json_encode(['status' => 'erro', 'mensagem' => 'Usuário não logado']);
    exit();
}

require "db_connect.php";

$action = $_REQUEST['action'] ?? '';

try {
    switch ($action) {
        case 'listar':
            listarFornecedores($conn);
            break;
        case 'buscar':
            buscarFornecedor($conn);
            break;
        case 'verificar_documento':
            verificarDocumento($conn);
            break;
        case 'cadastrar':
            cadastrarFornecedor($conn);
            break;
        case 'editar':
            editarFornecedor($conn);
            break;
        case 'deletar':
            deletarFornecedor($conn);
            break;
        default:
            throw new Exception('Ação inválida');
    }
} catch (Exception $e) {
    echo json_encode(['status' => 'erro', 'mensagem' => $e->getMessage()]);
}

function listarFornecedores($conn) {
    $search = $conn->real_escape_string($_GET['search'] ?? '');
    
    $sql = "SELECT codigo_fornecedor, nome, cnpj_cpf FROM Fornecedores";
    
    if (!empty($search)) {
        $sql .= " WHERE nome LIKE '%$search%' OR cnpj_cpf LIKE '%$search%'";
    }
    
    $sql .= " ORDER BY nome";
    
    $result = $conn->query($sql);
    
    $fornecedores = [];
    while ($row = $result->fetch_assoc()) {
        $fornecedores[] = $row;
    }
    
    echo json_encode($fornecedores);
}

function buscarFornecedor($conn) {
    $id = intval($_GET['id']);
    
    $stmt = $conn->prepare("SELECT codigo_fornecedor, nome, cnpj_cpf FROM Fornecedores WHERE codigo_fornecedor = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($fornecedor = $result->fetch_assoc()) {
        echo json_encode($fornecedor);
    } else {
        throw new Exception('Fornecedor não encontrado');
    }
}

function cadastrarFornecedor($conn) {
    header('Content-Type: application/json');
    
    try {
        // Obter e sanitizar dados
        $nome = trim($conn->real_escape_string($_POST['nome'] ?? ''));
        $cnpj_cpf_formatado = trim($conn->real_escape_string($_POST['cnpj_cpf'] ?? ''));
        $cnpj_cpf_numeros = preg_replace('/[^0-9]/', '', $cnpj_cpf_formatado);

        // Validações básicas
        if (empty($nome) || empty($cnpj_cpf_numeros)) {
            throw new Exception('Preencha todos os campos obrigatórios');
        }

        if (strlen($nome) < 3) {
            throw new Exception('O nome deve ter pelo menos 3 caracteres');
        }

        // Verificar formato do documento
        $tipo_documento = (strlen($cnpj_cpf_numeros) === 11) ? 'CPF' : 'CNPJ';
        
        if (!in_array(strlen($cnpj_cpf_numeros), [11, 14])) {
            throw new Exception('Documento inválido. CPF deve ter 11 dígitos e CNPJ 14 dígitos');
        }

        // Validar dígitos verificadores
        if ($tipo_documento === 'CPF' && !validarCPF($cnpj_cpf_formatado)) {
            throw new Exception('CPF inválido');
        }

        if ($tipo_documento === 'CNPJ' && !validarCNPJ($cnpj_cpf_formatado)) {
            throw new Exception('CNPJ inválido');
        }

        // Verificar se documento já existe
        $stmt_check = $conn->prepare("SELECT codigo_fornecedor FROM Fornecedores WHERE cnpj_cpf = ?");
        $stmt_check->bind_param("s", $cnpj_cpf_formatado);
        $stmt_check->execute();
        
        if ($stmt_check->get_result()->num_rows > 0) {
            throw new Exception("$tipo_documento já cadastrado");
        }

        // Inserir no banco de dados (com formatação)
        $stmt = $conn->prepare("INSERT INTO Fornecedores (nome, cnpj_cpf) VALUES (?, ?)");
        $stmt->bind_param("ss", $nome, $cnpj_cpf_formatado);
        
        if ($stmt->execute()) {
            echo json_encode([
                'status' => 'sucesso',
                'mensagem' => 'Fornecedor cadastrado com sucesso',
                'dados' => [
                    'id' => $stmt->insert_id,
                    'nome' => $nome,
                    'cnpj_cpf' => $cnpj_cpf_formatado
                ]
            ]);
        } else {
            throw new Exception('Erro ao cadastrar fornecedor: ' . $conn->error);
        }
    } catch (Exception $e) {
        echo json_encode([
            'status' => 'erro',
            'mensagem' => $e->getMessage()
        ]);
    }
}
function editarFornecedor($conn) {
    header('Content-Type: application/json');
    
    try {
        // Obter e sanitizar dados
        $id = intval($_POST['id'] ?? 0);
        $nome = trim($conn->real_escape_string($_POST['nome'] ?? ''));
        $cnpj_cpf_formatado = trim($conn->real_escape_string($_POST['cnpj_cpf'] ?? ''));
        $cnpj_cpf_numeros = preg_replace('/[^0-9]/', '', $cnpj_cpf_formatado);

        // Validações básicas
        if (empty($id) || empty($nome) || empty($cnpj_cpf_numeros)) {
            throw new Exception('Preencha todos os campos obrigatórios');
        }

        if (strlen($nome) < 3) {
            throw new Exception('O nome deve ter pelo menos 3 caracteres');
        }

        // Verificar formato do documento
        $tipo_documento = (strlen($cnpj_cpf_numeros) === 11) ? 'CPF' : 'CNPJ';
        
        if (!in_array(strlen($cnpj_cpf_numeros), [11, 14])) {
            throw new Exception('Documento inválido. CPF deve ter 11 dígitos e CNPJ 14 dígitos');
        }

        // Validar dígitos verificadores
        if ($tipo_documento === 'CPF' && !validarCPF($cnpj_cpf_formatado)) {
            throw new Exception('CPF inválido');
        }

        if ($tipo_documento === 'CNPJ' && !validarCNPJ($cnpj_cpf_formatado)) {
            throw new Exception('CNPJ inválido');
        }

        // Verificar se fornecedor existe
        $stmt_check = $conn->prepare("SELECT codigo_fornecedor FROM Fornecedores WHERE codigo_fornecedor = ?");
        $stmt_check->bind_param("i", $id);
        $stmt_check->execute();
        
        if ($stmt_check->get_result()->num_rows === 0) {
            throw new Exception('Fornecedor não encontrado');
        }

        // Verificar se documento já existe em outro fornecedor
        $stmt_check = $conn->prepare("SELECT codigo_fornecedor FROM Fornecedores WHERE cnpj_cpf = ? AND codigo_fornecedor != ?");
        $stmt_check->bind_param("si", $cnpj_cpf_formatado, $id);
        $stmt_check->execute();
        
        if ($stmt_check->get_result()->num_rows > 0) {
            throw new Exception("$tipo_documento já cadastrado para outro fornecedor");
        }

        // Atualizar no banco de dados (com formatação)
        $stmt = $conn->prepare("UPDATE Fornecedores SET nome = ?, cnpj_cpf = ? WHERE codigo_fornecedor = ?");
        $stmt->bind_param("ssi", $nome, $cnpj_cpf_formatado, $id);
        
        if ($stmt->execute()) {
            echo json_encode([
                'status' => 'sucesso',
                'mensagem' => 'Fornecedor atualizado com sucesso',
                'dados' => [
                    'id' => $id,
                    'nome' => $nome,
                    'cnpj_cpf' => $cnpj_cpf_formatado
                ]
            ]);
        } else {
            throw new Exception('Erro ao atualizar fornecedor: ' . $conn->error);
        }
    } catch (Exception $e) {
        echo json_encode([
            'status' => 'erro',
            'mensagem' => $e->getMessage()
        ]);
    }
}

// Funções auxiliares para validação
function validarCPF($cpf) {
    $cpf = preg_replace('/[^0-9]/', '', $cpf);
    
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

function validarCNPJ($cnpj) {
    $cnpj = preg_replace('/[^0-9]/', '', $cnpj);
    
    if (strlen($cnpj) != 14 || preg_match('/(\d)\1{13}/', $cnpj)) {
        return false;
    }

    
    // Cálculo dos dígitos verificadores
    for ($t = 12; $t < 14; $t++) {
        $d = 0;
        $c = 0;
        for ($m = $t - 7; $m >= 2; $m--, $c++) {
            $d += $cnpj[$c] * $m;
        }
        for ($m = 9; $m >= 2; $m--, $c++) {
            $d += $cnpj[$c] * $m;
        }
        $d = ((10 * $d) % 11) % 10;
        if ($cnpj[$c] != $d) {
            return false;
        }
    }
    return true;
}

//function cadastrarFornecedor($conn) {
//    $nome = $conn->real_escape_string($_POST['nome'] ?? '');
//    $cnpj_cpf = $conn->real_escape_string($_POST['cnpj_cpf'] ?? '');
//    
//    // Validações básicas
//    if (empty($nome) || empty($cnpj_cpf)) {
//        throw new Exception('Preencha todos os campos obrigatórios');
//    }
//    
//    // Verificar CNPJ/CPF único
//    $stmt_check = $conn->prepare("SELECT codigo_fornecedor FROM Fornecedores WHERE cnpj_cpf = ?");
//    $stmt_check->bind_param("s", $cnpj_cpf);
//    $stmt_check->execute();
//    
//    if ($stmt_check->get_result()->num_rows > 0) {
//        throw new Exception('CNPJ/CPF já cadastrado');
//    }
//    
//    // Inserir fornecedor
//    $stmt = $conn->prepare("INSERT INTO Fornecedores (nome, cnpj_cpf) VALUES (?, ?)");
//    $stmt->bind_param("ss", $nome, $cnpj_cpf);
//    
//    if ($stmt->execute()) {
//        echo json_encode(['status' => 'sucesso', 'mensagem' => 'Fornecedor cadastrado com sucesso']);
//    } else {
//        throw new Exception('Erro ao cadastrar fornecedor: ' . $conn->error);
//    }
//}
//
//function editarFornecedor($conn) {
//    $id = intval($_POST['id'] ?? 0);
//    $nome = $conn->real_escape_string($_POST['nome'] ?? '');
//    $cnpj_cpf = $conn->real_escape_string($_POST['cnpj_cpf'] ?? '');
//    
//    // Validações básicas
//    if (empty($id) || empty($nome) || empty($cnpj_cpf)) {
//        throw new Exception('Preencha todos os campos obrigatórios');
//    }
//    
//    // Verificar se fornecedor existe
//    $stmt_check = $conn->prepare("SELECT codigo_fornecedor FROM Fornecedores WHERE codigo_fornecedor = ?");
//    $stmt_check->bind_param("i", $id);
//    $stmt_check->execute();
//    
//    if ($stmt_check->get_result()->num_rows === 0) {
//        throw new Exception('Fornecedor não encontrado');
//    }
//    
//    // Verificar CNPJ/CPF único (exceto para o próprio fornecedor)
//    $stmt_check = $conn->prepare("SELECT codigo_fornecedor FROM Fornecedores WHERE cnpj_cpf = ? AND codigo_fornecedor != ?");
//    $stmt_check->bind_param("si", $cnpj_cpf, $id);
//    $stmt_check->execute();
//    
//    if ($stmt_check->get_result()->num_rows > 0) {
//        throw new Exception('CNPJ/CPF já cadastrado para outro fornecedor');
//    }
//    
//    // Atualizar fornecedor
//    $stmt = $conn->prepare("UPDATE Fornecedores SET nome = ?, cnpj_cpf = ? WHERE codigo_fornecedor = ?");
//    $stmt->bind_param("ssi", $nome, $cnpj_cpf, $id);
//    
//    if ($stmt->execute()) {
//        echo json_encode(['status' => 'sucesso', 'mensagem' => 'Fornecedor atualizado com sucesso']);
//    } else {
//        throw new Exception('Erro ao atualizar fornecedor: ' . $conn->error);
//    }
//}

function verificarDocumento($conn) {
    header('Content-Type: application/json'); // Garante o cabeçalho JSON
    
    try {
        $cnpj_cpf = $conn->real_escape_string($_GET['cnpj_cpf'] ?? '');
        $id = isset($_GET['id']) ? intval($_GET['id']) : null;
        
        if (empty($cnpj_cpf)) {
            throw new Exception('CNPJ/CPF não fornecido');
        }

        $sql = "SELECT COUNT(*) as total FROM Fornecedores WHERE cnpj_cpf = '$cnpj_cpf'";
        
        if ($id) {
            $sql .= " AND codigo_fornecedor != $id";
        }
        
        $result = $conn->query($sql);
        
        if (!$result) {
            throw new Exception('Erro na consulta ao banco de dados');
        }
        
        $row = $result->fetch_assoc();
        echo json_encode([
            'existe' => $row['total'] > 0,
            'status' => 'sucesso'
        ]);
        
    } catch (Exception $e) {
        echo json_encode([
            'existe' => false,
            'status' => 'erro',
            'mensagem' => $e->getMessage()
        ]);
    }
}
function deletarFornecedor($conn) {
    $id = intval($_POST['id'] ?? 0);
    
    if (empty($id)) {
        throw new Exception('ID do fornecedor inválido');
    }
    
    // Verificar se fornecedor existe
    $stmt_check = $conn->prepare("SELECT codigo_fornecedor FROM Fornecedores WHERE codigo_fornecedor = ?");
    $stmt_check->bind_param("i", $id);
    $stmt_check->execute();
    
    if ($stmt_check->get_result()->num_rows === 0) {
        throw new Exception('Fornecedor não encontrado');
    }
    
    // Deletar fornecedor
    $stmt = $conn->prepare("DELETE FROM Fornecedores WHERE codigo_fornecedor = ?");
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        echo json_encode(['status' => 'sucesso', 'mensagem' => 'Fornecedor deletado com sucesso']);
    } else {
        throw new Exception('Erro ao deletar fornecedor: ' . $conn->error);
    }
}
