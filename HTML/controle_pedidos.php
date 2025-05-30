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
  <title>Identidade - Controle Pedidos</title>
    <link rel="icon" type="image/x-icon" href="../Fotos/favicon.ico">
  <link rel="stylesheet" href="../CSS/controle_pedidos_style.css">
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
    <div class="pedidos-control">
      <h2>Pedidos</h2>

      <div class="pedidos-list" id="pedidos-list">
        <!-- Pedidos serão inseridos aqui via JS -->
      </div>

      <p id="no-pedidos-message" style="text-align:center; margin-top: 20px; display:none;">Nenhum pedido encontrado.</p>
    </div>
  </main>


  <script src="../JS/controle_pedidos.js"></script>
  <script>
    // Chama a função para carregar os pedidos
    carregarPedidos();
  </script>
  <script src="../JS/sidebar.js"></script>
  <script> criarSidebar(); </script>

</body>
</html>
