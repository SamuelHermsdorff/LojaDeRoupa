function calcularDataEntrega() {
    const hoje = new Date();
    const entrega = new Date(hoje);
    entrega.setDate(hoje.getDate() + 15);

    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return entrega.toLocaleDateString('pt-BR', options);
}

function exibirDatas() {
    const hoje = new Date();
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };

    document.getElementById("data-carrinho").textContent = hoje.toLocaleDateString('pt-BR', options);
    document.getElementById("data-entrega").textContent = calcularDataEntrega();
}

function calcularPrecoTotal() {
    const produtos = document.querySelectorAll(".produto-item");
    let total = 0;

    produtos.forEach(produto => {
      const preco = parseFloat(produto.querySelector(".produto-info p:nth-child(3)").textContent.replace("R$ ", "").replace(",", "."));
      const quantidade = parseInt(produto.querySelector(".quantidade-input").value);
      total += preco * quantidade;
    });

    document.getElementById("preco-total").textContent = total.toFixed(2).replace(".", ",");
}

document.querySelectorAll(".quantidade-input").forEach(input => {
    input.addEventListener("input", calcularPrecoTotal);
});

function confirmarPagamento() {
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

    if (carrinho.length === 0) {
        enviarMensagemAjax("Carrinho vazio.", "erro");
        return;
    }

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "../PHP/criar_pedido.php", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    //
    const dados = new URLSearchParams();
    dados.append('carrinho', JSON.stringify(carrinho)); // Enviar o carrinho como JSON

    xhr.onload = function() {
        if (xhr.status === 200) {
            enviarMensagemAjax("Pedido Realizado com sucesso!", "sucesso");
            localStorage.removeItem('carrinho');
            setTimeout(function() {
                window.location.href = "../HTML/contato_loja.php";
            }, 500);
        } else {
            enviarMensagemAjax("Falha ao realizar pedido.", "erro");
        }
    };

    xhr.send(dados);
}

function abrirModalSalvar() {
    document.getElementById("confirmation-salvar-modal").style.display = "flex";
}

function abrirModalCancelar() {
    const modalCancelar = document.getElementById('cancelar-modal');
    modalCancelar.style.display = 'flex';
}

function fecharModalCancelar() {
    const modalCancelar = document.getElementById('cancelar-modal');
    modalCancelar.style.display = 'none';
}

function cancelarCarrinho() {
    localStorage.removeItem('carrinho');
    window.location.reload(); // Atualiza a página para refletir o carrinho vazio
}

document.getElementById('confirmar-cancelar').addEventListener('click', () => {
    cancelarCarrinho();
    fecharModalCancelar(); // Fecha o modal após cancelar o carrinho
});

document.getElementById('fechar-modal').addEventListener('click', () => {
    fecharModalCancelar(); // Fecha o modal se o usuário clicar em "Não"
});

//exibirDatas();
//calcularPrecoTotal();

// Função para formatar o valor em reais
function formatarPreco(valor) {
  return valor.toFixed(2).replace('.', ',');
}

// Carrega os produtos do carrinho
function carregarCarrinho() { 
  const carrinhoItens = document.getElementById('carrinho-itens');
  const precoTotalEl = document.getElementById('preco-total');

  let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

  if (!carrinho || !precoTotalEl || !carrinhoItens) {
    console.error('Elemento de carrinho não encontrado no HTML.');
    return;
  }
  
  carrinhoItens.innerHTML = '';
  let precoTotal = 0;

  if (carrinho.length === 0) {
    carrinhoItens.innerHTML = '<p>Seu carrinho está vazio.</p>';
    precoTotalEl.textContent = '0,00';
    return;
  }

  carrinho.forEach((produto, index) => {
    const produtoDiv = document.createElement('div');
    produtoDiv.classList.add('produto-item');

    produtoDiv.innerHTML = `
      <img src="data:image/jpeg;base64,${produto.imagem}" alt="${produto.nome}" class="produto-imagem">
      <div class="produto-info">
        <p><strong>Nome:</strong> ${produto.nome}</p>
        <p><strong>Preço:</strong> R$ ${formatarPreco(produto.preco)}</p>
        <p><strong>Quantidade:</strong> <input type="number" min="1" value="${produto.quantidade}" data-index="${index}" class="quantidade-input"></p>
      </div>
    `;
    carrinhoItens.appendChild(produtoDiv);

    precoTotal += produto.preco * produto.quantidade;
  });

  precoTotalEl.textContent = formatarPreco(precoTotal);


  // Coloca data atual no carrinho
  //const hoje = new Date();
  //const dataFormatada = hoje.toLocaleDateString('pt-BR');
  //dataCarrinhoEl.textContent = dataFormatada;

  // Atualiza preço total se mudar a quantidade
  const inputsQuantidade = document.querySelectorAll('.quantidade-input');
  inputsQuantidade.forEach(input => {
    input.addEventListener('change', (e) => {
      const index = e.target.getAttribute('data-index');
      carrinho[index].quantidade = parseInt(e.target.value);
      localStorage.setItem('carrinho', JSON.stringify(carrinho));
      carregarCarrinho(); // recarrega para atualizar o preço total
    });
  });
}

document.addEventListener('DOMContentLoaded', carregarCarrinho);

function enviarMensagemAjax(mensagem, tipo) {
    const mensagemContainer = document.getElementById('mensagem');

    if (tipo === "sucesso") {
        mensagemContainer.innerHTML = `<div class="mensagem sucesso">${mensagem}</div>`;
    } else {
        mensagemContainer.innerHTML = `<div class="mensagem erro">${mensagem}</div>`;
    }
    setTimeout(() => {
        mensagemContainer.innerHTML = '';
    }, 3000);
}
