<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Identidade - Carrinho</title>
    <link rel="icon" type="image/x-icon" href="../Fotos/favicon.ico">
  <link rel="stylesheet" href="../CSS/carrinho_style.css">
</head>
<body>
  <header>
    <div class="logo">
      <img src="../Fotos/Logo.png" alt="Logo Identidade">
      <h1>Identidade</h1>
    </div>
    <button class="menu-button" onclick="toggleMenu()">☰</button>
  </header>

  <main>
    <div class="produtos-container">
      <h3>Produtos Selecionados:</h3>
      <div id="carrinho-itens">
        <!-- Produtos serão inseridos aqui via JavaScript -->
      </div>
      <button class="adicionar-produto" onclick="window.location.href='catalogo.php'">Selecionar Mais Produtos</button>
    </div>

    <!-- Adicione isso antes do fechamento do </body> -->
    <div id="confirmation-remove-modal" class="confirmation-modal">
        <div class="confirmation-content">
            <h3>Tem certeza que deseja remover este produto?</h3>
            <div class="confirmation-buttons">
                <button id="confirmar-remocao">Sim</button>
                <button id="cancelar-remocao">Não</button>
            </div>
        </div>
    </div>

    <div class="pagamento-container">
      <h3>Forma de Pagamento:</h3>
      <div class="opcao-pix">
        <input type="radio" name="pagamento" id="pix" checked>
        <label for="pix">PIX</label>
      </div>
      <div class="contato-loja">
        <strong>ENTRE EM CONTATO COM A LOJA PARA REALIZAR O PAGAMENTO:</strong>
        <p>Telefone: (11) 98765-4321</p>
      </div>
    </div>

    <div class="resumo-container">
      <h3>Resumo do Pedido:</h3>
      <!--<p><strong>Data do Carrinho:</strong> <span id="data-carrinho"></span></p>-->
      <p><strong>Preço Total:</strong> R$ <span id="preco-total">0,00</span></p>
      <div class="acoes-botoes">
        <button class="pagar" onclick="confirmarPagamento()">Pagar</button>
        <button class="cancelar" onclick="abrirModalCancelar()">Cancelar Carrinho</button>
        <!--<button class="salvar" onclick="abrirModalSalvar()">Salvar Rascunho</button>-->
      </div>
    </div>
  </main>

<!-- Modal de confirmação de cancelamento -->
<div id="cancelar-modal" class="modal">
    <div class="modal-conteudo">
        <h3>Tem certeza de que deseja cancelar o carrinho?</h3>
        <div class="modal-botoes">
            <button id="confirmar-cancelar">Sim</button>
            <button id="fechar-modal">Não</button>
        </div>
    </div>
</div>
<!-- Container para a mensagem de sucesso ou erro -->
<div id="mensagem"></div>

  <script src="../JS/carrinho-java.js"></script>
  <script src="../JS/sidebar.js"></script>
  <script> criarSidebar(); </script>
</body>
</html>
