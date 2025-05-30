<?php
session_start();
if (!isset($_SESSION['usuario_logado'])) {
    header("Location: ../index.html");
    exit();
}

if (!$_SESSION['usuario']['administrador']) {
    header("Location: catalogo.php");
    exit();
}
?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Identidade - Controle de Clientes</title>
    <link rel="icon" type="image/x-icon" href="../Fotos/favicon.ico">
  <link rel="stylesheet" href="../CSS/controle_clientes_style.css">
</head>
<body>
  <header>
    <div class="logo">
      <img src="../Fotos/Logo.png" alt="Logo Identidade">
      <h1>Identidade</h1>
    </div>
    <button class="menu-button" onclick="toggleMenu()">☰</button>
  </header>

<!-- Container para a mensagem de sucesso ou erro -->
<div id="mensagem"></div>

  <main>
    <div class="filters">
      <input type="text" id="search-client" placeholder="Pesquisar funcionário...">
      <button class="add-button" onclick="openClientModal()">Cadastrar Funcionário</button>
    </div>

    <table class="client-table">
      <thead>
        <tr>
          <th>Código</th>
          <th>Nome Completo</th>
          <th>CPF</th>
          <th>Telefone</th>
          <th>Email</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody id="client-table-body">
        <!-- Aqui cai o conteúdo da tabela -->
      </tbody>
    </table>
  </main>

<div id="client-modal" class="modal">
  <div class="modal-content">
    <span class="close-button" onclick="closeClientModal()">&times;</span>
    <h3 id="modal-title">Cadastrar Funcionário</h3>
    <form id="client-form" onsubmit="return false;">
      <input type="hidden" id="client-id" name="id">
      
      <label for="client-name">Nome Completo:</label>
      <input type="text" id="client-name" name="nome" required>

      <label for="client-cpf">CPF:</label>
      <input type="text" id="client-cpf" name="cpf" required>

      <label for="client-phone">Telefone:</label>
      <input type="text" id="client-phone" name="telefone" required>

      <label for="client-email">Email:</label>
      <input type="email" id="client-email" name="email" required>

    <div class="password-container">
        <label for="client-password">Senha:</label>
        <!--<input type="password" id="client-password" name="senha" placeholder=`${action === 'editar' ? 'Deixe em branco para não alterar' : 'Obrigatório'}`>-->
        <input type="password" id="client-password" name="senha" placeholder="Obrigatório">
    </div>

    <div id="employee-field">
        <label for="client-funcionario">Funcionário:</label>
        <input type="checkbox" id="client-funcionario" name="funcionario">
<br>
        <label for="client-administrador">Administrador:</label>
        <input type="checkbox" id="client-administrador" name="administrador">
    </div>

      <button type="submit" class="save-button">Cadastrar</button>
    </form>
  </div>
</div>

  <div id="confirmation-modal" class="confirmation-modal">
    <div class="confirmation-content">
      <h3 id="confirmation-message">Deseja realmente apagar este registro?</h3>
      <div class="confirmation-buttons">
        <button onclick="confirmarAcao(true)">Sim</button>
        <button onclick="confirmarAcao(false)">Não</button>

      </div>
    </div>
  </div>

  <!--<script src="../JS/controle-clientes-java.js"></script>-->
  <script src="../JS/controle-funcionarios-java.js"></script>
  <script src="../JS/sidebar.js"></script>
  <script> criarSidebar(); </script>
</body>
</html>
