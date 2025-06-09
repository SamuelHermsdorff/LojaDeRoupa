let todosPedidos = []; // Array para armazenar todos os pedidos carregados para filtragem

//document.addEventListener("DOMContentLoaded", () => {
//    carregarPedidos();
//    // Adiciona event listeners para os botões de filtro e limpar
//    document.getElementById("start-date").addEventListener("change", filterByDate);
//    document.getElementById("end-date").addEventListener("change", filterByDate);
//    document.querySelector(".filter-button[onclick='filterByDate()']").addEventListener("click", filterByDate);
//    document.querySelector(".filter-button[onclick='resetFilter()']").addEventListener("click", resetFilter);
//});

async function carregarPedidos() {
    const pedidosList = document.getElementById('pedidos-list');
    const noPedidosMessage = document.getElementById('no-pedidos-message');

    try {
        const response = await fetch('../PHP/listar_pedidos.php', {
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) {
            if (response.status === 401) {
                const errorData = await response.json();
                enviarMensagemAjax(errorData.erro || "Acesso não autorizado. Faça login com uma conta de funcionário/administrador.", "erro");
                setTimeout(() => { window.location.href = "../index.html"; }, 2000);
            } else {
                throw new Error('Erro ao buscar pedidos: ' + response.statusText);
            }
        }

        const textResponse = await response.text();

        try {
            todosPedidos = JSON.parse(textResponse); 
            
            if (todosPedidos.length === 0) {
                noPedidosMessage.style.display = 'block';
                pedidosList.innerHTML = ''; 
                return;
            }

            noPedidosMessage.style.display = 'none';
            exibirPedidos(todosPedidos); // Exibe todos os pedidos inicialmente

        } catch (error) {
            console.error('Erro ao fazer o JSON.parse() ou ao processar dados:', error);
            noPedidosMessage.textContent = 'Erro ao carregar pedidos. Verifique o console para detalhes.';
            noPedidosMessage.style.display = 'block';
        }

    } catch (error) {
        console.error('Erro na requisição Fetch:', error);
        noPedidosMessage.textContent = 'Erro de rede ou servidor ao carregar pedidos.';
        noPedidosMessage.style.display = 'block';
    }
}

function exibirPedidos(pedidosParaExibir) {
    const pedidosList = document.getElementById('pedidos-list');
    pedidosList.innerHTML = ''; 

    if (pedidosParaExibir.length === 0) {
        document.getElementById('no-pedidos-message').style.display = 'block';
        return;
    } else {
        document.getElementById('no-pedidos-message').style.display = 'none';
    }

    pedidosParaExibir.forEach(pedido => {
        const produtos = pedido.produtos || [];

        const pedidoItem = document.createElement('div');
        pedidoItem.className = 'pedido-item';
        pedidoItem.innerHTML = `
            <div class="pedido-header">
                <div class="pedido-info">
                    <div class="pedido-info-item">
                        <span class="pedido-info-label">Código do Pedido</span>
                        <span class="pedido-info-value">#${pedido.id}</span>
                    </div>
                    <div class="pedido-info-item">
                        <span class="pedido-info-label">Total</span>
                        <span class="pedido-info-value">R$ ${formatarValor(pedido.valor_total)}</span>
                    </div>
                    <div class="pedido-info-item">
                        <span class="pedido-info-label">Forma de Pagamento</span>
                        <span class="pedido-info-value">${pedido.forma_pagamento || 'Não especificado'}</span>
                    </div>
                    <div class="pedido-info-item">
                        <span class="pedido-info-label">Telefone do Cliente</span>
                        <span class="pedido-info-value">${pedido.telefone_cliente || 'N/A'}</span>
                    </div>
                    <div class="pedido-info-item">
                        <span class="pedido-info-label">Nome do Cliente</span>
                        <span class="pedido-info-value">${pedido.nome_cliente || 'N/A'}</span>
                    </div>
                    <div class="pedido-info-item">
                        <span class="pedido-info-label">CPF do Cliente</span>
                        <span class="pedido-info-value">${pedido.cpf_cliente || 'N/A'}</span>
                    </div>
                </div>
            </div>

            <div class="pedido-products">
                <div class="products-container">
                    ${produtos.length > 0 ? produtos.map(produto => `
                        <div class="product-item">
                            <img src="data:image/jpeg;base64,${produto.imagem || ''}" alt="${produto.nome}" class="product-image">
                            <div class="product-info">
                                <span>Código: ${produto.codigo_produto || 'N/A'}</span>
                                <span>Nome: ${produto.nome || 'N/A'}</span>
                                <span>Quantidade: ${produto.quantidade || 1}</span>
                                <span>Preço Unitário: R$ ${formatarValor(produto.preco || 0)}</span>
                                <span>Cores: ${produto.cor || 'N/A'}</span>
                                <span>Tamanho: ${produto.tamanho || 'N/A'}</span>
                            </div>
                        </div>
                    `).join('') : '<p>Nenhum produto detalhado encontrado para este pedido.</p>'}
                </div>
            </div>

            <div class="pedido-status">
                <div>
                    <span class="pedido-info-label">Data do Pedido</span>
                    <span class="pedido-info-value">${formatarDataHora(pedido.data_pedido)}</span>
                </div>
                <div>
                    <span class="pedido-info-label">Status</span>
                    <select class="status-select" onchange="alterarStatus(${pedido.id}, this.value)">
                        <option value="A pagar" ${pedido.status === 'A pagar' ? 'selected' : ''}>A pagar</option>
                        <option value="Pago" ${pedido.status === 'Pago' ? 'selected' : ''}>Pago</option>
                        <option value="Enviado" ${pedido.status === 'Enviado' ? 'selected' : ''}>Produto Enviado</option>
                        <option value="Aguardando" ${pedido.status === 'Aguardando' ? 'selected' : ''}>Aguardando contato</option>
                        <option value="Cancelado" ${pedido.status === 'Cancelado' ? 'selected' : ''}>Cancelado</option>
                    </select>
                </div>
            </div>
        `;
        pedidosList.appendChild(pedidoItem);
    });
}

// Funções de formatação e utilitárias (copiadas de minhas-compras-java.js)

function formatarValor(valor) {
    return parseFloat(valor).toFixed(2).replace('.', ',');
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

async function alterarStatus(pedidoId, novoStatus) {
    try {
        const response = await fetch('../PHP/alterar_status_pedido.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: pedidoId,
                status: novoStatus,
            }),
            credentials: 'include',
        });

        const textResponse = await response.text();
        const data = JSON.parse(textResponse);
        
        if (data.status === 'sucesso') {
            enviarMensagemAjax('Status do pedido atualizado com sucesso!', "sucesso");
            // Não precisa recarregar tudo, mas podemos querer atualizar o pedido específico
            // Ou apenas confiar que o status foi alterado no banco
        } else {
            enviarMensagemAjax(data.mensagem || 'Falha ao atualizar o status do pedido.', "erro");
        }
    } catch (error) {
        console.error('Erro ao alterar status:', error);
        enviarMensagemAjax('Erro ao alterar o status. Tente novamente.', "erro");
    }
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
    }, 1500);
}

// Funções de filtro de data para Controle de Pedidos
function filterByDate() {
    const startDateInput = document.getElementById("start-date");
    const endDateInput = document.getElementById("end-date");
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;

    if (!startDate || !endDate) {
        enviarMensagemAjax("Por favor, selecione ambas as datas para filtrar.", "erro");
        return;
    }

    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T23:59:59');

    const pedidosFiltrados = todosPedidos.filter(pedido => {
        const pedidoData = new Date(pedido.data_pedido);
        return pedidoData >= start && pedidoData <= end;
    });

    const noPedidosMessage = document.getElementById('no-pedidos-message');

    if (pedidosFiltrados.length === 0) {
        noPedidosMessage.style.display = 'block';
        document.getElementById('pedidos-list').innerHTML = '';
        enviarMensagemAjax(`Nenhum pedido encontrado no período de ${formatDateDisplay(startDate)} a ${formatDateDisplay(endDate)}.`, 'erro');
    } else {
        noPedidosMessage.style.display = 'none';
        exibirPedidos(pedidosFiltrados);
        enviarMensagemAjax(`Filtro aplicado: De ${formatDateDisplay(startDate)} até ${formatDateDisplay(endDate)}`, 'sucesso');
    }
}

function resetFilter() {
    document.getElementById("start-date").value = "";
    document.getElementById("end-date").value = "";
    document.getElementById('no-pedidos-message').style.display = 'none';
    exibirPedidos(todosPedidos); // Exibe todos os pedidos novamente
    enviarMensagemAjax("Filtro resetado.", "sucesso");
}

function formatDateDisplay(dateString) { // Renomeado para evitar conflito
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}
