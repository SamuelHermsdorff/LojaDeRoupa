<?php
session_start();
if (!isset($_SESSION['usuario_logado'])) {
    header("Location: ../index.html");
    exit();
}

if (!$_SESSION['usuario']['funcionario'] && !$_SESSION['usuario']['administrador']) {
    header("Location: catalogo.php");
    exit();
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Identidade - Controle de Produtos</title>
    <link rel="icon" type="image/x-icon" href="../Fotos/favicon.ico">
  <link rel="stylesheet" href="../CSS/controle_produtos_style.css">
</head>
<body>
  <header>
    <div class="logo">
      <img src="../Fotos/Logo-Branco.png" alt="Logo Identidade">
      <h1>Identidade</h1>
    </div>

    <div id="windowtitle">
        <h3 id="inner">-</h3>
        <h3>Controle de Produtos</h3>
    </div>
    <button class="menu-button" onclick="toggleMenu()">☰</button>
  </header>

<!-- Container para a mensagem de sucesso ou erro -->
<div id="mensagem"></div>
  <main>
    <!--<h2 class="control-title">Controle de Produtos</h2>-->

    <div class="filters">
      <input type="text" id="search-product" placeholder="Pesquisar produto...">
      <select id="filter-gender">
        <option value="">Gênero</option>
        <option value="Masculino">Masculino</option>
        <option value="Feminino">Feminino</option>
        <option value="Unissex">Unissex</option>
      </select>
      <select id="filter-type">
        <option value="">Tipo</option>
        <option value="Camisa">Camisa</option>
        <option>Short</option>
        <option>Bermuda</option>
        <option>Vestido</option>
        <option>Calça</option>
        <option>Tênis</option>
      </select>
      <button class="add-button" onclick="openProductModal()">Cadastrar Produto</button>
    </div>

    <table class="product-table">
      <thead>
        <tr>
          <th>Código</th>
          <th>Nome</th>
          <th>Tipo</th>
          <th>Gênero</th>
          <th>Quant. Estoque</th>
          <th>Preço</th>
          <th>Imagem</th>
          <th>Tamanho</th>
          <th>Cores</th>
          <th>Fornecedor</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody id="product-table-body">
        <!-- Produtos serão inseridos aqui via JavaScript -->
      </tbody>
    </table>
  </main>

<!-- Modal Produto -->
<div id="product-modal" class="modal">
  <div class="modal-content">
    <span class="close-button" onclick="closeProductModal()">&times;</span>
    <h3 id="modal-title">Cadastrar Produto</h3>
    <form id="product-form" enctype="multipart/form-data">
      <input type="hidden" id="codigo-produto" name="codigo_produto">

      <label for="product-name">Nome:</label>
      <input type="text" id="product-name" name="product-name" required>

      <label for="product-type">Tipo:</label>
      <select id="product-type" name="product-type" required>
        <option value="Camisa">Camisa</option>
        <option value="Short">Short</option>
        <option value="Bermuda">Bermuda</option>
        <option value="Vestido">Vestido</option>
        <option value="Calça">Calça</option>
        <option value="Tênis">Tênis</option>
        <option value="Saia">Saia</option>
        <option value="Camiseta">Camiseta</option>
        <option value="Jaqueta">Jaqueta</option>
      </select>

      <label for="product-gender">Gênero:</label>
      <select id="product-gender" name="product-gender" required>
        <option value="Masculino">Masculino</option>
        <option value="Feminino">Feminino</option>
        <option value="Unissex">Unissex</option>
      </select>

      <label for="product-stock">Quantidade em Estoque:</label>
      <input type="number" id="product-stock" name="product-stock" required>

      <label for="product-price">Preço (R$):</label>
      <input type="number" id="product-price" name="product-price" step="0.01" required>

    <label for="product-size">Tamanho:</label>
    <select id="product-size" name="product-size" required>
        <option value="">Selecione um tamanho</option>
        <option value="PP">PP</option>
        <option value="P">P</option>
        <option value="M">M</option>
        <option value="G">G</option>
        <option value="GG">GG</option>
        <option value="XG">XG</option>
        <option value="XXG">XXG</option>
        <option value="Único">Único</option>
    </select>

      <label for="product-color">Cor:</label>
      <input type="text" id="product-color" name="product-color" required>

      <label for="product-description">Descrição:</label>
      <textarea id="product-description" name="product-description" required></textarea>

      <label for="product-supplier">Fornecedor:</label>
      <select id="product-supplier" name="product-supplier" required>
        <option value="">Carregando fornecedores...</option>
      </select>

      <div id="image-preview-container"></div>
      
      <label for="product-image">Imagem do Produto:</label>
      <input type="file" id="product-image" name="product-image" accept="image/*">

      <button type="submit" class="save-button">Salvar</button>
    </form>
  </div>
</div>

  <!-- Modal de Confirmação -->
  <div id="confirmation-modal" class="confirmation-modal">
    <div class="confirmation-content">
      <h3 id="confirmation-message">Deseja realmente apagar este produto?</h3>
      <div class="confirmation-buttons">
        <button onclick="confirmAction(true)">Sim</button>
        <button onclick="confirmAction(false)">Não</button>
      </div>
    </div>
  </div>

  <script src="../JS/controle-produtos-java.js"></script>
  <script src="../JS/sidebar.js"></script>
  <script> criarSidebar(); </script>
</body>
</html>
