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
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Identidade - Controle de Fornecedores</title>
    <link rel="icon" type="image/x-icon" href="../Fotos/favicon.ico">
  <link rel="stylesheet" href="../CSS/controle_fornecedores_style.css">
</head>
<body>
  <header>
    <div class="logo">
      <img src="../Fotos/Logo-Branco.png" alt="Logo Identidade">
      <h1>Identidade</h1>
    </div>

    <div id="windowtitle">
        <h3 id="inner">-</h3>
        <h3>Controle de Fornecedores</h3>
    </div>
    <button class="menu-button" onclick="toggleMenu()">☰</button>
  </header>

  <div id="mensagem"></div>

  <main>
    <div class="filters">
      <input type="text" id="search-supplier" placeholder="Pesquisar fornecedor...">
      <button class="add-button" onclick="openSupplierModal()">Cadastrar Fornecedor</button>
    </div>

    <table class="supplier-table">
      <thead>
        <tr>
          <th>Código</th>
          <th>Nome</th>
          <th>CNPJ/CPF</th>
          <th>Telefone</th>
          <th>Endereço</th>
          <th>Representante</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody id="supplier-table-body">
        </tbody>
    </table>
  </main>

  <div id="supplier-modal" class="modal">
    <div class="modal-content">
      <span class="close-button" onclick="closeSupplierModal()">&times;</span>
      <h3 id="modal-title">Cadastrar Fornecedor</h3>
      <form id="supplier-form" onsubmit="salvarFornecedor(event)">
        <input type="hidden" id="supplier-id" name="id">
        
        <label for="supplier-name">Nome:</label>
        <input type="text" id="supplier-name" name="nome" required>

        <label for="supplier-cnpj-cpf">CNPJ/CPF:</label>
        <input type="text" id="supplier-cnpj-cpf" name="cnpj_cpf" required>

        <label for="supplier-phone">Telefone:</label>
        <input type="tel" id="supplier-phone" name="telefone" required maxlength="15">

        <label for="supplier-address">Endereço:</label>
        <input type="text" id="supplier-address" name="edereco" required maxlength="128">

        <label for="supplier-rep">Nome do Representante:</label>
        <input type="text" id="supplier-rep" name="nome_representante" maxlength="128">
        <button type="submit" class="save-button">Salvar</button>
      </form>
    </div>
  </div>

  <div id="confirmation-modal" class="confirmation-modal">
    <div class="confirmation-content">
      <h2 id="confirmation-message">Deseja realmente apagar este registro?</h2>
      <div class="confirmation-buttons">
        <button onclick="confirmarAcao(true)">Sim</button>
        <button onclick="confirmarAcao(false)">Não</button>
      </div>
    </div>
  </div>

  <script src="../JS/controle-fornecedores-java.js"></script>
  <script src="../JS/sidebar.js"></script>
  <script> criarSidebar(); </script>
</body>
</html>
