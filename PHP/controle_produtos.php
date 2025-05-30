<?php
session_start();

if (!isset($_SESSION['usuario_logado'])) {
    header('Content-Type: application/json');
    echo json_encode(['erro' => 'Usuário não logado.']);
    exit();
}

require "db_connect.php";

// Configurar cabeçalho para retornar JSON
header('Content-Type: application/json');

$action = $_REQUEST['action'] ?? '';

try {
    switch ($action) {
        case 'listar':
            listarProdutos($conn);
            break;
        case 'buscar':
            buscarProduto($conn);
            break;
        case 'cadastrar':
            cadastrarProduto($conn);
            break;
        case 'editar':
            editarProduto($conn);
            break;
        case 'deletar':
            deletarProduto($conn);
            break;
        case 'listar_fornecedores':
            listarFornecedores($conn);
            break;
        default:
            echo json_encode(['erro' => 'Ação inválida.']);
            break;
    }
} catch (Exception $e) {
    echo json_encode(['erro' => 'Erro no servidor: ' . $e->getMessage()]);
}

$conn->close();

function listarFornecedores($conn) {
    $sql = "SELECT codigo_fornecedor, nome FROM Fornecedores ORDER BY nome";
    $result = $conn->query($sql);

    $fornecedores = [];
    while ($row = $result->fetch_assoc()) {
        $fornecedores[] = $row;
    }

    echo json_encode($fornecedores);
}

function listarProdutos($conn) {
    $nome = $conn->real_escape_string($_GET['nome'] ?? '');
    $genero = $conn->real_escape_string($_GET['genero'] ?? '');
    $tipo = $conn->real_escape_string($_GET['tipo'] ?? '');

    $sql = "SELECT p.*, f.nome AS fornecedor FROM Produtos p JOIN Fornecedores f ON p.fk_fornecedor = f.codigo_fornecedor WHERE 1=1";

    if (!empty($nome)) {
        $sql .= " AND p.nome LIKE '%$nome%'";
    }
    if (!empty($genero)) {
        $sql .= " AND p.genero = '$genero'";
    }
    if (!empty($tipo)) {
        $sql .= " AND p.tipo = '$tipo'";
    }

    $result = $conn->query($sql);

    $produtos = [];
    while ($row = $result->fetch_assoc()) {
        if (!empty($row['imagem'])) {
            $row['imagem'] = base64_encode($row['imagem']);
        }
        $produtos[] = $row;
    }

    echo json_encode($produtos);
}

function buscarProduto($conn) {
    $codigo_produto = $conn->real_escape_string($_GET['codigo_produto']);
    
    $stmt = $conn->prepare("SELECT p.*, f.nome AS fornecedor FROM Produtos p JOIN Fornecedores f ON p.fk_fornecedor = f.codigo_fornecedor WHERE p.codigo_produto = ?");
    $stmt->bind_param("i", $codigo_produto);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($produto = $result->fetch_assoc()) {
        if (!empty($produto['imagem'])) {
            $produto['imagem'] = base64_encode($produto['imagem']);
        }
        echo json_encode($produto);
    } else {
        echo json_encode(['erro' => 'Produto não encontrado.']);
    }
}

function cadastrarProduto($conn) {
    $nome = $_POST['product-name'];
    $tipo = $_POST['product-type'];
    $genero = $_POST['product-gender'];
    $preco = (float)$_POST['product-price'];
    $quant_estoque = $_POST['product-stock'];
    $tamanho = $_POST['product-size'];
    $cor = $_POST['product-color'];
    $descricao = $_POST['product-description'];
    $fornecedor = $_POST['product-supplier'];
    
    $imagem = null;
    if (isset($_FILES['product-image']) && $_FILES['product-image']['error'] === UPLOAD_ERR_OK) {
        $imagem = file_get_contents($_FILES['product-image']['tmp_name']);
    }

    $stmt = $conn->prepare("INSERT INTO Produtos (nome, tipo, genero, quant_estoque, preco, imagem, tamanho, cor, descricao, fk_fornecedor) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sssidssssi", $nome, $tipo, $genero, $quant_estoque, $preco, $imagem, $tamanho, $cor, $descricao, $fornecedor);

    if ($stmt->execute()) {
        echo json_encode(['sucesso' => 'Produto cadastrado com sucesso!']);
    } else {
        echo json_encode(['erro' => 'Erro ao cadastrar produto: ' . $conn->error]);
    }
}

function editarProduto($conn) {
    $codigo_produto = $_POST['codigo_produto'];
    $nome = $_POST['product-name'];
    $tipo = $_POST['product-type'];
    $genero = $_POST['product-gender'];
    $preco = $_POST['product-price'];
    $quant_estoque = $_POST['product-stock'];
    $tamanho = $_POST['product-size'];
    $cor = $_POST['product-color'];
    $descricao = $_POST['product-description'];
    $fornecedor = $_POST['product-supplier'];

    // Verificar se há nova imagem
    if (isset($_FILES['product-image']) && $_FILES['product-image']['error'] === UPLOAD_ERR_OK) {
        $imagem = file_get_contents($_FILES['product-image']['tmp_name']);
        $stmt = $conn->prepare("UPDATE Produtos SET nome=?, tipo=?, genero=?, quant_estoque=?, preco=?, imagem=?, tamanho=?, cor=?, descricao=?, fk_fornecedor=? WHERE codigo_produto=?");
        $stmt->bind_param("sssdbsssssi", $nome, $tipo, $genero, $quant_estoque, $preco, $imagem, $tamanho, $cor, $descricao, $fornecedor, $codigo_produto);
    } else {
        $stmt = $conn->prepare("UPDATE Produtos SET nome=?, tipo=?, genero=?, quant_estoque=?, preco=?, tamanho=?, cor=?, descricao=?, fk_fornecedor=? WHERE codigo_produto=?");
        $stmt->bind_param("sssdssssii", $nome, $tipo, $genero, $quant_estoque, $preco, $tamanho, $cor, $descricao, $fornecedor, $codigo_produto);
    }

    if ($stmt->execute()) {
        echo json_encode(['sucesso' => 'Produto atualizado com sucesso!']);
    } else {
        echo json_encode(['erro' => 'Erro ao atualizar produto: ' . $conn->error]);
    }
}

function deletarProduto($conn) {
    $codigo_produto = $_POST['codigo_produto'];

    $stmt = $conn->prepare("DELETE FROM Produtos WHERE codigo_produto = ?");
    $stmt->bind_param("i", $codigo_produto);

    if ($stmt->execute()) {
        echo json_encode(['sucesso' => 'Produto deletado com sucesso!']);
    } else {
        echo json_encode(['erro' => 'Erro ao deletar produto: ' . $conn->error]);
    }
}
?>
