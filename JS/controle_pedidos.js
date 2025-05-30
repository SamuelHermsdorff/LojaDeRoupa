async function carregarPedidos() {
  const pedidosList = document.getElementById('pedidos-list');
  const noPedidosMessage = document.getElementById('no-pedidos-message');

  try {
    const response = await fetch('../PHP/listar_pedidos.php', {
      method: 'GET',
      credentials: 'include',  // Incluindo credenciais da sessão (cookies)
    });

    if (!response.ok) {
      throw new Error('Erro ao carregar pedidos');
    }

    const pedidos = await response.json();
    //console.log('Pedidos recebidos:', pedidos);

    if (pedidos.length === 0) {
      noPedidosMessage.style.display = 'block';
      return;
    }

    // Certifique-se de que pedidos é um array antes de usar .forEach
    if (Array.isArray(pedidos)) {
      pedidos.forEach(pedido => {
        // Verifique se 'pedido.produtos' é uma string antes de usar JSON.parse()
        const produtos = typeof pedido.produtos === 'string' ? JSON.parse(pedido.produtos) : pedido.produtos;

        const pedidoItem = document.createElement('div');
        pedidoItem.className = 'pedido-item';
        pedidoItem.innerHTML = `
          <div class="pedido-header">
            <div class="pedido-info">
              <span>Código: #${pedido.id}</span>
              <span>Data: ${formatarDataHora(pedido.data_pedido)}</span>
              <span>Status: 
                <select onchange="alterarStatus(${pedido.id}, this.value)" class="status-select">
                  <option value="A pagar" ${pedido.status === 'A pagar' ? 'selected' : ''}>A pagar</option>
                  <option value="Pago" ${pedido.status === 'Pago' ? 'selected' : ''}>Pago</option>
                  <option value="Enviado" ${pedido.status === 'Enviado' ? 'selected' : ''}>Enviado</option>
                  <option value="Aguardando" ${pedido.status === 'Aguardando' ? 'selected' : ''}>Aguardando contato</option>
                </select>
              </span>
            </div>
          </div>
          <div class="pedido-produtos">
            <h4>Produtos</h4>
            <ul>
              ${produtos.map(produto => `
                <li>${produto.nome} - R$ ${parseFloat(produto.preco).toFixed(2).replace('.', ',')}</li>
              `).join('')}
            </ul>
          </div>
        `;
        pedidosList.appendChild(pedidoItem);
      });
    } else {
      console.error('Resposta inválida: pedidos não é um array');
    }
  } catch (error) {
    console.error('Erro:', error);
    noPedidosMessage.textContent = 'Erro ao carregar pedidos.';
    noPedidosMessage.style.display = 'block';
  }
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

async function alterarStatus(pedidoId, novoStatus) {
  try {
    const response = await fetch('../PHP/alterar_status_pedido.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: pedidoId, // Envia o id do pedido
        status: novoStatus, // Envia o novo status
      }),
      credentials: 'include', // Para garantir que as credenciais da sessão sejam enviadas
    });

    const textResponse = await response.text(); // Pegue a resposta como texto
    //console.log("Resposta do servidor:", textResponse); // Verifique o conteúdo da resposta

    const data = JSON.parse(textResponse); // Agora, tente fazer o parse se a resposta for válida
    
    if (data.status === 'sucesso') {
        enviarMensagemAjax('Status do pedido atualizado com sucesso!', "sucesso");
    } else {
        enviarMensagemAjax('Falha ao atualizar o status do pedido.', "erro");
    }
  } catch (error) {
    console.error('Erro ao alterar status:', error);
    enviarMensagemAjax('Erro ao alterar o status. Tente novamente.', "erro");
  }
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

// Você pode ainda implementar filterByDate() e resetFilter() aqui se quiser filtrar
