document.addEventListener("DOMContentLoaded", () => {
    listarProdutos();
    carregarFornecedores(); 

    document.getElementById("search-product").addEventListener("input", listarProdutos);
    document.getElementById("filter-gender").addEventListener("change", listarProdutos);
    document.getElementById("filter-type").addEventListener("change", listarProdutos);

    document.getElementById("product-form").addEventListener("submit", cadastrarProduto);
});

function carregarFornecedores() {
    fetch('../PHP/controle_produtos.php?action=listar_fornecedores')
        .then(res => res.json())
        .then(fornecedores => {
            const select = document.getElementById("product-supplier");
            select.innerHTML = '<option value="">Selecione um fornecedor</option>';
            
            fornecedores.forEach(fornecedor => {
                const option = document.createElement("option");
                option.value = fornecedor.codigo_fornecedor;
                option.textContent = fornecedor.nome;
                select.appendChild(option);
            });
        })
        .catch(err => {
            console.error("Erro ao carregar fornecedores:", err);
        });
}

function listarProdutos() {
    const nome = document.getElementById("search-product").value;
    const genero = document.getElementById("filter-gender").value;
    const tipo = document.getElementById("filter-type").value;

    fetch(`../PHP/controle_produtos.php?action=listar&nome=${nome}&genero=${genero}&tipo=${tipo}`)
        .then(res => res.json())
        .then(produtos => {
            const tabela = document.getElementById("product-table-body");
            tabela.innerHTML = "";

            if (produtos.length === 0) {
                tabela.innerHTML = "<tr><td colspan='10'>Nenhum produto encontrado.</td></tr>";
                return;
            }

            produtos.forEach(prod => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${prod.codigo_produto}</td>
                    <td>${prod.nome}</td>
                    <td>${prod.tipo}</td>
                    <td>${prod.genero}</td>
                    <td>${prod.quant_estoque}</td>
                    <td>R$ ${parseFloat(prod.preco).toFixed(2)}</td>
                    <td>${prod.imagem ? `<img src="data:image/jpeg;base64,${prod.imagem}" alt="${prod.nome}" width="50">` : 'Sem imagem'}</td>
                    <td>${prod.tamanho}</td>
                    <td>${prod.cor}</td>
                    <td>${prod.fornecedor}</td>
                    <td>
                        <button class="edit-button" onclick="abrirModalEditar(${prod.codigo_produto})">Editar</button>
                        <button class="delete-button" onclick="abrirModalDeletar(${prod.codigo_produto})">Deletar</button>
                    </td>
                `;
                tabela.appendChild(row);
            });
        })
        .catch(err => {
            console.error("Erro ao listar produtos:", err);
        });
}

//function abrirModalEditar(codigo_produto) {
//    fetch(`../PHP/controle_produtos.php?action=buscar&codigo_produto=${codigo_produto}`)
//        .then(res => res.json())
//        .then(produto => {
//            // Preencher os dados do produto no formulário
//            document.getElementById("codigo-produto").value = produto.codigo_produto;
//            document.getElementById("product-name").value = produto.nome;
//            document.getElementById("product-type").value = produto.tipo;
//            document.getElementById("product-gender").value = produto.genero;
//            document.getElementById("product-stock").value = produto.quant_estoque;
//            document.getElementById("product-price").value = produto.preco;
//            document.getElementById("product-size").value = produto.tamanho;
//            document.getElementById("product-color").value = produto.cor;
//            document.getElementById("product-supplier").value = produto.fk_fornecedor;
//            document.getElementById("product-description").value = produto.descricao; // Novo campo
//
//            // Alterar título e botão do modal
//            document.getElementById("modal-title").innerText = "Editar Produto";
//            document.getElementById("product-form").setAttribute("data-action", "editar");
//            document.querySelector("#product-form button[type='submit']").textContent = "Atualizar";
//
//            openProductModal(); // Abre o modal
//        })
//        .catch(err => {
//            console.error("Erro ao buscar produto:", err);
//            enviarMensagemAjax("Erro ao carregar dados do produto", "erro");
//        });
//}


function cadastrarProduto(event) {
    event.preventDefault();

    // Validação do preço
    const preco = parseFloat(document.getElementById("product-price").value);
    if (isNaN(preco) || preco <= 0) {
        enviarMensagemAjax("Por favor, insira um preço válido maior que zero", "erro");
        return false;
    }

    const formData = new FormData(document.getElementById("product-form"));
    const action = document.getElementById("product-form").getAttribute("data-action") || "cadastrar";
    
    // Adicione o parâmetro action ao FormData
    formData.append("action", action);

    fetch("../PHP/controle_produtos.php", {
        method: "POST",
        body: formData,
        // Não definir Content-Type, o navegador vai definir automaticamente com o boundary correto
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(async res => {
        const text = await res.text();
        try {
            return JSON.parse(text);
        } catch (e) {
            throw new Error(text);
        }
    })
    .then(data => {
        if (data.sucesso) {
            enviarMensagemAjax(data.sucesso, "sucesso");
            listarProdutos();
            closeProductModal();
        } else {
            enviarMensagemAjax(data.erro || "Erro desconhecido ao processar o produto", "erro");
        }
    })
    .catch(err => {
        console.error("Erro ao processar produto:", err);
        enviarMensagemAjax("Erro ao processar a requisição. Verifique o console para detalhes.", "erro");
    });
}

function abrirModalEditar(codigo_produto) {
    fetch(`../PHP/controle_produtos.php?action=buscar&codigo_produto=${codigo_produto}`)
        .then(res => {
            if (!res.ok) throw new Error("Erro ao buscar produto");
            return res.json();
        })
        .then(produto => {
            // Preencher o formulário
            document.getElementById("codigo-produto").value = produto.codigo_produto;
            document.getElementById("product-name").value = produto.nome;
            document.getElementById("product-type").value = produto.tipo;
            document.getElementById("product-gender").value = produto.genero;
            document.getElementById("product-stock").value = produto.quant_estoque;
            document.getElementById("product-price").value = produto.preco;
            document.getElementById("product-size").value = produto.tamanho; // Corrigido aqui
            document.getElementById("product-color").value = produto.cor;
            document.getElementById("product-supplier").value = produto.fk_fornecedor;
            document.getElementById("product-description").value = produto.descricao;

            // Mostrar prévia da imagem existente se houver
            const imagePreview = document.getElementById("image-preview-container");
            imagePreview.innerHTML = produto.imagem 
                ? `<img src="data:image/jpeg;base64,${produto.imagem}" alt="${produto.nome}" width="100">`
                : "<p>Sem imagem</p>";

            // Configurar modal para edição
            document.getElementById("modal-title").innerText = "Editar Produto";
            document.getElementById("product-form").setAttribute("data-action", "editar");
            document.querySelector("#product-form button[type='submit']").textContent = "Atualizar";

            openProductModal();
        })
        .catch(err => {
            console.error("Erro ao buscar produto:", err);
            enviarMensagemAjax("Erro ao carregar dados do produto", "erro");
        });
}
// Função para abrir modal de edição
//function abrirModalEditar(codigo_produto) {
//  fetch(`../PHP/controle_produtos.php?action=buscar&codigo_produto=${codigo_produto}`)
//    .then(res => {
//      if (!res.ok) throw new Error("Erro ao buscar produto");
//      return res.json();
//    })
//    .then(produto => {
//      const sizeSelect = document.getElementById("product-size");
//      sizeSelect.value = produto.tamanho;
//      // Preencher o formulário
//      document.getElementById("codigo-produto").value = produto.codigo_produto;
//      document.getElementById("product-name").value = produto.nome;
//      document.getElementById("product-type").value = produto.tipo;
//      document.getElementById("product-gender").value = produto.genero;
//      document.getElementById("product-stock").value = produto.quant_estoque;
//      document.getElementById("product-price").value = produto.preco;
//      document.getElementById("product-size").value = sizeSelect;
//      document.getElementById("product-color").value = produto.cor;
//      document.getElementById("product-supplier").value = produto.fk_fornecedor;
//      document.getElementById("product-description").value = produto.descricao;
//
//      // Mostrar prévia da imagem existente se houver
//      const imagePreview = document.getElementById("image-preview-container");
//      imagePreview.innerHTML = produto.imagem 
//        ? `<img src="data:image/jpeg;base64,${produto.imagem}" alt="${produto.nome}" width="100">`
//        : "<p>Sem imagem</p>";
//
//      // Configurar modal para edição
//      document.getElementById("modal-title").innerText = "Editar Produto";
//      document.getElementById("product-form").setAttribute("data-action", "editar");
//      document.querySelector("#product-form button[type='submit']").textContent = "Atualizar";
//
//
//      openProductModal();
//    })
//    .catch(err => {
//      console.error("Erro ao buscar produto:", err);
//      enviarMensagemAjax("Erro ao carregar dados do produto", "erro");
//    });
//}

function abrirModalDeletar(codigo_produto) {
    const confirmationModal = document.getElementById("confirmation-modal");
    confirmationModal.style.display = "flex";
    confirmationModal.setAttribute("data-codigo", codigo_produto);
    confirmationModal.setAttribute("data-action", "deletar");
}

function confirmAction(confirmado) {
    const confirmationModal = document.getElementById("confirmation-modal");
    const codigo_produto = confirmationModal.getAttribute("data-codigo");
    const action = confirmationModal.getAttribute("data-action");

    if (confirmado && action === "deletar") {
        const formData = new FormData();
        formData.append("codigo_produto", codigo_produto);

        fetch(`../PHP/controle_produtos.php?action=${action}`, {
            method: "POST",
            body: formData
        })
            .then(res => res.json())
            .then(data => {
                if (data.sucesso) {
                enviarMensagemAjax(data.sucesso, "sucesso");
                    listarProdutos();
                } else {
                enviarMensagemAjax(data.erro, "erro");
                }
                confirmationModal.style.display = "none";
            })
            .catch(err => {
                console.error("Erro ao deletar produto:", err);
                confirmationModal.style.display = "none";
            });
    } else {
        confirmationModal.style.display = "none";
    }
}

// Funções do modal
function openProductModal() {
    document.getElementById("product-modal").style.display = "flex";
}

function closeProductModal() {
  document.getElementById("product-modal").style.display = "none";
  document.getElementById("product-form").reset();
  document.getElementById("modal-title").innerText = "Cadastrar Produto";
  document.getElementById("product-form").removeAttribute("data-action");
  document.querySelector("#product-form button[type='submit']").textContent = "Salvar";
  document.getElementById("image-preview-container").innerHTML = "";
  document.getElementById("codigo-produto").value = "";
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
