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
  <title>Identidade - Moda Moderna</title>
    <link rel="icon" type="image/x-icon" href="../Fotos/favicon.ico">
  <link rel="stylesheet" href="../CSS/catalogo_style.css">
</head>
<body>
  <header>
    <div class="logo">
      <img src="../Fotos/Logo-Branco.png" alt="Logo Identidade">
      <h1>Identidade</h1>
    </div>
    <div id="windowtitle">
        <h3 id="inner">-</h3>
        <h3>Catálogo</h3>
    </div>
    <!--<button onclick="window.location.href='carrinho.php'">carrinho</button>-->
    <button class="menu-button" onclick="toggleMenu()">☰</button>
  </header>
  
<!-- Container para a mensagem de sucesso ou erro -->
<div id="mensagem"></div>

  <main>
    <!--<h2 class="catalog-title">Nosso Catálogo!</h2>-->

    <div class="filters">
      <input type="text" id="filtro-nome" placeholder="Pesquisar produtos...">
      <select id="filtro-genero">
        <option>Gênero</option>
        <option>Masculino</option>
        <option>Feminino</option>
        <option>Unissex</option>
      </select>
      <select id="filtro-tipo">
        <option>Tipo</option>
        <option>Camiseta</option>
        <option>Saia</option>
        <option>Shorts</option>
        <option>Bermuda</option>
        <option>Tênis</option>
        <option>Vestido</option>
        <option>Top</option>
      </select>
    </div>

    <div class="product-grid" id="product-grid">
      <!-- Produtos serão carregados aqui -->
    </div>
  </main>

  <script src="../JS/catalogo-java.js"></script>
  <script src="../JS/sidebar.js"></script>
  <script> criarSidebar(); </script>

</body>
</html>
