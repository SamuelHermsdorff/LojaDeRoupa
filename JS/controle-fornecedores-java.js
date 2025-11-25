// ATUALIZADO: Event listener DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
    listarFornecedores();
    
    const searchInput = document.getElementById("search-supplier");
    if (searchInput) {
        searchInput.addEventListener("input", debounce(listarFornecedores, 300));
    }
    
    const cnpjCpfInput = document.getElementById("supplier-cnpj-cpf");
    if (cnpjCpfInput) {
        cnpjCpfInput.addEventListener("input", function(e) {
            formatarCpfCnpj(e);
            const idAtual = document.getElementById("supplier-id").value;
            validarCpfCnpj(e.target, idAtual || null);
        });
        
        cnpjCpfInput.addEventListener("blur", function(e) {
            const idAtual = document.getElementById("supplier-id").value;
            validarCpfCnpj(e.target, idAtual || null);
        });
    }

    // ADICIONADO: Listener para o novo campo de telefone
    const telefoneInput = document.getElementById("supplier-phone");
    if (telefoneInput) {
        telefoneInput.addEventListener("input", formatTelefone);
    }
});


// Função debounce para a busca
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

function toggleMenu() {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("active");
}

function openSupplierModal() {
    document.getElementById("supplier-modal").style.display = "flex";
}

// ATUALIZADO: listarFornecedores
async function listarFornecedores() {
    try {
        const searchTerm = document.getElementById("search-supplier").value.trim();
        const response = await fetch(`../PHP/controle_fornecedores.php?action=listar&search=${encodeURIComponent(searchTerm)}`);
        const fornecedores = await response.json();
        
        const tabela = document.getElementById("supplier-table-body");
        tabela.innerHTML = "";
        
        // MUDANÇA: colspan atualizado para 7 colunas
        if (fornecedores.length === 0) {
            tabela.innerHTML = `<tr><td colspan="7">Nenhum fornecedor encontrado</td></tr>`;
            return;
        }
        
        fornecedores.forEach(fornecedor => {
            const row = document.createElement("tr");
            
            // MUDANÇA: row.innerHTML atualizado com as novas colunas
            row.innerHTML = `
                <td>${fornecedor.codigo_fornecedor}</td>
                <td>${fornecedor.nome}</td>
                <td>${fornecedor.cnpj_cpf}</td>
                <td>${fornecedor.telefone || ''}</td>
                <td>${fornecedor.edereco || ''}</td>
                <td>${fornecedor.nome_representante || ''}</td>
                <td>
                    <button class="edit-button" onclick="abrirModalEditar(${fornecedor.codigo_fornecedor})">Editar</button>
                    <button class="delete-button" onclick="abrirModalDeletar(${fornecedor.codigo_fornecedor})">Deletar</button>
                </td>
            `;
            tabela.appendChild(row);
        });
    } catch (error) {
        console.error("Erro ao listar fornecedores:", error);
        const tabela = document.getElementById("supplier-table-body");
        // MUDANÇA: colspan atualizado para 7 colunas
        tabela.innerHTML = `<tr><td colspan="7">Erro ao carregar fornecedores</td></tr>`;
    }
}

// ATUALIZADO: abrirModalEditar
function abrirModalEditar(id) {
    fetch(`../PHP/controle_fornecedores.php?action=buscar&id=${id}`)
        .then(res => res.json())
        .then(fornecedor => {
            if (fornecedor.erro) {
                enviarMensagemAjax(fornecedor.erro, "erro");
                return;
            }
            
            // Preencher formulário
            document.getElementById("supplier-id").value = fornecedor.codigo_fornecedor;
            document.getElementById("supplier-name").value = fornecedor.nome;
            document.getElementById("supplier-cnpj-cpf").value = fornecedor.cnpj_cpf;

            // CAMPOS ADICIONADOS
            document.getElementById("supplier-phone").value = fornecedor.telefone || '';
            document.getElementById("supplier-address").value = fornecedor.edereco || ''; // Usando 'edereco'
            document.getElementById("supplier-rep").value = fornecedor.nome_representante || '';
            
            // Configurar modal para edição
            document.getElementById("modal-title").textContent = "Editar Fornecedor";
            openSupplierModal();
        })
        .catch(err => {
            console.error("Erro ao buscar fornecedor:", err);
            enviarMensagemAjax("Erro ao carregar dados do fornecedor", "erro");
        });
}

function abrirModalDeletar(id) {
    const confirmationModal = document.getElementById("confirmation-modal");
    confirmationModal.style.display = "flex";
    confirmationModal.setAttribute("data-id", id);
}

async function confirmarAcao(confirmado) {
    const confirmationModal = document.getElementById("confirmation-modal");
    const id = confirmationModal.getAttribute("data-id");
    
    if (!confirmado) {
        confirmationModal.style.display = "none";
        return;
    }
    
    try {
        const response = await fetch(`../PHP/controle_fornecedores.php?action=deletar`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `id=${id}`
        });
        
        const data = await response.json();
        
        if (data.status === "sucesso") {
            enviarMensagemAjax(data.mensagem, "sucesso");
            listarFornecedores();
        } else {
            throw new Error(data.mensagem || "Erro ao deletar fornecedor");
        }
    } catch (error) {
        console.error("Erro ao deletar fornecedor:", error);
        enviarMensagemAjax(error.message, "erro");
    }
    
    confirmationModal.style.display = "none";
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

    // Exibe a mensagem e depois a oculta
    setTimeout(() => {
        mensagemContainer.innerHTML = '';
    }, 1500); // Aumentei o tempo para 1.5s
}

// ATUALIZADO: salvarFornecedor
async function salvarFornecedor(event) {
    event.preventDefault();
    
    try {
        const form = event.target;
        const id = document.getElementById("supplier-id").value;
        const action = id ? "editar" : "cadastrar";
        
        // Obter valores
        const nome = document.getElementById("supplier-name").value.trim();
        const cnpjCpfInput = document.getElementById("supplier-cnpj-cpf");
        const cnpjCpfFormatado = cnpjCpfInput.value;
        const cnpjCpfNumeros = cnpjCpfFormatado.replace(/\D/g, '');
        
        // NOVOS VALORES
        const telefoneInput = document.getElementById("supplier-phone");
        const telefoneFormatado = telefoneInput.value;
        const telefoneNumeros = telefoneFormatado.replace(/\D/g, '');
        const endereco = document.getElementById("supplier-address").value.trim();
        const representante = document.getElementById("supplier-rep").value.trim();

        // Validações
        if (!nome || nome.length < 3) {
            throw new Error("Nome deve ter pelo menos 3 caracteres");
        }
        
        // NOVAS VALIDAÇÕES (com base no seu BD 'NOT NULL')
        if (telefoneNumeros.length < 10) { // 10 para fixo, 11 para celular
            throw new Error("Telefone inválido. Deve ter 10 ou 11 dígitos.");
        }
        if (!endereco) { // 'edereco' é NOT NULL
            throw new Error("O campo Endereço é obrigatório.");
        }
        // (nome_representante é NULL, então não é obrigatório)

        // Verificação final do documento
        const idAtual = id || null;
        const documentoDuplicado = await verificarDocumentoExistente(cnpjCpfFormatado, idAtual);
        if (documentoDuplicado) {
            throw new Error("Não é possível salvar: CPF/CNPJ já cadastrado");
        }
        
        if (!documentoValido) {
            throw new Error("Por favor, insira um CPF ou CNPJ válido");
        }
        
        if (!cnpjCpfNumeros || (cnpjCpfNumeros.length !== 11 && cnpjCpfNumeros.length !== 14)) {
            throw new Error("CNPJ/CPF inválido (deve ter 11 ou 14 dígitos)");
        }
        
        // Preparar dados para envio
        const formData = new URLSearchParams();
        formData.append("nome", nome);
        formData.append("cnpj_cpf", cnpjCpfFormatado);
        
        // NOVOS DADOS
        formData.append("telefone", telefoneFormatado);
        formData.append("edereco", endereco); // Usando 'edereco'
        formData.append("nome_representante", representante);

        if (id) formData.append("id", id);
        
        // Enviar dados
        const response = await fetch(`../PHP/controle_fornecedores.php?action=${action}`, {
            method: "POST",
            body: formData
        });
        
        const data = await response.json();
        
        if (data.status !== "sucesso") {
            throw new Error(data.mensagem || "Erro ao processar requisição");
        }
        
        enviarMensagemAjax(data.mensagem, "sucesso");
        
        // MUDANÇA: Aumentei o tempo para 1000ms (1s) para a msg ser lida
        setTimeout(() => {
            window.location.reload();
        }, 1000); 
        
        // Não é mais necessário chamar listarFornecedores() ou closeSupplierModal() aqui
        // pois a página inteira vai recarregar.

    } catch (error) {
        console.error("Erro ao salvar fornecedor:", error);
        enviarMensagemAjax(error.message, "erro");
    }
}

function formatarCpfCnpj(event) {
    let input = event.target;
    let value = input.value.replace(/\D/g, '');
    
    // Limitar o tamanho (11 para CPF, 14 para CNPJ)
    if (value.length > 14) {
        value = value.substring(0, 14);
    }
    
    // Aplicar formatação de CPF (xxx.xxx.xxx-xx)
    if (value.length <= 11) {
        if (value.length > 3 && value.length <= 6) {
            value = value.replace(/(\d{3})(\d{0,3})/, '$1.$2');
        } else if (value.length > 6 && value.length <= 9) {
            value = value.replace(/(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3');
        } else if (value.length > 9) {
            value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
        }
    } 
    // Aplicar formatação de CNPJ (xx.xxx.xxx/xxxx-xx)
    else {
        if (value.length > 12) {
            value = value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/, '$1.$2.$3/$4-$5');
        } else if (value.length > 8) {
            value = value.replace(/(\d{2})(\d{3})(\d{3})(\d{0,4})/, '$1.$2.$3/$4');
        } else if (value.length > 5) {
            value = value.replace(/(\d{2})(\d{3})(\d{0,3})/, '$1.$2.$3');
        } else if (value.length > 2) {
            value = value.replace(/(\d{2})(\d{0,3})/, '$1.$2');
        }
    }
    
    input.value = value;
    
    // Validação em tempo real
    validarCpfCnpj(input);
}

// Adicionar esta função para verificar duplicados
async function verificarDocumentoExistente(cnpjCpfFormatado, idAtual = null) {
    try {
        const response = await fetch(`../PHP/controle_fornecedores.php?action=verificar_documento&cnpj_cpf=${encodeURIComponent(cnpjCpfFormatado)}${idAtual ? `&id=${idAtual}` : ''}`);
        const data = await response.json();
        
        if (data.existe) {
            exibirMensagem("Este CPF/CNPJ já está cadastrado", false, document.getElementById("supplier-cnpj-cpf"));
            documentoValido = false;
            return true;
        }
        // Se não existe, limpa a msg de erro e marca como válido
        limparMensagem(document.getElementById("supplier-cnpj-cpf"));
        documentoValido = true;
        return false;
    } catch (error) {
        console.error("Erro ao verificar documento:", error);
        return false;
    }
}

// Função para validar CPF (já existente)
function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
        return false;
    }
    
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

// Função para validar CNPJ
function validarCNPJ(cnpj) {
    cnpj = cnpj.replace(/\D/g, '');
    
    if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) {
        return false;
    }
    
    // Valida primeiro dígito verificador
    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }
    
    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(0))) return false;
    
    // Valida segundo dígito verificador
    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }

    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(1))) return false;
    
    return true;
}

// Funções auxiliares para exibir mensagens (já existentes)
function exibirMensagem(mensagem, sucesso, input) {
    let mensagemElement = input.nextElementSibling;
    if (!mensagemElement || !mensagemElement.classList.contains('mensagem-validacao')) {
        mensagemElement = document.createElement('small');
        mensagemElement.className = 'mensagem-validacao';
        input.parentNode.insertBefore(mensagemElement, input.nextSibling);
    }
    
    mensagemElement.textContent = mensagem;
    mensagemElement.style.color = sucesso ? 'green' : 'red';
}

function limparMensagem(input) {
    const mensagemElement = input.nextElementSibling;
    if (mensagemElement && mensagemElement.classList.contains('mensagem-validacao')) {
        mensagemElement.remove(); // Remove o elemento
    }
}
// Adicionar esta variável global para controlar a validação
let documentoValido = false;

function validarCpfCnpj(input, idAtual = null) {
    const value = input.value.replace(/\D/g, '');
    let isValid = false;
    let tipoDocumento = '';
    
    if (value.length === 11) {
        isValid = validarCPF(input.value);
        tipoDocumento = 'CPF';
        exibirMensagem(isValid ? "CPF válido" : "CPF inválido", isValid, input);
    } else if (value.length === 14) {
        isValid = validarCNPJ(input.value);
        tipoDocumento = 'CNPJ';
        exibirMensagem(isValid ? "CNPJ válido" : "CNPJ inválido", isValid, input);
    } else if (value.length > 0) {
        tipoDocumento = value.length < 11 ? 'CPF' : 'CNPJ';
        exibirMensagem(`${tipoDocumento} incompleto`, false, input);
        isValid = false;
    } else {
        limparMensagem(input);
        isValid = false;
    }
    
    // Verificar duplicados apenas se for válido
    if (isValid) {
        documentoValido = true; // Assume válido até checar duplicado
        verificarDocumentoExistente(input.value, idAtual)
            .then(existe => {
                if (existe) {
                    exibirMensagem(`${tipoDocumento} já cadastrado`, false, input);
                    documentoValido = false;
                }
            });
    } else {
      documentoValido = false;
    }
    
    return isValid;
}

// Adicionar validação ao fechar o modal para limpar o estado
function closeSupplierModal() {
    document.getElementById("supplier-modal").style.display = "none";
    const form = document.getElementById("supplier-form");
    if(form) {
        form.reset();
        // Limpa todas as mensagens de validação
        form.querySelectorAll('.mensagem-validacao').forEach(msg => msg.remove());
    }
    document.getElementById("modal-title").textContent = "Cadastrar Fornecedor";
    document.getElementById("supplier-form").removeAttribute("data-action");
    document.getElementById("supplier-id").value = "";
    documentoValido = false; // Resetar o estado de validação
}


// -----------------------------------------------------------------
// ADICIONADO: FUNÇÃO DE FORMATAR TELEFONE (do seu controle-clientes-java.js)
// -----------------------------------------------------------------
function formatTelefone(event) {
    const input = event.target;
    let value = input.value.replace(/\D/g, ''); // Remove tudo que não é dígito
    
    // Limita a 11 caracteres (DDD + número)
    if (value.length > 11) {
        value = value.substring(0, 11);
    }
    
    // Aplica a formatação ( (XX) XXXXX-XXXX ou (XX) XXXX-XXXX )
    // Esta máscara se adapta a 10 ou 11 dígitos
    if (value.length > 10) { // Celular (11 dígitos)
        value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
    } else if (value.length > 6) { // Fixo (10 dígitos)
        value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    } else if (value.length > 2) {
        value = value.replace(/^(\d{2})(\d*).*/, '($1) $2');
    } else if (value.length > 0) {
        value = value.replace(/^(\d*)/, '($1');
    }
    
    // Atualiza o valor do campo
    input.value = value;
    
    // Validação em tempo real
    const telefoneCompleto = (value.replace(/\D/g, '').length === 10 || value.replace(/\D/g, '').length === 11);
    
    if (value.length > 0 && !telefoneCompleto) {
        exibirMensagem("Telefone incompleto", false, input);
    } else if (telefoneCompleto) {
        limparMensagem(input); // Limpa a mensagem se for válido
    } else {
        limparMensagem(input);
    }
}
