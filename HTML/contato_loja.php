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
    <title>Identidade - Contato via WhatsApp</title>
    <link rel="icon" type="image/x-icon" href="../Fotos/favicon.ico">
    <link rel="stylesheet" href="../CSS/contato_loja.css">
</head>
<body>

  <header>
    <div class="logo">
      <img src="../Fotos/Logo-Branco.png" alt="Logo Identidade">
        <h1>Identidade</h1>
    </div>
    <div id="windowtitle">
        <h3 id="inner">-</h3>
        <h3>Contato via WhatsApp</h3>
    </div>
    <button class="menu-button" onclick="toggleMenu()">☰</button>
  </header>

    <main> 
        <h1>Instruções para Finalizar a Compra</h1>
        <section>
            <h2>Agora que você finalizou seu pedido, entre em contato com a loja para finalizar o pagamento e combinar a entrega.</h2>
            <p>Por favor, clique no botão abaixo para ser redirecionado ao WhatsApp da loja:</p>
            <button onclick="window.location.href='https://wa.me/5511XXXXXXXXX?text=Olá%2C%20gostaria%20de%20finalizar%20meu%20pedido%20com%20o%20número%20do%20pedido%20ID%3A%20X'">Entrar em contato via WhatsApp</button>
        </section>
    </main>
  <script src="../JS/sidebar.js"></script>
  <script>
    criarSidebar();
  </script>
</body>
</html>
