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
  <title>Identidade - Novo Pedido</title>
    <link rel="icon" type="image/x-icon" href="../Fotos/favicon.ico">
  <link rel="stylesheet" href="../CSS/registrar_venda_style.css">
</head>
<body>
  <header>
    <div class="logo">
      <img src="../Fotos/Logo-Branco.png" alt="Logo Identidade">
      <h1>Identidade</h1>
    </div>

    <div id="windowtitle">
        <h3 id="inner">-</h3>
        <h3>Registrar Venda</h3>
    </div>
    <button class="menu-button" onclick="toggleMenu()">☰</button>
  </header>

  <!-- Container para mensagens -->
  <div id="mensagem"></div>

  <main>
    <div class="container" id="initial-container">
      <h2>Novo Pedido</h2>
      <p>Clique no botão abaixo para começar a registrar um novo pedido.</p>
      <button class="btn btn-primary" onclick="startNewOrder()">Registrar Novo Pedido</button>
    </div>

    <div class="container hidden" id="order-container">
      <h2>Registrar Novo Pedido</h2>

<!-- Atualize os campos do formulário -->
<div class="form-container">
    <h3>Dados do Cliente</h3>
    <div class="form-group">
        <label for="client-name">Nome Completo</label>
        <input type="text" id="client-name" class="form-control" required>
        <!-- Mensagem de validação aparecerá aqui -->
    </div>
    <div class="form-group">
        <label for="client-cpf">CPF</label>
        <input type="text" id="client-cpf" class="form-control" required>
        <!-- Mensagem de validação aparecerá aqui -->
    </div>
    <div class="form-group">
        <label for="client-phone">Telefone</label>
        <input type="tel" id="client-phone" class="form-control" required>
        <!-- Mensagem de validação aparecerá aqui -->
    </div>
    <div class="form-group">
        <label for="client-email">Email (Opcional)</label>
        <input type="email" id="client-email" class="form-control">
    </div>
</div>

      <div class="form-container" style="margin-top: 30px;">
        <h3>Seleção de Produtos</h3>

        <div class="product-filters">
          <div class="filter-group">
            <label for="product-search">Pesquisar produto</label>
            <input type="text" id="product-search" class="filter-input" placeholder="Digite o nome do produto..." oninput="filterProducts()">
          </div>
          
          <div class="filter-group">
            <label for="product-type">Tipo</label>
            <select id="product-type" class="filter-input" onchange="filterProducts()">
              <option value="">Todos</option>
              <option>Camiseta</option>
              <option>Saia</option>
              <option>Shorts</option>
              <option>Bermuda</option>
              <option>Tênis</option>
              <option>Vestido</option>
              <option>Top</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>Filtrar por gênero</label>
            <div class="gender-filter">
              <label class="gender-option">
                <input type="radio" name="gender-filter" value="" checked onchange="filterProducts()">
                <span>Todos</span>
              </label>
              <label class="gender-option">
                <input type="radio" name="gender-filter" value="Masculino" onchange="filterProducts()">
                <span>Masculino</span>
              </label>
              <label class="gender-option">
                <input type="radio" name="gender-filter" value="Feminino" onchange="filterProducts()">
                <span>Feminino</span>
              </label>
              <label class="gender-option">
                <input type="radio" name="gender-filter" value="Unissex" onchange="filterProducts()">
                <span>Unissex</span>
              </label>
            </div>
          </div>
        </div>
        
        <div class="product-grid" id="products-container">
          <!-- Produtos serão carregados dinamicamente -->
        </div>
      </div>

      <div class="form-container" style="margin-top: 30px;">
        <div style="display: flex; gap: 20px; flex-wrap: wrap;">
          <div style="flex: 1; min-width: 300px;">
            <h3>Forma de Pagamento</h3>
            <div class="payment-options">
              <label class="payment-option" onclick="selectPayment(this, 'PIX')">
                <input type="radio" name="payment" value="PIX"> PIX
              </label>
              <label class="payment-option" onclick="selectPayment(this, 'Débito')">
                <input type="radio" name="payment" value="Débito"> Cartão de Débito
              </label>
              <label class="payment-option" onclick="selectPayment(this, 'Crédito')">
                <input type="radio" name="payment" value="Crédito"> Cartão de Crédito
                <div class="installments" id="installments">
                  <select id="installment-select">
                    <option value="1">1x sem juros</option>
                    <option value="2">2x sem juros</option>
                    <option value="3">3x sem juros</option>
                    <option value="4">4x com juros</option>
                    <option value="5">5x com juros</option>
                  </select>
                </div>
              </label>
            </div>
          </div>

          <div style="flex: 1; min-width: 300px;">
            <h3>Resumo do Pedido</h3>
            <div class="summary">
              <div class="summary-item">
                <span>Data do Pedido:</span>
                <span id="order-date">10/04/2025</span>
              </div>
              <div class="summary-item">
                <span>Itens Selecionados:</span>
                <span id="selected-items">0</span>
              </div>
              <div class="summary-item">
                <span>Subtotal:</span>
                <span id="subtotal">R$ 0,00</span>
              </div>
              <div class="summary-item summary-total">
                <span>Total:</span>
                <span id="total">R$ 0,00</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="action-buttons">
        <button class="btn btn-primary" onclick="saveOrder()">Salvar Pedido</button>
        <button class="btn btn-secondary" onclick="cancelOrder()">Cancelar</button>
      </div>
    </div>
  </main>

  <script src="../JS/registrar-venda-java.js"></script>
  <script src="../JS/sidebar.js"></script>
  <script> criarSidebar(); </script>
</body>
</html>
