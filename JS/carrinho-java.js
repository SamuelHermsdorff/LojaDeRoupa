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

async function confirmarPagamento() {
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    
    if (carrinho.length === 0) {
        enviarMensagemAjax("Carrinho vazio.", "erro");
        return;
    }

    // Prepara os dados no formato correto
    const dadosPedido = {
        carrinho: carrinho.map(item => ({
            id: item.id,
            nome: item.nome,
            preco: item.preco,
            quantidade: item.quantidade || item.quantity || 1
        }))
    };

    try {
        //console.log("Enviando dados:", dadosPedido); // Debug
        
        const response = await fetch('../PHP/criar_pedido.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dadosPedido),
            credentials: 'include'
        });

        //console.log("Resposta recebida:", response); // Debug

        // Verifica se a resposta está vazia
        const responseText = await response.text();
        //console.log("Conteúdo da resposta:", responseText); // Debug

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        // Tenta parsear apenas se houver conteúdo
        const data = responseText ? JSON.parse(responseText) : {};
        
        if (data.status === 'sucesso') {
            enviarMensagemAjax("Pedido realizado com sucesso!", "sucesso");
            localStorage.removeItem('carrinho');
            setTimeout(() => {
                window.location.href = "../HTML/contato_loja.php";
            }, 500);
        } else {
            throw new Error(data.mensagem || 'Erro desconhecido');
        }
    } catch (error) {
        console.error('Erro detalhado:', error);
        enviarMensagemAjax("Falha ao finalizar pedido. Tente novamente.", "erro");
    }
}
//function confirmarPagamento() {
//    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
//
//    if (carrinho.length === 0) {
//        enviarMensagemAjax("Carrinho vazio.", "erro");
//        return;
//    }
//
//    const xhr = new XMLHttpRequest();
//    xhr.open("POST", "../PHP/criar_pedido.php", true);
//    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
//    //
//    const dados = new URLSearchParams();
//    dados.append('carrinho', JSON.stringify(carrinho)); // Enviar o carrinho como JSON
//
//    xhr.onload = function() {
//        if (xhr.status === 200) {
//            enviarMensagemAjax("Pedido Realizado com sucesso!", "sucesso");
//            localStorage.removeItem('carrinho');
//            setTimeout(function() {
//                window.location.href = "../HTML/contato_loja.php";
//            }, 500);
//        } else {
//            enviarMensagemAjax("Falha ao realizar pedido.", "erro");
//        }
//    };
//
//    xhr.send(dados);
//}

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
        <button class="produto-remover" data-index="${index}">Remover</button>
      </div>
    `;
    carrinhoItens.appendChild(produtoDiv);

    precoTotal += produto.preco * produto.quantidade;
  });

  precoTotalEl.textContent = formatarPreco(precoTotal);

  // Atualiza preço total se mudar a quantidade
  const inputsQuantidade = document.querySelectorAll('.quantidade-input');
  inputsQuantidade.forEach(input => {
    input.addEventListener('change', (e) => {
      const index = e.target.getAttribute('data-index');
      carrinho[index].quantidade = parseInt(e.target.value);
      localStorage.setItem('carrinho', JSON.stringify(carrinho));
      carregarCarrinho();
    });
  });

  // Adiciona eventos para os botões de remover
  const botoesRemover = document.querySelectorAll('.produto-remover');
  botoesRemover.forEach(botao => {
    botao.addEventListener('click', (e) => {
      const index = e.target.getAttribute('data-index');
      abrirModalRemover(index);
    });
  });
}

// Nova função para remover produto
function removerProduto(index) {
  let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
  
  if (index >= 0 && index < carrinho.length) {
    carrinho.splice(index, 1);
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    carregarCarrinho();
    enviarMensagemAjax("Produto removido do carrinho.", "sucesso");
  }
}

function removerProduto(index) {
  // Modal de confirmação
  if (confirm("Tem certeza que deseja remover este produto do carrinho?")) {
    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    
    if (index >= 0 && index < carrinho.length) {
      carrinho.splice(index, 1);
      localStorage.setItem('carrinho', JSON.stringify(carrinho));
      carregarCarrinho();
      enviarMensagemAjax("Produto removido do carrinho.", "sucesso");
    }
  }
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
// Variável para armazenar o índice do produto a ser removido
let produtoIndexParaRemover = null;

// Função para abrir o modal de remoção
function abrirModalRemover(index) {
    produtoIndexParaRemover = index;
    document.getElementById("confirmation-remove-modal").classList.add("active");
}

// Função para fechar o modal de remoção
function fecharModalRemover() {
    document.getElementById("confirmation-remove-modal").classList.remove("active");
    produtoIndexParaRemover = null;
}

// Função para remover o produto após confirmação
function confirmarRemocao() {
    if (produtoIndexParaRemover !== null) {
        let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
        
        if (produtoIndexParaRemover >= 0 && produtoIndexParaRemover < carrinho.length) {
            carrinho.splice(produtoIndexParaRemover, 1);
            localStorage.setItem('carrinho', JSON.stringify(carrinho));
            carregarCarrinho();
            enviarMensagemAjax("Produto removido do carrinho.", "sucesso");
        }
    }
    fecharModalRemover();
}

// Adicione os event listeners para os botões do modal
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('confirmar-remocao').addEventListener('click', confirmarRemocao);
    document.getElementById('cancelar-remocao').addEventListener('click', fecharModalRemover);
    
    // Fechar o modal ao clicar fora do conteúdo
    document.getElementById('confirmation-remove-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            fecharModalRemover();
        }
    });
});
