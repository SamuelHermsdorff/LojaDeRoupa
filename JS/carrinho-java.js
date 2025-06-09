function calcularDataEntrega() {
    const hoje = new Date();
    const entrega = new Date(hoje);
    entrega.setDate(hoje.getDate() + 15);

    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return entrega.toLocaleDateString('pt-BR', options);
}

function calcularPrecoTotal() {
    // Esta função será chamada automaticamente pelo carregarCarrinho, então a removemos daqui para evitar duplicação.
}

async function confirmarPagamento() {
    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    
    if (carrinho.length === 0) {
        enviarMensagemAjax("Carrinho vazio. Adicione produtos para continuar.", "erro");
        return;
    }

    let isValidQuantity = true;
    // Percorrer o carrinho para garantir que as quantidades são válidas e não excedem o estoque
    for (const item of carrinho) {
        if (!item.quantidade || item.quantidade < 1) {
            enviarMensagemAjax(`A quantidade para o produto '${item.nome}' é inválida.`, "erro");
            isValidQuantity = false;
            break; // Sai do loop ao encontrar um erro
        }
        // Validação adicional: se o item tem estoque_original, verificar se não excede
        if (item.estoque_original && item.quantidade > item.estoque_original) {
             enviarMensagemAjax(`A quantidade de '${item.nome}' excede o estoque disponível (${item.estoque_original}).`, "erro");
             isValidQuantity = false;
             break;
        }
    }

    if (!isValidQuantity) {
        return;
    }

    const dadosPedido = {
        carrinho: carrinho.map(item => ({
            id: item.id, 
            nome: item.nome,
            preco: item.preco,
            quantidade: item.quantidade 
        }))
    };

    try {
        const response = await fetch('../PHP/criar_pedido.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dadosPedido),
            credentials: 'include'
        });

        const responseText = await response.text();
        
        if (!response.ok) {
            let errorData = {};
            try {
                errorData = JSON.parse(responseText);
            } catch (e) {
                errorData.mensagem = responseText || `Erro HTTP: ${response.status}`;
            }
            throw new Error(errorData.mensagem || `Erro HTTP: ${response.status}`);
        }

        const data = responseText ? JSON.parse(responseText) : {};
        
        if (data.status === 'sucesso') {
            enviarMensagemAjax("Pedido realizado com sucesso!", "sucesso");
            localStorage.removeItem('carrinho');
            setTimeout(() => {
                window.location.href = "../HTML/contato_loja.php"; 
            }, 500);
        } else {
            throw new Error(data.mensagem || 'Erro desconhecido ao finalizar pedido');
        }
    } catch (error) {
        console.error('Erro detalhado:', error);
        enviarMensagemAjax(error.message || "Falha ao finalizar pedido. Tente novamente.", "erro");
    }
}


function abrirModalSalvar() {
    enviarMensagemAjax("Funcionalidade de salvar rascunho não implementada nesta versão.", "aviso");
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
    window.location.reload(); 
}

document.getElementById('confirmar-cancelar').addEventListener('click', () => {
    cancelarCarrinho();
    fecharModalCancelar(); 
});

document.getElementById('fechar-modal').addEventListener('click', () => {
    fecharModalCancelar(); 
});

function formatarPreco(valor) {
    return valor.toFixed(2).replace('.', ',');
}

function carregarCarrinho() { 
    const carrinhoItens = document.getElementById('carrinho-itens');
    const precoTotalEl = document.getElementById('preco-total');

    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

    if (!carrinhoItens || !precoTotalEl) {
        console.error('Elementos HTML do carrinho não encontrados.');
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

        produto.quantidade = parseInt(produto.quantidade) || 1; 
        if (produto.quantidade < 1) produto.quantidade = 1;

        // Limita o input de quantidade pelo estoque original do produto
        const maxQuantity = produto.estoque_original || 9999; // Assume um valor alto se não tiver estoque_original
        if (produto.quantidade > maxQuantity) {
            produto.quantidade = maxQuantity; // Ajusta a quantidade se estiver acima do max
        }


        produtoDiv.innerHTML = `
            <img src="data:image/jpeg;base64,${produto.imagem}" alt="${produto.nome}" class="produto-imagem">
            <div class="produto-info">
                <p><strong>Nome:</strong> ${produto.nome}</p>
                <p><strong>Preço Unitário:</strong> R$ ${formatarPreco(produto.preco)}</p>
                <p><strong>Quantidade:</strong> <input type="number" min="1" max="${maxQuantity}" value="${produto.quantidade}" data-index="${index}" class="quantidade-input"></p>
                <p><strong>Subtotal:</strong> R$ <span class="produto-subtotal">${formatarPreco(produto.preco * produto.quantidade)}</span></p>
                <button class="produto-remover" data-index="${index}">Remover</button>
            </div>
        `;
        carrinhoItens.appendChild(produtoDiv);

        precoTotal += produto.preco * produto.quantidade;
    });

    precoTotalEl.textContent = formatarPreco(precoTotal);

    const inputsQuantidade = document.querySelectorAll('.quantidade-input');
    inputsQuantidade.forEach(input => {
        input.addEventListener('change', (e) => {
            const index = e.target.getAttribute('data-index');
            let novaQuantidade = parseInt(e.target.value);
            const max = parseInt(e.target.max);

            if (isNaN(novaQuantidade) || novaQuantidade < 1) {
                novaQuantidade = 1;
                e.target.value = 1; 
            } else if (novaQuantidade > max) {
                novaQuantidade = max;
                e.target.value = max;
                enviarMensagemAjax(`Quantidade máxima para este produto é ${max}.`, "aviso");
            }
            
            carrinho[index].quantidade = novaQuantidade;
            localStorage.setItem('carrinho', JSON.stringify(carrinho));
            
            carregarCarrinho(); 
        });
    });

    const botoesRemover = document.querySelectorAll('.produto-remover');
    botoesRemover.forEach(botao => {
        botao.addEventListener('click', (e) => {
            const index = e.target.getAttribute('data-index');
            abrirModalRemover(index);
        });
    });
}

document.addEventListener('DOMContentLoaded', carregarCarrinho);

function enviarMensagemAjax(mensagem, tipo) {
    const mensagemContainer = document.getElementById('mensagem');
    mensagemContainer.innerHTML = ''; 
    const msgDiv = document.createElement('div');
    msgDiv.className = `mensagem ${tipo}`;
    msgDiv.textContent = mensagem;
    mensagemContainer.appendChild(msgDiv);
    setTimeout(() => {
        msgDiv.remove();
    }, 3000);
}

let produtoIndexParaRemover = null;

function abrirModalRemover(index) {
    produtoIndexParaRemover = index;
    document.getElementById("confirmation-remove-modal").classList.add("active");
}

function fecharModalRemover() {
    document.getElementById("confirmation-remove-modal").classList.remove("active");
    produtoIndexParaRemover = null;
}

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

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('confirmar-remocao').addEventListener('click', confirmarRemocao);
    document.getElementById('cancelar-remocao').addEventListener('click', fecharModalRemover);
    
    document.getElementById('confirmation-remove-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            fecharModalRemover();
        }
    });
});
