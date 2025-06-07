async function carregarPedidos() {
  const pedidosList = document.getElementById('pedidos-list');
  const noPedidosMessage = document.getElementById('no-pedidos-message');

  try {
    const response = await fetch('../PHP/listar_pedidos.php', {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Erro ao carregar pedidos');
    }

    const pedidos = await response.json();
    
    if (pedidos.length === 0) {
      noPedidosMessage.style.display = 'block';
      return;
    }

    if (Array.isArray(pedidos)) {
        pedidos.forEach(pedido => {
            // Dentro da função carregarPedidos(), modifique a parte de processamento dos produtos:
            let produtos = [];
            try {
                if (pedido.produtos) {
                    // Se já for array, usa diretamente
                    if (Array.isArray(pedido.produtos)) {
                        produtos = pedido.produtos;
                    } 
                    // Se for string, tenta parsear
                    else if (typeof pedido.produtos === 'string') {
                        // Remove possíveis caracteres problemáticos
                        const produtosStr = pedido.produtos.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
                        produtos = JSON.parse(produtosStr);
                    }
                    
                    // Filtra produtos inválidos
                    produtos = produtos.filter(p => p && p.nome && p.preco);
                }
            } catch (e) {
                console.error(`Erro ao processar produtos do pedido ${pedido.id}:`, e);
                produtos = [];
            }

            // Garante que é um array
            if (!Array.isArray(produtos)) {
                produtos = [];
            }

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
                  ${produtos.length > 0 ? 
                    produtos.map(produto => `
                      <li>${produto.nome} - R$ ${parseFloat(produto.preco).toFixed(2).replace('.', ',')}</li>
                    `).join('') 
                    : '<li>Nenhum produto listado</li>'}
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
