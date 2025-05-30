<?php
session_start();
if (!isset($_SESSION['usuario_logado'])) {
    header("Location: ../index.html");
    exit();
}
?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Identidade - Meu Perfil</title>
    <link rel="icon" type="image/x-icon" href="../Fotos/favicon.ico">
  <link rel="stylesheet" href="../CSS/perfil_style.css">
</head>
<body>
  <header>
    <div class="logo">
      <img src="../Fotos/Logo-Branco.png" alt="Logo Identidade">
      <h1>Identidade</h1>
    </div>
    <button class="menu-button" onclick="toggleMenu()">☰</button>
  </header>

  <main>
    <div class="info-container">
      <h3>Informações Pessoais</h3>
      <!--<p><strong>ID do Cadastro:</strong> <span id="user-id"></span></p>-->
      <p><strong>Nome Completo:</strong> <span id="user-name"></span></p>
      <p><strong>Email:</strong> <span id="user-email"></span></p>
      <p><strong>CPF:</strong> <span id="user-cpf"></span></p>
      <p><strong>Telefone:</strong> <span id="user-phone"></span></p>
      <button class="edit-button" onclick="openEditModal('personal-info')">Editar</button>
    </div>

<!-- Modal de Edição -->
<div id="edit-modal" class="modal">
  <div class="modal-content">
    <span class="close-button" onclick="closeEditModal()">&times;</span>
    <h3 id="modal-title">Editar Informações</h3>
    <form id="edit-form">
      <label for="edit-name">Nome Completo:</label>
      <input type="text" id="edit-name" name="nome" required>
      
      <label for="edit-phone">Telefone:</label>
      <input type="text" id="edit-phone" name="telefone" required>
    </form>
    <button class="save-button" onclick="saveChanges()">Salvar</button>
  </div>
</div>

  <div id="mensagem" class="mensagem"></div>
  </main>

  <script src="../JS/perfil-java.js"></script>
  <script src="../JS/sidebar.js"></script>
  <script> criarSidebar(); </script>
</body>
</html>
