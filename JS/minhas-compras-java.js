let pedidos = []; // Array para armazenar todos os pedidos carregados

async function carregarPedidos() {
    const salesList = document.getElementById('sales-list');
    const noOrdersMessage = document.getElementById('no-orders-message');

    try {
        const response = await fetch('../PHP/minhas_compras.php', {
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Erro ao buscar pedidos');
        }

        const textResponse = await response.text();

        try {
            pedidos = JSON.parse(textResponse); 
            if (pedidos.length === 0) {
                noOrdersMessage.style.display = 'block';
                salesList.innerHTML = ''; // Garante que a lista está vazia
                return;
            }

            // Garante que a mensagem de "nenhum pedido" esteja escondida se houver pedidos
            noOrdersMessage.style.display = 'none';
            exibirPedidos(pedidos);

        } catch (error) {
            console.error('Erro ao fazer o JSON.parse():', error);
            noOrdersMessage.textContent = 'Erro ao carregar pedidos.';
            noOrdersMessage.style.display = 'block';
        }

    } catch (error) {
        console.error('Erro:', error);
        noOrdersMessage.textContent = 'Erro ao carregar pedidos.';
        noOrdersMessage.style.display = 'block';
    }
}

function exibirPedidos(pedidosFiltrados) {
    const salesList = document.getElementById('sales-list');
    salesList.innerHTML = ''; 

    pedidosFiltrados.forEach(pedido => {
        // Certifique-se de que `pedido.produtos` é um JSON string e tenta parsear
        let produtos = [];
        try {
            produtos = JSON.parse(pedido.produtos);
            if (!Array.isArray(produtos)) { // Garante que é um array, mesmo que vazio
                produtos = [];
            }
        } catch (e) {
            console.error("Erro ao parsear JSON de produtos para o pedido ID:", pedido.id, e);
            produtos = []; // Reseta para array vazio em caso de erro de parse
        }

        const saleItem = document.createElement('div');
        saleItem.className = 'sale-item';
        saleItem.innerHTML = `
            <div class="sale-header">
                <div class="sale-info">
                    <div class="sale-info-item">
                        <span class="sale-info-label">Código do Pedido</span>
                        <span class="sale-info-value">#${pedido.id}</span>
                    </div>
                    <div class="sale-info-item">
                        <span class="sale-info-label">Total</span>
                        <span class="sale-info-value">R$ ${formatarValor(pedido.valor_total || calcularTotalAntigo(produtos))}</span>
                    </div>
                    <div class="sale-info-item">
                        <span class="sale-info-label">Forma de Pagamento</span>
                        <span class="sale-info-value">${pedido.forma_pagamento || 'Aguardando contato'}</span>
                    </div>
                    <div class="sale-info-item">
                        <span class="sale-info-label">Contato da Loja</span>
                        <span class="sale-info-value">(11) 98765-4321</span>
                    </div>
                </div>
            </div>

            <div class="sale-products">
                <div class="products-container">
                    ${produtos.length > 0 ? produtos.map(produto => `
                        <div class="product-item">
                            <img src="data:image/jpeg;base64,${produto.imagem || ''}" alt="${produto.nome}" class="product-image">
                            <div class="product-info">
                                <span>Código: ${produto.codigo_produto || 'N/A'}</span>
                                <span>Nome: ${produto.nome || 'N/A'}</span>
                                <span>Quantidade: ${produto.quantidade || 1}</span> <span>Preço Unitário: R$ ${formatarValor(produto.preco || 0)}</span> <span>Cores: ${produto.cor || 'N/A'}</span>
                                <span>Tamanho: ${produto.tamanho || 'N/A'}</span>
                                </div>
                        </div>
                    `).join('') : '<p>Nenhum produto detalhado encontrado para este pedido.</p>'}
                </div>
            </div>

            <div class="sale-status">
                <div>
                    <span class="sale-info-label">Data do Pedido</span>
                    <span class="sale-info-value">${formatarDataHora(pedido.data_pedido)}</span>
                </div>
                <div>
                    <span class="sale-info-label">Status</span>
                    <select class="status-select" disabled>
                        <option value="A pagar" ${pedido.status === 'A pagar' ? 'selected' : ''}>A pagar</option>
                        <option value="Pago" ${pedido.status === 'Pago' ? 'selected' : ''}>Pago</option>
                        <option value="Enviado" ${pedido.status === 'Enviado' ? 'selected' : ''}>Produto Enviado</option>
                        <option value="Aguardando" ${pedido.status === 'Aguardando' ? 'selected' : ''}>Aguardando contato</option>
                        <option value="Cancelado" ${pedido.status === 'Cancelado' ? 'selected' : ''}>Cancelado</option>
                    </select>
                </div>
            </div>
        `;

        salesList.appendChild(saleItem);
    });
}

function filterByDate() {
    const startDate = document.getElementById("start-date").value;
    const endDate = document.getElementById("end-date").value;

    if (!startDate || !endDate) {
        enviarMensagemAjax("Por favor, selecione ambas as datas para filtrar.", "erro");
        return;
    }

    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T23:59:59');

    const pedidosFiltrados = pedidos.filter(pedido => {
        const pedidoData = new Date(pedido.data_pedido);
        return pedidoData >= start && pedidoData <= end;
    });

    const noOrdersMessage = document.getElementById('no-orders-message');

    if (pedidosFiltrados.length === 0) {
        noOrdersMessage.style.display = 'block';
        document.getElementById('sales-list').innerHTML = '';
        enviarMensagemAjax(`Nenhum pedido encontrado no período de ${formatDate(startDate)} a ${formatDate(endDate)}.`, "erro");
    } else {
        noOrdersMessage.style.display = 'none';
        exibirPedidos(pedidosFiltrados);
        enviarMensagemAjax(`Filtro aplicado: De ${formatDate(startDate)} até ${formatDate(endDate)}`, 'sucesso');
    }
}

function resetFilter() {
    document.getElementById("start-date").value = "";
    document.getElementById("end-date").value = "";
    document.getElementById('no-orders-message').style.display = 'none';
    exibirPedidos(pedidos); 
    enviarMensagemAjax("Filtro resetado.", "sucesso");
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

// Funções para calcular e formatar valores

// Função para formatar qualquer valor monetário
function formatarValor(valor) {
    return parseFloat(valor).toFixed(2).replace('.', ',');
}

// Função para calcular o total de produtos se o valor_total não estiver disponível no pedido (compatibilidade)
function calcularTotalAntigo(produtos) {
    let total = 0;
    // Verifica se produtos é um array válido e não está vazio
    if (Array.isArray(produtos) && produtos.length > 0) {
        produtos.forEach(p => {
            // Se `quantidade` for um campo no JSON do produto, use-o
            const quantidade = p.quantidade ? parseInt(p.quantidade) : 1; 
            total += (parseFloat(p.preco) || 0) * quantidade; // Garante que preco é um número
        });
    }
    return total.toFixed(2).replace('.', ',');
}

function formatarDataHora(dataHora) {
    const data = new Date(dataHora);
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    const horas = String(data.getHours()).padStart(2, '0');
    const minutos = String(data.getMinutes()).padStart(2, '0');
    return `${dia}/${mes}/${ano} ${horas}:${minutos}`;
}

function enviarMensagemAjax(mensagem, tipo) {
    const mensagemContainer = document.getElementById('mensagem');
    mensagemContainer.innerHTML = '';
    const msgDiv = document.createElement('div');
    msgDiv.className = `mensagem ${tipo}`;
    msgDiv.textContent = mensagem;
    mensagemContainer.appendChild(msgDiv);
    setTimeout(() => {
        msgDiv.remove();
    }, 1500); // Ajustei o tempo para 1.5 segundos para ser menos intrusivo
}
