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
        alert("Sessão expirada. Faça login novamente.");
        window.location.href = "../index.html";
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

card.innerHTML = `
  <img src="data:image/jpeg;base64,${prod.imagem}" alt="${prod.nome}">
  <h3>${prod.nome}</h3>
  <p>${prod.descricao}</p>
  <p class="price">R$ ${parseFloat(prod.preco).toFixed(2)}</p>
  <p class="availability ${prod.quant_estoque > 0 ? 'available' : 'unavailable'}">
    ${prod.quant_estoque > 0 ? 'Disponível' : 'Esgotado'}
  </p>
  <button class="buy-button"
    data-id="${prod.id}"
    data-nome="${prod.nome}"
    data-tipo="${prod.tipo}"
    data-genero="${prod.genero}"
    data-imagem="${prod.imagem}"
    data-descricao="${prod.descricao}"
    data-preco="${prod.preco}"
    onclick="adicionarCarrinhoFromButton(this)"
  >
    Comprar
  </button>
`;

  grid.appendChild(card);
});

    })
    .catch(error => {
      console.error("Erro ao carregar produtos:", error);
    });
}


function adicionarCarrinhoFromButton(button) {
    const imgElement = button.closest('.product-card').querySelector('img');
    const imagemSrc = imgElement ? imgElement.src : '';
    
    const produto = {
        id: parseInt(button.getAttribute('data-id')),
        nome: button.getAttribute('data-nome'),
        tipo: button.getAttribute('data-tipo'),
        genero: button.getAttribute('data-genero'),
        imagem: imagemSrc.includes('base64,') ? imagemSrc.split('base64,')[1] : '',
        descricao: button.getAttribute('data-descricao'),
        preco: parseFloat(button.getAttribute('data-preco')),
        quantidade: 1
    };

    // Verificação para evitar undefined
    if (!produto.imagem) {
        console.error('Imagem não encontrada para o produto:', produto.nome);
        produto.imagem = ''; // Valor vazio como fallback
    }

    adicionarCarrinho(produto);
}

function adicionarCarrinho(produto) {
    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    carrinho.push(produto);
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    enviarMensagemAjax("Produto adicionado ao carrinho!", "sucesso");
}

// Função AJAX para enviar a mensagem
function enviarMensagemAjax(mensagem, tipo) {
    const mensagemContainer = document.getElementById('mensagem');

    // Verifica o tipo da mensagem (sucesso ou erro)
    if (tipo === "sucesso") {
        mensagemContainer.innerHTML = `<div class="mensagem sucesso">${mensagem}</div>`;
    } else {
        mensagemContainer.innerHTML = `<div class="mensagem erro">${mensagem}</div>`;
    }

    // Exibe a mensagem por 3 segundos e depois a oculta
    setTimeout(() => {
        mensagemContainer.innerHTML = '';
    }, 800);
}
