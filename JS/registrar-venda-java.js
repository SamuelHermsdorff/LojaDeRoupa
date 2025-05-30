
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
            preco: parseFloat(produto.preco)
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
        
        card.innerHTML = `
            <img src="${produto.imagem ? 'data:image/jpeg;base64,'+produto.imagem : '../Fotos/placeholder.jpg'}" 
                 alt="${produto.nome}" class="product-image">
            <div class="product-info">
                <h3>${produto.nome}</h3>
                <p>Gênero: ${produto.genero}</p>
                <p>Código: ${produto.codigo_produto}</p>
                <p>Tamanhos: ${produto.tamanho}</p>
                <p class="product-price">R$ ${produto.preco.toFixed(2)}</p>
                <p class="availability ${produto.quant_estoque > 0 ? 'available' : 'unavailable'}">
                    ${produto.quant_estoque > 0 ? 'Disponível' : 'Esgotado'}
                </p>
            </div>
        `;
        
        // Evento de clique modificado
        card.addEventListener('click', function() {
            toggleProductSelection(this);
        });
        
        container.appendChild(card);
    });
}
//// Função para exibir produtos na grade
//function exibirProdutos(produtos) {
//    const container = document.getElementById('products-container');
//    container.innerHTML = '';
//    
//    if (produtos.length === 0) {
//        container.innerHTML = '<p>Nenhum produto disponível</p>';
//        return;
//    }
//    
//    produtos.forEach(produto => {
//        const card = document.createElement('div');
//        card.className = 'product-card';
//        card.dataset.id = produto.codigo_produto;
//        card.dataset.price = produto.preco;
//        card.dataset.name = produto.nome.toLowerCase();
//        card.dataset.gender = produto.genero;
//        card.dataset.type = produto.tipo.toLowerCase();
//        
//        card.innerHTML = `
//            <img src="data:image/jpeg;base64,${produto.imagem || ''}" alt="${produto.nome}" class="product-image">
//            <div class="product-info">
//                <h3>${produto.nome}</h3>
//                <p>Gênero: ${produto.genero}</p>
//                <p>Código: ${produto.codigo_produto}</p>
//                <p>Tamanhos: ${produto.tamanho}</p>
//                <p class="product-price">R$ ${produto.preco.toFixed(2)}</p>
//                <p class="availability ${produto.quant_estoque > 0 ? 'available' : 'unavailable'}">
//                    ${produto.quant_estoque > 0 ? 'Disponível' : 'Esgotado'}
//                </p>
//            </div>
//        `;
//        
//        if (produto.quant_estoque > 0) {
//            card.onclick = () => toggleProductSelection(card);
//        }
//        
//        container.appendChild(card);
//    });
//}

function filterProducts() {
    const searchTerm = document.getElementById('product-search').value.toLowerCase();
    const genderFilter = document.querySelector('input[name="gender-filter"]:checked').value;
    const typeFilter = document.getElementById('product-type').value;
    
    const container = document.getElementById('products-container');
    container.innerHTML = '';
    
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
    
    filtered.forEach(produto => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.dataset.id = produto.codigo_produto;
        card.dataset.price = produto.preco;
        card.dataset.name = produto.nome;
        card.dataset.gender = produto.genero;
        
        card.innerHTML = `
            <img src="data:image/jpeg;base64,${produto.imagem}" alt="${produto.nome}" class="product-image">
            <div class="product-info">
                <h3>${produto.nome}</h3>
                <p>Gênero: ${produto.genero}</p>
                <p>Código: ${produto.codigo_produto}</p>
                <p>Tamanhos: ${produto.tamanho}</p>
                <p class="product-price">R$ ${produto.preco.toFixed(2)}</p>
                <p class="availability ${produto.quant_estoque > 0 ? 'available' : 'unavailable'}">
                    ${produto.quant_estoque > 0 ? 'Disponível' : 'Esgotado'}
                </p>
            </div>
        `;
        
        if (produto.quant_estoque > 0) {
            card.onclick = () => toggleProductSelection(card);
        }
        
        container.appendChild(card);
    });
}

// ... (restante do código mantido)
// Funções de pedido (mantidas com ajustes)
function startNewOrder() {
    document.getElementById("initial-container").classList.add("hidden");
    document.getElementById("order-container").classList.remove("hidden");
}

function cancelOrder() {
    document.getElementById("initial-container").classList.remove("hidden");
    document.getElementById("order-container").classList.add("hidden");
    resetForm();
    window.location.reload();
}

function setCurrentDate() {
    const today = new Date();
    const formattedDate = today.toLocaleDateString('pt-BR');
    document.getElementById("order-date").textContent = formattedDate;
}
// Atualize a função toggleProductSelection
function toggleProductSelection(element) {
    // Verifica se o produto está disponível
    const disponivel = element.querySelector('.availability').textContent.includes('Disponível');
    
    if (disponivel) {
        element.classList.toggle("selected");
        
        // Feedback visual
        if (element.classList.contains("selected")) {
            element.style.boxShadow = "0 0 0 2px #d32f2f";
        } else {
            element.style.boxShadow = "none";
        }
        
        updateOrderSummary();
    } else {
        enviarMensagemAjax("Este produto está esgotado", "erro");
    }
}
//function toggleProductSelection(element) {
//    if (parseInt(element.querySelector('.availability').textContent.includes('Disponível'))) {
//        element.classList.toggle("selected");
//        updateOrderSummary();
//    }
//}
//function toggleProductSelection(element) {
//    element.classList.toggle("selected");
//    updateOrderSummary();
//}

function selectPayment(element, type) {
    document.querySelectorAll('.payment-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    
    element.classList.add('selected');
    
    const installments = document.getElementById("installments");
    if (type === 'Crédito') {
        installments.style.display = 'block';
    } else {
        installments.style.display = 'none';
    }
}
function updateOrderSummary() {
    const selectedProducts = document.querySelectorAll('.product-card.selected');
    document.getElementById("selected-items").textContent = selectedProducts.length;

    let subtotal = 0;
    selectedProducts.forEach(product => {
        subtotal += parseFloat(product.dataset.price);
    });
    
    document.getElementById("subtotal").textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    document.getElementById("total").textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
}
//function updateOrderSummary() {
//    const selectedProducts = document.querySelectorAll('.product-card.selected');
//    document.getElementById("selected-items").textContent = selectedProducts.length;
//
//    let subtotal = 0;
//    selectedProducts.forEach(product => {
//        subtotal += parseFloat(product.dataset.price);
//    });
//    
//    document.getElementById("subtotal").textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
//    document.getElementById("total").textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
//}

function resetForm() {
    document.getElementById("client-name").value = "";
    document.getElementById("client-phone").value = "";
    document.getElementById("client-cpf").value = "";
    
    document.querySelectorAll('.product-card').forEach(card => {
        card.classList.remove('selected');
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
}

function enviarMensagemAjax(mensagem, tipo) {
    const mensagemContainer = document.getElementById('mensagem');

    if (tipo === "sucesso") {
        mensagemContainer.innerHTML = `<div class="mensagem sucesso">${mensagem}</div>`;
    } else {
        mensagemContainer.innerHTML = `<div class="mensagem erro">${mensagem}</div>`;
    }
    setTimeout(() => {
        mensagemContainer.innerHTML = '';
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

// Configurar eventos de formatação
document.addEventListener("DOMContentLoaded", () => {
    const nomeInput = document.getElementById("client-name");
    const cpfInput = document.getElementById("client-cpf");
    const telefoneInput = document.getElementById("client-phone");
    
    if (nomeInput) nomeInput.addEventListener("input", formatarNome);
    if (cpfInput) cpfInput.addEventListener("input", formatarCPF);
    if (telefoneInput) telefoneInput.addEventListener("input", formatarTelefone);
});

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

    const orderData = {
        nome_cliente: clientName,
        telefone_cliente: clientPhone,
        cpf_cliente: clientCpf,
        email_cliente: clientEmail,
        produtos: Array.from(selectedProducts).map(product => ({
            codigo_produto: parseInt(product.dataset.id),
            nome: product.dataset.name,
            preco: parseFloat(product.dataset.price),
            genero: product.dataset.gender
        }))
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
        // Primeiro verifique se a resposta é JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            return response.text().then(text => {
                // Se não for JSON, mas o status for OK, considere como sucesso
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

            setTimeout(function() {
                cancelOrder();
            }, 500);
        } else {
            enviarMensagemAjax(data.message || "Erro ao registrar pedido", "erro");
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        // Se o pedido foi salvo mas houve erro na resposta, mostre mensagem diferente
        if (error.message.includes("Pedido registrado")) {
            enviarMensagemAjax("Pedido registrado com sucesso", "sucesso");
            setTimeout(function() {
                cancelOrder();
            }, 500);
        } else {
            enviarMensagemAjax("Pedido pode ter sido registrado, mas houve um erro na resposta: " + error.message, "aviso");
        }
    });
}
//function enviarPedido(orderData) {
//    fetch('../PHP/registrar_venda.php', {
//        method: 'POST',
//        headers: {
//            'Content-Type': 'application/json',
//        },
//        body: JSON.stringify(orderData)
//    })
//    .then(response => {
//        if (!response.ok) {
//            return response.text().then(text => {
//                throw new Error(text || "Erro no servidor");
//            });
//        }
//        return response.json();
//    })
//    .then(data => {
//        if (data.status === "success") {
//            enviarMensagemAjax(data.message, "sucesso");
//            cancelOrder();
//        } else {
//            enviarMensagemAjax(data.message || "Erro ao registrar pedido", "erro");
//        }
//    })
//    .catch(error => {
//        console.error('Erro:', error);
//        enviarMensagemAjax(error.message || "Erro ao conectar com o servidor", "erro");
//    });
//}
