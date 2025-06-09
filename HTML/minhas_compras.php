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
  <title>Identidade - Minhas Compras</title>
    <link rel="icon" type="image/x-icon" href="../Fotos/favicon.ico">
  <link rel="stylesheet" href="../CSS/minhas_compras_style.css">
</head>
<body>
  <header>
    <div class="logo">
      <img src="../Fotos/Logo-Branco.png" alt="Logo Identidade">
      <h1>Identidade</h1>
    </div>

    <div id="windowtitle">
        <h3 id="inner">-</h3>
        <h3>Minhas Compras</h3>
    </div>
    <button class="menu-button" onclick="toggleMenu()">☰</button>
  </header>

<!-- Container para a mensagem de sucesso ou erro -->
<div id="mensagem"></div>

  <main>
    <div class="sales-control">
      <div class="filter-section">
        <div class="date-range">
          <span>De:</span>
          <input type="date" id="start-date" class="filter-input">
          <span>Até:</span>
          <input type="date" id="end-date" class="filter-input">
        </div>
        <button class="filter-button" onclick="filterByDate()">Filtrar</button>
        <button class="filter-button" onclick="resetFilter()" style="background: #757575;">Limpar</button>
      </div>

      <div class="sales-list" id="sales-list">
        <!-- Pedidos serão inseridos aqui via JS -->
      </div>

      <p id="no-orders-message" style="text-align:center; margin-top: 20px; display:none;">Nenhum pedido encontrado.</p>
    </div>
  </main>

  <script src="../JS/minhas-compras-java.js"></script>
  <script src="../JS/sidebar.js"></script>
  <script>
    criarSidebar();
    carregarPedidos();
  </script>
</body>
</html>
