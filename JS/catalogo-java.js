document.addEventListener("DOMContentLoaded", () => {
  carregarProdutos();

  ["filtro-nome", "filtro-genero", "filtro-tipo"].forEach(id => {
    const el = document.getElementById(id);
    const event = id === "filtro-nome" ? "input" : "change";
    el.addEventListener(event, carregarProdutos);
  });
});


function carregarProdutos() {
  const nome = document.getElementById("filtro-nome").value;
  const genero = document.getElementById("filtro-genero").value;
  const tipo = document.getElementById("filtro-tipo").value;

  const params = new URLSearchParams();
  if (nome) params.append("nome", nome);
  if (genero !== "Gênero") params.append("genero", genero);
  if (tipo !== "Tipo") params.append("tipo", tipo);

  fetch(`../PHP/catalogo.php?${params.toString()}`)
    .then(res => {
      if (res.status === 401) {
        // Alterado para usar enviarMensagemAjax para consistência
        enviarMensagemAjax("Sessão expirada. Faça login novamente.", "erro"); 
        setTimeout(() => {
          window.location.href = "../index.html";
        }, 1000); 
        return;
      }
      return res.json();
    })
    .then(produtos => {
      const grid = document.getElementById("product-grid");
      grid.innerHTML = "";

      if (!produtos || produtos.length === 0) {
        grid.innerHTML = "<p>Nenhum produto disponível.</p>";
        return;
      }

produtos.forEach(prod => {
  const card = document.createElement("div");
  card.className = "product-card";

  const imagemCompleta = `data:image/jpeg;base64,${prod.imagem}`;
  const isEsgotado = prod.quant_estoque <= 0;
  const buttonClass = isEsgotado ? 'buy-button disabled' : 'buy-button';
  const buttonText = isEsgotado ? 'Esgotado' : 'Comprar';
  const buttonDisabled = isEsgotado ? 'disabled' : '';

// Adicionado data-id aqui para capturar o ID do produto para o frontend
// O seu console.log anterior mostrou { id: 1, ... }, então `prod.id` é o correto para usar aqui.
// O `catalogo.php` que você me enviou tem `codigo_produto AS id`. Isso significa que o PHP está enviando `id`.
const produtoId = prod.id; 

if (typeof produtoId === 'undefined' || produtoId === null || isNaN(parseInt(produtoId))) {
    console.error("Produto sem ID válido recebido do backend:", prod);
    return; // Pula este produto se o ID for inválido
}

card.innerHTML = `
  <img src="data:image/jpeg;base64,${prod.imagem}" alt="${prod.nome}">
  <h3>${prod.nome}</h3>
  <p>${prod.descricao}</p>
  <p class="price">R$ ${parseFloat(prod.preco).toFixed(2)}</p>
  <p class="availability ${prod.quant_estoque > 0 ? 'available' : 'unavailable'}">
    ${prod.quant_estoque > 0 ? `Disponível` : 'Esgotado'}
  </p>
  <button class="${buttonClass}"
    data-id="${prod.id}"
    data-nome="${prod.nome}"
    data-tipo="${prod.tipo}"
    data-genero="${prod.genero}"
    data-imagem="${prod.imagem}"
    data-descricao="${prod.descricao}"
    data-preco="${prod.preco}"
    data-estoque="${prod.quant_estoque}"     onclick="adicionarCarrinhoFromButton(this)"
    ${buttonDisabled}
  >
    ${buttonText}
  </button>
`;

  grid.appendChild(card);
});

    })
    .catch(error => {
      console.error("Erro ao carregar produtos:", error);
      enviarMensagemAjax("Erro ao carregar produtos. Tente novamente.", "erro");
    });
}

function adicionarCarrinhoFromButton(button) {
    const estoqueDisponivel = parseInt(button.getAttribute('data-estoque'));
    const produtoId = parseInt(button.getAttribute('data-id')); // Capture o ID do produto

    if (estoqueDisponivel <= 0) {
        enviarMensagemAjax("Este produto está esgotado e não pode ser adicionado ao carrinho.", "erro");
        return;
    }

    if (isNaN(produtoId) || produtoId <= 0) {
        enviarMensagemAjax("Erro: ID do produto inválido.", "erro");
        console.error("Tentativa de adicionar produto com ID inválido:", button.outerHTML);
        return;
    }

    const imgElement = button.closest('.product-card').querySelector('img');
    const imagemSrc = imgElement ? imgElement.src : '';
    
    const produto = {
        id: produtoId, // Usar 'id' para o objeto no LocalStorage
        nome: button.getAttribute('data-nome'),
        tipo: button.getAttribute('data-tipo'),
        genero: button.getAttribute('data-genero'),
        imagem: imagemSrc.includes('base64,') ? imagemSrc.split('base64,')[1] : '',
        descricao: button.getAttribute('data-descricao'),
        preco: parseFloat(button.getAttribute('data-preco')),
        // Não definir a quantidade aqui, ela será verificada na próxima função
        // quantidade: 1
    };

    if (!produto.imagem) {
        console.error('Imagem não encontrada para o produto:', produto.nome);
        produto.imagem = '';
    }

    adicionarCarrinho(produto, estoqueDisponivel); // Passa o estoque disponível
}


function adicionarCarrinho(produto, estoqueDisponivel) {
    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    
    const produtoExistenteIndex = carrinho.findIndex(item => item.id === produto.id);

    if (produtoExistenteIndex > -1) {
        // Produto já está no carrinho
        const quantidadeAtualNoCarrinho = carrinho[produtoExistenteIndex].quantidade;
        
        if (quantidadeAtualNoCarrinho < estoqueDisponivel) {
            // Incrementa a quantidade se ainda houver estoque
            carrinho[produtoExistenteIndex].quantidade += 1;
            localStorage.setItem('carrinho', JSON.stringify(carrinho));
            //enviarMensagemAjax(`Mais uma unidade de '${produto.nome}' adicionada ao carrinho! Total no carrinho: ${carrinho[produtoExistenteIndex].quantidade}`, "sucesso");
            enviarMensagemAjax(`${produto.nome} adicionado ao carrinho!`, "sucesso");
        } else {
            // Não há mais estoque para adicionar
            enviarMensagemAjax(`Não foi possível adicionar mais unidades de ${produto.nome}. O estoque está esgotado!`, "erro");
        }
    } else {
        // Produto não está no carrinho, adiciona a primeira unidade
        if (estoqueDisponivel > 0) {
            produto.quantidade = 1; // Define a quantidade inicial
            carrinho.push(produto);
            localStorage.setItem('carrinho', JSON.stringify(carrinho));
            enviarMensagemAjax(`${produto.nome} adicionado ao carrinho!`, "sucesso");
        } else {
            enviarMensagemAjax(`Este produto ('${produto.nome}') está esgotado e não pode ser adicionado ao carrinho.`, "erro");
        }
    }
}

// Função AJAX para enviar a mensagem
function enviarMensagemAjax(mensagem, tipo) {
    const mensagemContainer = document.getElementById('mensagem');

    // Limpa mensagens anteriores imediatamente para evitar sobreposição
    mensagemContainer.innerHTML = ''; 

    const msgDiv = document.createElement('div');
    msgDiv.className = `mensagem ${tipo}`;
    msgDiv.textContent = mensagem;
    mensagemContainer.appendChild(msgDiv);

    // Exibe a mensagem por 3 segundos e depois a oculta
    setTimeout(() => {
        msgDiv.remove();
    }, 1500); // Tempo ajustado para 1.5 segundos para a mensagem sumir mais rápido
}
