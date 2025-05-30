
let pedidos = []; // Array para armazenar todos os pedidos carregados

async function carregarPedidos() {
    const salesList = document.getElementById('sales-list');
    const noOrdersMessage = document.getElementById('no-orders-message');

    try {
        const response = await fetch('../PHP/minhas_compras.php', {
            method: 'GET',
            credentials: 'include',    // Incluindo credenciais da sessão (cookies)
        });

        // Verificando se a resposta não é ok
        if (!response.ok) {
            throw new Error('Erro ao buscar pedidos');
        }

        // Aqui, verificamos o tipo da resposta antes de tentar fazer o JSON.parse
        const textResponse = await response.text();
        //console.log(textResponse);    // Verifique o conteúdo da resposta no console

        // Agora, tentamos fazer o JSON.parse() apenas se a resposta for JSON
        try {
            pedidos = JSON.parse(textResponse); // Salva todos os pedidos na variável pedidos
            if (pedidos.length === 0) {
                noOrdersMessage.style.display = 'block';
                return;
            }

            exibirPedidos(pedidos); // Exibe todos os pedidos inicialmente

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

// Função para exibir os pedidos
function exibirPedidos(pedidosFiltrados) {
    const salesList = document.getElementById('sales-list');
    salesList.innerHTML = ''; // Limpa a lista de pedidos antes de adicionar os novos

    pedidosFiltrados.forEach(pedido => {
        const produtos = JSON.parse(pedido.produtos);

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
                        <span class="sale-info-value">R$ ${calcularTotal(produtos)}</span>
                    </div>
                    <div class="sale-info-item">
                        <span class="sale-info-label">Forma de Pagamento</span>
                        <span class="sale-info-value">PIX</span>
                    </div>
                    <div class="sale-info-item">
                        <span class="sale-info-label">Contato da Loja</span>
                        <span class="sale-info-value">(11) 98765-4321</span>
                    </div>
                </div>
            </div>

            <div class="sale-products">
                <div class="products-container">
                    ${produtos.map(produto => `
                        <div class="product-item">
                            <img src="data:image/jpeg;base64,${produto.imagem || ''}" alt="${produto.nome}" class="product-image">
                            <div class="product-info">
                                <span>Código: ${produto.codigo}</span>
                                <span>Nome: ${produto.nome}</span>
                                <span>Cores: ${produto.cor}</span>
                                <span>Preço: R$ ${parseFloat(produto.preco).toFixed(2).replace('.', ',')}</span>
                                <span>Tamanho: ${produto.tamanho}</span>
                            </div>
                        </div>
                    `).join('')}
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

    // Convertendo para Date e zerando horas
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T23:59:59'); // inclui todo o dia final

    const pedidosFiltrados = pedidos.filter(pedido => {
        const pedidoData = new Date(pedido.data_pedido);

        // console.log para debug
        //console.log(`Comparando: ${pedidoData} entre ${start} e ${end}`);

        return pedidoData >= start && pedidoData <= end;
    });

    const noOrdersMessage = document.getElementById('no-orders-message');

    if (pedidosFiltrados.length === 0) {
        noOrdersMessage.style.display = 'block';
        document.getElementById('sales-list').innerHTML = '';
    } else {
        noOrdersMessage.style.display = 'none';
        exibirPedidos(pedidosFiltrados);
    }

    //console.log(`Filtrando de ${startDate} até ${endDate}`);
    enviarMensagemAjax(`Filtro aplicado: De ${formatDate(startDate)} até ${formatDate(endDate)}`, 'sucesso');
}

function resetFilter() {
    document.getElementById("start-date").value = "";
    document.getElementById("end-date").value = "";
    document.getElementById('no-orders-message').style.display = 'none'; // Esconde a mensagem de nenhum pedido
    exibirPedidos(pedidos); // Exibe todos os pedidos novamente
    //console.log("Filtro resetado");
    enviarMensagemAjax("Filtro resetado.", "sucesso");
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

function calcularTotal(produtos) {
    let total = 0;
    produtos.forEach(p => {
        total += parseFloat(p.preco);
    });
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
