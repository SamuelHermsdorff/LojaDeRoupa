// Carregar produtos ao iniciar a página
document.addEventListener("DOMContentLoaded", () => {
    // Configurar formatadores
    const nomeInput = document.getElementById("client-name");
    const cpfInput = document.getElementById("client-cpf");
    const telefoneInput = document.getElementById("client-phone");
    
    if (nomeInput) nomeInput.addEventListener("input", formatarNome);
    if (cpfInput) cpfInput.addEventListener("input", formatarCPF);
    if (telefoneInput) telefoneInput.addEventListener("input", formatarTelefone);
    
    // Carregar produtos
    carregarProdutos();
    
    // Configurar data atual
    setCurrentDate();

    // Adicionar listener para o select de parcelas
    document.getElementById("installment-select").addEventListener("change", updateOrderSummary);
});

// Funções do menu (mantidas conforme original)
function toggleMenu() {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("active");
}

document.addEventListener("click", (event) => {
    const sidebar = document.getElementById("sidebar");
    const menuButton = document.querySelector(".menu-button");
    if (!sidebar.contains(event.target) && !menuButton.contains(event.target)) {
        sidebar.classList.remove("active");
    }
});

// Variável para armazenar produtos
let produtosDisponiveis = [];

// Função para carregar produtos do servidor
async function carregarProdutos() {
    try {
        const response = await fetch('../PHP/buscar_produtos.php');
        
        if (!response.ok) {
            throw new Error('Erro ao carregar produtos');
        }
        
        const produtos = await response.json();
        
        // Converter preços para número e armazenar
        produtosDisponiveis = produtos.map(produto => ({
            ...produto,
            preco: parseFloat(produto.preco),
            quant_estoque: parseInt(produto.quant_estoque) // Garante que estoque é um número
        }));
        
        // Exibir produtos
        exibirProdutos(produtosDisponiveis);
        
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        enviarMensagemAjax("Erro ao carregar produtos", "erro");
    }
}

// Atualize a função exibirProdutos para garantir que os eventos são registrados
function exibirProdutos(produtos) {
    const container = document.getElementById('products-container');
    container.innerHTML = '';
    
    if (produtos.length === 0) {
        container.innerHTML = '<p>Nenhum produto disponível</p>';
        return;
    }
    
    produtos.forEach(produto => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.dataset.id = produto.codigo_produto;
        card.dataset.price = produto.preco;
        card.dataset.name = produto.nome.toLowerCase();
        card.dataset.gender = produto.genero;
        card.dataset.type = produto.tipo.toLowerCase();
        card.dataset.stock = produto.quant_estoque; // Armazena o estoque disponível no dataset

        card.innerHTML = `
            <img src="${produto.imagem ? 'data:image/jpeg;base64,'+produto.imagem : ''}" 
                    alt="${produto.nome}" class="product-image">
            <div class="product-info">
                <h3>${produto.nome}</h3>
                <p>Gênero: ${produto.genero}</p>
                <p>Código: ${produto.codigo_produto}</p>
                <p>Tamanhos: ${produto.tamanho}</p>
                <p class="product-price">R$ ${produto.preco.toFixed(2)}</p>
                <p class="availability ${produto.quant_estoque > 0 ? 'available' : 'unavailable'}">
                    ${produto.quant_estoque > 0 ? `Disponível (${produto.quant_estoque} no estoque)` : 'Esgotado'}
                </p>
                <div class="quantity-control hidden">
                    <button class="quantity-decrease">-</button>
                    <input type="number" value="1" min="1" max="${produto.quant_estoque}" class="product-quantity" readonly>
                    <button class="quantity-increase">+</button>
                </div>
            </div>
        `;
        
        // Evento de clique modificado para toggleProductSelection
        card.addEventListener('click', function(event) {
            // Verifica se o clique não foi nos botões de quantidade ou no input
            if (!event.target.closest('.quantity-control')) {
                toggleProductSelection(this);
            }
        });

        // Adiciona event listeners para os botões de quantidade e input
        const quantityInput = card.querySelector('.product-quantity');
        const decreaseBtn = card.querySelector('.quantity-decrease');
        const increaseBtn = card.querySelector('.quantity-increase');

        if (decreaseBtn) {
            decreaseBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Impede que o clique propague para o card (seleção)
                adjustQuantity(quantityInput, -1);
            });
        }
        if (increaseBtn) {
            increaseBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Impede que o clique propague para o card (seleção)
                adjustQuantity(quantityInput, 1);
            });
        }
        if (quantityInput) {
            // Assegura que a quantidade não excede o estoque ou é menor que 1
            quantityInput.addEventListener('change', (e) => {
                e.stopPropagation();
                let val = parseInt(quantityInput.value);
                const max = parseInt(quantityInput.max);
                if (isNaN(val) || val < 1) {
                    quantityInput.value = 1;
                } else if (val > max) {
                    quantityInput.value = max;
                    enviarMensagemAjax(`Quantidade máxima para ${produto.nome} é ${max}`, "aviso");
                }
                updateOrderSummary();
            });
            // Impede a edição manual com teclado se quiser que seja só pelos botões
            // quantityInput.addEventListener('keydown', (e) => { e.preventDefault(); });
        }
        
        container.appendChild(card);
    });
}

function adjustQuantity(inputElement, delta) {
    let currentValue = parseInt(inputElement.value);
    const maxStock = parseInt(inputElement.max);
    let newValue = currentValue + delta;

    if (newValue < 1) {
        newValue = 1; // Quantidade mínima é 1
    } else if (newValue > maxStock) {
        newValue = maxStock; // Não excede o estoque
        enviarMensagemAjax(`Quantidade máxima para este produto é ${maxStock}`, "aviso");
    }
    inputElement.value = newValue;
    updateOrderSummary(); // Atualiza o resumo após mudar a quantidade
}


function filterProducts() {
    const searchTerm = document.getElementById('product-search').value.toLowerCase();
    const genderFilter = document.querySelector('input[name="gender-filter"]:checked').value;
    const typeFilter = document.getElementById('product-type').value;
    
    const container = document.getElementById('products-container');
    container.innerHTML = ''; // Limpa antes de exibir os filtrados
    
    const filtered = produtosDisponiveis.filter(produto => {
        const matchesSearch = produto.nome.toLowerCase().includes(searchTerm);
        const matchesGender = !genderFilter || produto.genero === genderFilter;
        const matchesType = !typeFilter || produto.tipo === typeFilter;
        
        return matchesSearch && matchesGender && matchesType;
    });
    
    if (filtered.length === 0) {
        container.innerHTML = '<p>Nenhum produto encontrado</p>';
        return;
    }
    
    // Reutiliza a função exibirProdutos para renderizar os produtos filtrados
    // Isso garante que todos os event listeners sejam reatribuídos
    exibirProdutos(filtered); 

    // Reaplicar a seleção para os produtos que estavam selecionados
    const currentSelectedProductIds = Array.from(document.querySelectorAll('.product-card.selected')).map(card => card.dataset.id);
    currentSelectedProductIds.forEach(id => {
        const card = container.querySelector(`.product-card[data-id="${id}"]`);
        if (card) {
            card.classList.add('selected');
            card.style.boxShadow = "0 0 0 2px #d32f2f"; // Reaplicar feedback visual
            card.querySelector('.quantity-control').classList.remove('hidden'); // Mostrar controle
        }
    });
    updateOrderSummary(); // Re-atualiza o resumo após re-renderizar e re-selecionar
}

// Funções de pedido (mantidas com ajustes)
function startNewOrder() {
    document.getElementById("initial-container").classList.add("hidden");
    document.getElementById("order-container").classList.remove("hidden");
}

function cancelOrder() {
    document.getElementById("initial-container").classList.remove("hidden");
    document.getElementById("order-container").classList.add("hidden");
    resetForm();
    window.location.reload(); // Recarrega para limpar completamente o estado dos produtos
}

function setCurrentDate() {
    const today = new Date();
    const formattedDate = today.toLocaleDateString('pt-BR');
    document.getElementById("order-date").textContent = formattedDate;
}

// Atualize a função toggleProductSelection
function toggleProductSelection(element) {
    const quantityControl = element.querySelector('.quantity-control');
    const quantityInput = element.querySelector('.product-quantity');
    const stock = parseInt(element.dataset.stock);

    // Verifica se o produto está disponível (estoque > 0)
    if (stock > 0) {
        // Se o card já está selecionado, deseleciona
        if (element.classList.contains("selected")) {
            element.classList.remove("selected");
            element.style.boxShadow = "none";
            quantityControl.classList.add('hidden'); // Esconde o controle de quantidade
            quantityInput.value = 1; // Reseta a quantidade para 1
        } else {
            // Se o card não está selecionado, seleciona
            element.classList.add("selected");
            element.style.boxShadow = "0 0 0 2px #d32f2f";
            quantityControl.classList.remove('hidden'); // Mostra o controle de quantidade
            quantityInput.value = 1; // Garante que a quantidade inicial é 1
        }
        updateOrderSummary();
    } else {
        enviarMensagemAjax("Este produto está esgotado e não pode ser selecionado", "erro");
        element.classList.remove("selected"); // Garante que o produto esgotado não fica selecionado
        element.style.boxShadow = "none";
        quantityControl.classList.add('hidden'); // Esconde o controle de quantidade
        quantityInput.value = 1; // Reseta a quantidade
        updateOrderSummary(); // Atualiza caso um esgotado estivesse selecionado
    }
}

function selectPayment(element, type) {
    document.querySelectorAll('.payment-option').forEach(opt => {
        opt.classList.remove('selected');
        // Desmarcar o rádio button associado
        opt.querySelector('input[type="radio"]').checked = false;
    });
    
    element.classList.add('selected');
    // Marcar o rádio button associado
    element.querySelector('input[type="radio"]').checked = true;
    
    const installments = document.getElementById("installments");
    if (type === 'Crédito') {
        installments.style.display = 'block';
    } else {
        installments.style.display = 'none';
    }
    updateOrderSummary(); // Atualiza o resumo caso haja alteração de juros
}

function updateOrderSummary() {
    const selectedProducts = document.querySelectorAll('.product-card.selected');
    let totalItems = 0;
    let subtotal = 0;

    selectedProducts.forEach(productCard => {
        const quantityInput = productCard.querySelector('.product-quantity');
        const quantity = parseInt(quantityInput.value);
        const price = parseFloat(productCard.dataset.price);

        totalItems += quantity;
        subtotal += price * quantity;
    });
    
    document.getElementById("selected-items").textContent = totalItems;
    document.getElementById("subtotal").textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    
    let total = subtotal;
    const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value;
    
    // Lógica para juros do cartão de crédito (exemplo simples)
    if (paymentMethod === 'Crédito') {
        const installmentSelect = document.getElementById('installment-select');
        const installments = parseInt(installmentSelect.value);
        if (installments >= 4) { // Exemplo: juros a partir de 4 parcelas
            total *= 1.05; // Adiciona 5% de juros
        }
    }

    document.getElementById("total").textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

function resetForm() {
    document.getElementById("client-name").value = "";
    document.getElementById("client-phone").value = "";
    document.getElementById("client-cpf").value = "";
    document.getElementById("client-email").value = "";
    
    document.querySelectorAll('.product-card').forEach(card => {
        card.classList.remove('selected');
        card.style.boxShadow = "none"; // Remover feedback visual
        const quantityControl = card.querySelector('.quantity-control');
        const quantityInput = card.querySelector('.product-quantity');
        if (quantityControl) quantityControl.classList.add('hidden'); // Esconde o controle
        if (quantityInput) quantityInput.value = 1; // Reseta a quantidade
    });
    
    document.getElementById("product-search").value = "";
    document.querySelector('input[name="gender-filter"][value=""]').checked = true;
    document.getElementById("product-type").value = "";
    
    document.querySelectorAll('input[name="payment"]').forEach(radio => {
        radio.checked = false;
    });
    document.querySelectorAll('.payment-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    document.getElementById("installments").style.display = 'none';

    document.getElementById("selected-items").textContent = "0";
    document.getElementById("subtotal").textContent = "R$ 0,00";
    document.getElementById("total").textContent = "R$ 0,00";
    
    // Recarrega os produtos para refletir qualquer mudança de estoque no backend
    // Não é mais necessário o window.location.reload() em cancelOrder()
    // Apenas chame carregarProdutos() aqui para resetar a lista de produtos
    carregarProdutos();
}

function enviarMensagemAjax(mensagem, tipo) {
    const mensagemContainer = document.getElementById('mensagem');

    // Limpa mensagens anteriores imediatamente para evitar sobreposição
    mensagemContainer.innerHTML = ''; 

    const msgDiv = document.createElement('div');
    msgDiv.className = `mensagem ${tipo}`;
    msgDiv.textContent = mensagem;
    mensagemContainer.appendChild(msgDiv);

    setTimeout(() => {
        msgDiv.remove(); // Remove a mensagem após 3 segundos
    }, 3000);
}

// Funções de formatação e validação
function formatarNome(event) {
    let input = event.target;
    let nome = input.value.replace(/[^a-zA-ZÀ-ÖØ-öø-ÿ\s]/g, '');
    input.value = nome;
    return nome;
}

function formatarCPF(event) {
    let input = event.target;
    let cpf = input.value.replace(/\D/g, '');
    
    if (cpf.length > 11) {
        cpf = cpf.substring(0, 11);
    }
    
    if (cpf.length > 3 && cpf.length <= 6) {
        cpf = cpf.replace(/(\d{3})(\d{0,3})/, '$1.$2');
    } else if (cpf.length > 6 && cpf.length <= 9) {
        cpf = cpf.replace(/(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3');
    } else if (cpf.length > 9) {
        cpf = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
    }
    
    input.value = cpf;
    
    // Validação em tempo real
    if (cpf.replace(/\D/g, '').length === 11) {
        if (validarCPF(cpf)) {
            exibirMensagem("CPF válido", true, input);
        } else {
            exibirMensagem("CPF inválido", false, input);
        }
    } else if (cpf.length > 0) {
        exibirMensagem("CPF incompleto", false, input);
    } else {
        limparMensagem(input);
    }
}

function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
    
    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) return false;
    
    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(10))) return false;
    
    return true;
}

function formatarTelefone(event) {
    const input = event.target;
    let value = input.value.replace(/\D/g, '');
    
    if (value.length > 11) {
        value = value.substring(0, 11);
    }
    
    let formattedValue = '';
    if (value.length > 0) {
        formattedValue = '(' + value.substring(0, 2);
    }
    if (value.length > 2) {
        formattedValue += ') ' + value.substring(2, 7);
    }
    if (value.length > 7) {
        formattedValue += '-' + value.substring(7, 11);
    }
    
    input.value = formattedValue;
    
    // Validação em tempo real
    const telefoneCompleto = value.length === 11;
    if (value.length > 0 && !telefoneCompleto) {
        exibirMensagem("Telefone incompleto", false, input);
    } else if (telefoneCompleto) {
        exibirMensagem("Telefone válido", true, input);
    } else {
        limparMensagem(input);
    }
}

function exibirMensagem(mensagem, sucesso, inputElement) {
    let mensagemBox = inputElement.nextElementSibling;
    
    if (!mensagemBox || !mensagemBox.classList.contains("mensagem-validacao")) {
        mensagemBox = document.createElement('div');
        mensagemBox.className = "mensagem-validacao";
        inputElement.parentNode.insertBefore(mensagemBox, inputElement.nextSibling);
    }
    
    mensagemBox.textContent = mensagem;
    mensagemBox.className = `mensagem-validacao ${sucesso ? 'sucesso' : 'erro'}`;
}

function limparMensagem(inputElement) {
    const mensagemBox = inputElement.nextElementSibling;
    if (mensagemBox && mensagemBox.classList.contains("mensagem-validacao")) {
        mensagemBox.remove();
    }
}

// Função para enviar o pedido
function saveOrder() {
    const clientName = document.getElementById("client-name").value.trim();
    const clientPhone = document.getElementById("client-phone").value;
    const clientCpf = document.getElementById("client-cpf").value;
    const clientEmail = document.getElementById("client-email")?.value || '';
    
    // Validações
    if (!clientName || clientName.length < 3) {
        enviarMensagemAjax("Nome deve ter pelo menos 3 caracteres", "erro");
        return;
    }
    
    if (!validarCPF(clientCpf)) {
        enviarMensagemAjax("CPF inválido", "erro");
        return;
    }
    
    const phoneDigits = clientPhone.replace(/\D/g, '');
    if (phoneDigits.length !== 11) {
        enviarMensagemAjax("Telefone inválido", "erro");
        return;
    }
    
    const selectedProducts = document.querySelectorAll('.product-card.selected');
    if (selectedProducts.length === 0) {
        enviarMensagemAjax("Selecione pelo menos um produto", "erro");
        return;
    }

    // Coleta produtos com suas quantidades
    const produtosParaEnvio = [];
    let isValidQuantity = true;
    selectedProducts.forEach(productCard => {
        const quantityInput = productCard.querySelector('.product-quantity');
        const codigo_produto = parseInt(productCard.dataset.id);
        const nome_produto = productCard.dataset.name;
        const preco_produto = parseFloat(productCard.dataset.price);
        const genero_produto = productCard.dataset.gender;
        const estoque_disponivel = parseInt(productCard.dataset.stock);
        let quantidade_selecionada = parseInt(quantityInput.value);

        // Validação da quantidade: deve ser pelo menos 1 e não pode exceder o estoque
        if (isNaN(quantidade_selecionada) || quantidade_selecionada < 1) {
            enviarMensagemAjax(`A quantidade para o produto '${nome_produto}' deve ser pelo menos 1.`, "erro");
            isValidQuantity = false;
            return; // Sai do forEach
        }
        if (quantidade_selecionada > estoque_disponivel) {
            enviarMensagemAjax(`A quantidade selecionada para '${nome_produto}' (${quantidade_selecionada}) excede o estoque disponível (${estoque_disponivel}).`, "erro");
            isValidQuantity = false;
            return; // Sai do forEach
        }

        produtosParaEnvio.push({
            codigo_produto: codigo_produto,
            nome: nome_produto,
            preco: preco_produto,
            genero: genero_produto,
            quantidade: quantidade_selecionada // Adiciona a quantidade
        });
    });

    if (!isValidQuantity) {
        return; // Impede o envio se houver erro de quantidade
    }


    const valorTotalElement = document.getElementById("total");
    const valorTotalText = valorTotalElement.textContent;
    const valorTotal = parseFloat(valorTotalText.replace('R$', '').replace(',', '.'));
    
    if (isNaN(valorTotal) || valorTotal <= 0) {
        enviarMensagemAjax("O valor total do pedido é inválido.", "erro");
        return;
    }

    const selectedPaymentOption = document.querySelector('input[name="payment"]:checked');
    let formaPagamento = selectedPaymentOption ? selectedPaymentOption.value : null;

    // NOVA VALIDAÇÃO: Torna a forma de pagamento obrigatória
    if (!formaPagamento) {
        enviarMensagemAjax("Selecione uma forma de pagamento para continuar", "erro");
        return;
    }

    // Modificação: Adicionar parcela se for Crédito
    if (formaPagamento === 'Crédito') {
        const installmentSelect = document.getElementById('installment-select');
        const installments = installmentSelect.value;
        formaPagamento = `Crédito ${installments}x`; // Formato: "Crédito 3x"
    }

    const orderData = {
        nome_cliente: clientName,
        telefone_cliente: clientPhone,
        cpf_cliente: clientCpf,
        email_cliente: clientEmail,
        produtos: produtosParaEnvio, // Usa a lista de produtos com quantidades
        forma_pagamento: formaPagamento,
        valor_total: valorTotal
    };

    enviarPedido(orderData);
}

function enviarPedido(orderData) {
    fetch('../PHP/registrar_venda.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
    })
    .then(response => {
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            return response.text().then(text => {
                if (response.ok) {
                    return { status: "success", message: "Pedido registrado com sucesso" };
                }
                throw new Error(text || "Resposta inválida do servidor");
            });
        }
        return response.json();
    })
    .then(data => {
        if (data.status === "success") {
            enviarMensagemAjax(data.message, "sucesso");

            // No sucesso, atualizar o estoque no frontend para refletir a venda
            // Itera sobre os produtos vendidos e subtrai a quantidade do estoque disponível
            orderData.produtos.forEach(orderedProduct => {
                const productToUpdate = produtosDisponiveis.find(p => p.codigo_produto === orderedProduct.codigo_produto);
                if (productToUpdate) {
                    productToUpdate.quant_estoque -= orderedProduct.quantidade;
                    // Atualiza a exibição do estoque no card
                    const cardElement = document.querySelector(`.product-card[data-id="${orderedProduct.codigo_produto}"]`);
                    if (cardElement) {
                        cardElement.dataset.stock = productToUpdate.quant_estoque; // Atualiza o dataset
                        const availabilityElement = cardElement.querySelector('.availability');
                        const quantityInput = cardElement.querySelector('.product-quantity');
                        if (productToUpdate.quant_estoque > 0) {
                            availabilityElement.textContent = `Disponível (${productToUpdate.quant_estoque} no estoque)`;
                            availabilityElement.classList.replace('unavailable', 'available');
                            quantityInput.max = productToUpdate.quant_estoque; // Atualiza o max do input
                        } else {
                            availabilityElement.textContent = 'Esgotado';
                            availabilityElement.classList.replace('available', 'unavailable');
                            quantityInput.max = 0;
                            // Se esgotou, deseleciona o card e esconde o controle de quantidade
                            if (cardElement.classList.contains('selected')) {
                                toggleProductSelection(cardElement); // Desseleciona e esconde o controle
                            }
                        }
                    }
                }
            });

            setTimeout(function() {
                resetForm(); // Agora resetForm() chama carregarProdutos() para atualizar
                window.location.reload(); // Recarrega para limpar completamente o estado dos produtos
            }, 500);
        } else {
            enviarMensagemAjax(data.message || "Erro ao registrar pedido", "erro");
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        if (error.message.includes("Pedido registrado")) {
            enviarMensagemAjax("Pedido registrado com sucesso", "sucesso");
            // Se o pedido foi registrado, mas o estoque não foi atualizado no front
            // por algum motivo (erro de rede, etc.), o resetForm vai recarregar os produtos
            // e trazer o estoque correto do backend.
            setTimeout(function() {
                resetForm();
                window.location.reload(); // Recarrega para limpar completamente o estado dos produtos
            }, 500);
        } else {
            enviarMensagemAjax("Pedido pode ter sido registrado, mas houve um erro na resposta: " + error.message, "aviso");
        }
    });
}
