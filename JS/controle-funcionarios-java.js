// Funções principais corrigidas
document.addEventListener("DOMContentLoaded", () => {
    initClientes();
});


function initClientes() {
    try {
        // Configurar máscaras
        const cpfInput = document.getElementById("client-cpf");
        const telefoneInput = document.getElementById("client-phone");
        
        if (cpfInput) cpfInput.addEventListener("input", formatCPF);
        if (telefoneInput) telefoneInput.addEventListener("input", formatTelefone);
        
        // Configurar formulário
        const form = document.getElementById("client-form");
        if (form) form.addEventListener("submit", salvarUsuario);
        
        // Configurar busca
        const searchInput = document.getElementById("search-client");
        if (searchInput) searchInput.addEventListener("input", debounce(listarUsuarios, 0));
        
        // Carregar dados iniciais
        listarUsuarios();
    } catch (error) {
        console.error("Erro na inicialização:", error);
    }
}

async function confirmarAcao(confirmado) {
    const confirmationModal = document.getElementById("confirmation-modal");
    if (!confirmationModal) return;
    
    if (!confirmado) {
        confirmationModal.style.display = "none";
        return;
    }

    const id = confirmationModal.getAttribute("data-id");
    const action = confirmationModal.getAttribute("data-action");
    
    if (action === "deletar" && id) {
        try {
            const response = await fetch(`../PHP/controle_funcionarios.php?action=deletar`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: id })
            });
            
            const data = await response.json();
            
            if (data.status === "sucesso") {
                enviarMensagemAjax(data.mensagem, "sucesso");

                listarUsuarios();
            } else {
                enviarMensagemAjax(data.mensagem || "Erro ao deletar usuário", "erro");
                throw new Error(data.mensagem || "Erro ao deletar usuário");
            }
        } catch (error) {
            console.error("Erro ao deletar usuário:", error);
            enviarMensagemAjax(error.message, "erro");
        }
    }
    
    confirmationModal.style.display = "none";
}

// Função auxiliar para deletar usuário
async function deletarUsuario(id) {
    try {
        const response = await fetch(`../PHP/controle_funcionarios.php?action=deletar`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        
        const data = await response.json();
        
        if (data.status === "sucesso") {
            enviarMensagemAjax(data.mensagem, "sucesso");
            listarUsuarios();
        } else {
            throw new Error(data.mensagem);
            enviarMensagemAjax(data.mensagem, "erro");
        }
    } catch (error) {
        console.error("Erro ao deletar usuário:", error);
        enviarMensagemAjax(`Erro: ${error.message}`, "erro");
    }
}

function setupValidations() {
    // Máscaras e validações
    const nomeInput = document.getElementById("client-name");
    const cpfInput = document.getElementById("client-cpf");
    const telefoneInput = document.getElementById("client-phone");
    const emailInput = document.getElementById("client-email");
    
    if (nomeInput) {
        nomeInput.addEventListener("input", formatNome);
    }
    
    if (cpfInput) {
        cpfInput.addEventListener("input", formatCPF);
        cpfInput.addEventListener("blur", () => {
            if (cpfInput.value.length === 14 && !validarCPF(cpfInput.value)) {
                exibirMensagem("CPF inválido!", false, cpfInput);
            }
        });
    }
    
    if (telefoneInput) {
        telefoneInput.addEventListener("input", formatTelefone);
    }
    
    if (emailInput) {
        emailInput.addEventListener("blur", validarEmail);
    }
}

// Funções de validação (baseadas no seu código)
function formatNome(event) {
    let nome = event.target.value.replace(/[^a-zA-ZÀ-ÖØ-öø-ÿ\s]/g, '');
    event.target.value = nome;
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


function validarFormulario(form) {
    let valido = true;
    
    // Validação do nome
    const nome = form.querySelector("#client-name").value.trim();
    
    // Validação do CPF
    const cpf = form.querySelector("#client-cpf").value;
    if (!validarCPF(cpf)) {
        exibirMensagem("CPF inválido", false, form.querySelector("#client-cpf"));
        valido = false;
    }
    
    // Validação do telefone
    const telefone = form.querySelector("#client-phone").value.replace(/\D/g, '');
    if (telefone.length < 10) {
        exibirMensagem("Telefone inválido", false, form.querySelector("#client-phone"));
        valido = false;
    }
    
    // Validação do email
    const email = form.querySelector("#client-email").value;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        exibirMensagem("Email inválido", false, form.querySelector("#client-email"));
        valido = false;
    }
    
    // Validação da senha (apenas para cadastro)
    if (form.getAttribute("data-action") !== "editar") {
        const senha = form.querySelector("#client-password").value;
        if (senha.length < 6) {
            exibirMensagem("Senha deve ter pelo menos 6 caracteres", false, form.querySelector("#client-password"));
            valido = false;
        }
    }
    
    return valido;
}

document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("search-client");
    if (searchInput) {
        searchInput.addEventListener("input", debounce(listarUsuarios, 300));
    }
    
    // Carregar dados iniciais
    listarUsuarios();
});

function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}
function listarUsuarios() {
    const searchTerm = document.getElementById("search-client").value.trim();
    
    fetch(`../PHP/controle_funcionarios.php?action=listar&search=${encodeURIComponent(searchTerm)}`)
        .then(res => res.json())
        .then(usuarios => {
            const tabela = document.getElementById("client-table-body");
            tabela.innerHTML = "";

            if (usuarios.length === 0) {
                tabela.innerHTML = `<tr><td colspan="7">Nenhum usuário encontrado</td></tr>`;
                return;
            }

            usuarios.forEach(usuario => {
                if (parseInt(usuario.funcionario) == 0 && parseInt(usuario.administrador) == 0) return;
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${usuario.id}</td>
                    <td>${usuario.nome}</td>
                    <td>${usuario.cpf}</td>
                    <td>${usuario.telefone}</td>
                    <td>${usuario.email}</td>
                    <td>
                        <button class="edit-button" onclick="abrirModalEditar(${usuario.id})">Editar</button>
                        <button class="delete-button" onclick="abrirModalDeletar(${usuario.id})">Deletar</button>
                    </td>
                `;
                tabela.appendChild(row);
            });
        })
        .catch(err => {
            console.error("Erro ao listar usuários:", err);
            const tabela = document.getElementById("client-table-body");
            tabela.innerHTML = `<tr><td colspan="7">Erro ao carregar usuários</td></tr>`;
        });
}

//function criarLinhaUsuario(usuario) {
//    return `
//        <tr>
//            <td>${usuario.id}</td>
//            <td>${usuario.nome}</td>
//            <td>${usuario.cpf}</td>
//            <td>${usuario.telefone}</td>
//            <td>${usuario.email}</td>
//            <td>${usuario.admin ? 'Sim' : 'Não'}</td>
//            <td>
//                <button class="edit-button" onclick="abrirModalEditar(${usuario.id})">Editar</button>
//                <button class="delete-button" onclick="abrirModalDeletar(${usuario.id})">Deletar</button>
//            </td>
//        </tr>
//    `;
//}

function abrirModalEditar(id) {
    if (!id || isNaN(id)) {
        enviarMensagemAjax("ID do usuário inválido", "erro");
        return;
    }

    fetch(`../PHP/controle_funcionarios.php?action=buscar&id=${id}`)
        .then(res => res.json())
        .then(usuario => {
            if (usuario.erro) {
                enviarMensagemAjax(usuario.erro, "erro");
                return;
            }

            // Preencher formulário
            const form = document.getElementById("client-form");
            document.getElementById("client-id").value = usuario.id;
            document.getElementById("client-name").value = usuario.nome;
            document.getElementById("client-cpf").value = usuario.cpf;
            document.getElementById("client-phone").value = usuario.telefone;
            document.getElementById("client-email").value = usuario.email;
            
            // Preencher campo funcionario
            const funcionarioInput = document.getElementById("client-funcionario");
            funcionarioInput.checked = usuario.funcionario === 1 ? true : false;
            // Adicione após a parte que preenche o campo funcionário
            const administradorInput = document.getElementById("client-administrador");
            administradorInput.checked = usuario.administrador === 1 ? true : false;

            //if (adminInput) {
            //    adminInput.checked = usuario.admin == 1;
            //}

            // Configurar placeholder da senha para edição
            const senhaInput = document.getElementById("client-password");
            if (senhaInput) {
                senhaInput.placeholder = "Deixe em branco para não alterar";
            }

            // Configurar modal para edição
            document.getElementById("modal-title").textContent = "Editar Usuário";
            form.setAttribute("data-action", "editar");
            document.querySelector("#client-form button[type='submit']").textContent = "Atualizar";
            
            openClientModal();
        })
        .catch(err => {
            console.error("Erro ao buscar usuário:", err);
            enviarMensagemAjax("Erro ao carregar dados do usuário", "erro");
        });
}

function openClientModal() {
    const modal = document.getElementById("client-modal");
    if (modal) {
        modal.style.display = "flex";
        
        // Se for modal de cadastro (não tem data-action="editar")
        const form = document.getElementById("client-form");
        if (form && !form.hasAttribute("data-action")) {
            const senhaInput = document.getElementById("client-password");
            if (senhaInput) {
                senhaInput.placeholder = "Obrigatório (mínimo 6 caracteres)";
                senhaInput.value = "";
            }
            
            // Resetar checkbox admin para cadastro
            const funcionarioInput = document.getElementById("client-funcionario");
            if (funcionarioInput) {
                funcionarioInput.checked = false;
            }
            // Adicione após a parte que reseta o checkbox funcionário
            const administradorInput = document.getElementById("client-administrador");
            if (administradorInput) {
                administradorInput.checked = false;
            }
        }
    }
}

function closeClientModal() {
    const modal = document.getElementById("client-modal");
    if (modal) {
        modal.style.display = "none";
        
        // Limpa o formulário
        const form = document.getElementById("client-form");
        if (form) {
            form.reset();
            form.removeAttribute("data-action");
            form.removeAttribute("data-id");
            form.removeAttribute("data-email-original");
            
            // Reseta o placeholder da senha
            const senhaInput = document.getElementById("client-password");
            if (senhaInput) {
                senhaInput.placeholder = "";
            }
            
            // Reseta o checkbox admin
            const funcionarioInput = document.getElementById("client-funcionario");
            if (funcionarioInput) {
                funcionarioInput.checked = false;
            }

            // Adicione após a parte que reseta o checkbox funcionário
            const administradorInput = document.getElementById("client-administrador");
            if (administradorInput) {
                administradorInput.checked = false;
            }
            
            // Reseta o título e texto do botão
            document.getElementById("modal-title").textContent = "Cadastrar Usuário";
            const submitButton = form.querySelector("button[type='submit']");
            if (submitButton) {
                submitButton.textContent = "Cadastrar";
            }
        }
    }
}

function abrirModalDeletar(id) {
    const confirmationModal = document.getElementById("confirmation-modal");
    if (!confirmationModal) return;
    
    confirmationModal.style.display = "flex";
    confirmationModal.setAttribute("data-id", id);
    confirmationModal.setAttribute("data-action", "deletar");
    
    // Atualizar mensagem
    const messageElement = document.getElementById("confirmation-message");
    if (messageElement) {
        messageElement.textContent = "Deseja realmente deletar este usuário?";
    }
}


function closeClientModal() {
    document.getElementById("client-modal").style.display = "none";
    document.getElementById("client-form").reset();
    document.getElementById("modal-title").textContent = "Cadastrar Usuário";
    document.getElementById("client-form").removeAttribute("data-action");
    document.getElementById("client-form").removeAttribute("data-id");
    document.querySelector("#client-form button[type='submit']").textContent = "Cadastrar";
}


async function verificarEmailExistente(email, idUsuario = null) {
    try {
        // Validação básica do email antes de enviar ao servidor
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            enviarMensagemAjax("Email inválido", "erro");
            throw new Error("Email inválido");
        }

        const url = `../PHP/controle_funcionarios.php?action=verificar_email&email=${encodeURIComponent(email)}${idUsuario ? `&id=${idUsuario}` : ''}`;
        
        const response = await fetch(url);
        const text = await response.text();
        
        // Verificar se é JSON válido
        let data;
        try {
            data = JSON.parse(text);
        } catch {
            throw new Error("Resposta inválida do servidor");
        }

        if (data.status !== "sucesso") {
            throw new Error(data.mensagem || "Erro ao verificar email");
        }

        return data.existe;
    } catch (error) {
        console.error("Erro ao verificar email:", error);
        throw error; // Propaga o erro para ser tratado por quem chamou
    }
}

// Atualização da função formatCPF
function formatCPF(event) {
    let input = event.target;
    let cpf = input.value.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    if (cpf.length > 11) {
        cpf = cpf.substring(0, 11);
    }
    
    // Aplica a formatação
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
function formatTelefone(event) {
    const input = event.target;
    let value = input.value.replace(/\D/g, ''); // Remove tudo que não é dígito
    
    // Limita a 11 caracteres (DDD + número)
    if (value.length > 11) {
        value = value.substring(0, 11);
    }
    
    // Aplica a formatação
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
    
    // Atualiza o valor do campo
    input.value = formattedValue;
    
    // Validação em tempo real
    const telefoneCompleto = value.length === 11;
    if (value.length > 0 && !telefoneCompleto) {
        exibirMensagem("Telefone incompleto", false, input);
        input.classList.add('campo-invalido');
    } else if (telefoneCompleto) {
        exibirMensagem("Telefone válido", true, input);
        input.classList.remove('campo-invalido');
    } else {
        limparMensagem(input);
        input.classList.remove('campo-invalido');
    }
    
    // Mantém o cursor na posição correta
    setTimeout(() => {
        const length = input.value.length;
        input.setSelectionRange(length, length);
    }, 0);
}


async function salvarUsuario(event) {
    event.preventDefault();
    
    try {
        const form = event.target;
        const action = form.getAttribute("data-action") || "cadastrar";
        
        // Obter elementos do formulário
        const idInput = document.getElementById("client-id");
        const nomeInput = document.getElementById("client-name");
        const cpfInput = document.getElementById("client-cpf");
        const telefoneInput = document.getElementById("client-phone");
        const emailInput = document.getElementById("client-email");
        const senhaInput = document.getElementById("client-password");
        const funcionarioInput = document.getElementById("client-funcionario");
        const administradorInput = document.getElementById("client-administrador");

        // Validar elementos existentes
        if (!nomeInput || !cpfInput || !telefoneInput || !emailInput) {
            enviarMensagemAjax("Erro no formulário. Recarregue a página.", "erro");
            throw new Error("Erro no formulário. Recarregue a página.");
        }

        // Obter valores
        const id = idInput ? idInput.value : null;
        const nome = nomeInput.value.trim();
        const cpf = cpfInput.value.replace(/\D/g, '');
        const telefone = telefoneInput.value.replace(/\D/g, '');
        const email = emailInput.value.trim();
        const senha = senhaInput ? senhaInput.value : null;
        const funcionario = funcionarioInput ? funcionarioInput.checked : false;
        const administrador = administradorInput ? administradorInput.checked : false;

        // Validações básicas
        if (!nome || nome.length < 3) {
            nomeInput.classList.add("campo-invalido");
            enviarMensagemAjax("Nome deve ter pelo menos 3 caracteres", "erro");
            throw new Error("Nome deve ter pelo menos 3 caracteres");
        }
        
        if (!validarCPF(cpf)) {
            cpfInput.classList.add("campo-invalido");
            enviarMensagemAjax("CPF inválido", "erro");
            throw new Error("CPF inválido");
        }
        
        if (!validarTelefone(telefone)) {
            telefoneInput.classList.add("campo-invalido");
            enviarMensagemAjax("Telefone deve ter 11 dígitos", "erro");
            throw new Error("Telefone deve ter 11 dígitos");
        }
        
        if (!validarEmail(email)) {
            emailInput.classList.add("campo-invalido");
            enviarMensagemAjax("Email inválido", "erro");
            throw new Error("Email inválido");
        }

        // Validação específica para cadastro
        if (action === "cadastrar") {
            if (!senha || senha.length < 6) {
                senhaInput.classList.add("campo-invalido");
                enviarMensagemAjax("Senha deve ter pelo menos 6 caracteres", "erro");
                throw new Error("Senha deve ter pelo menos 6 caracteres");
            }
        }

        // Verificar email duplicado (exceto para o próprio usuário em edição)
        if (action === "cadastrar" || email !== form.getAttribute("data-email-original")) {
            const emailExiste = await verificarEmailExistente(email, id);
            if (emailExiste) {
                emailInput.classList.add("campo-invalido");
                enviarMensagemAjax("Email já cadastrado", "erro");
                throw new Error("Email já cadastrado");
            }
        }

        // Preparar dados para envio
        const formData = new FormData(form);
        
        // Se for edição e senha está vazia, remover do FormData
        if (action === "editar" && (!senha || senha.trim() === "")) {
            formData.delete("senha");
        }

        // Adicionar admin ao FormData
        formData.append("funcionario", funcionario ? '1' : '0');
        formData.append("administrador", administrador ? '1' : '0');

        // Enviar dados
        const response = await fetch(`../PHP/controle_funcionarios.php?action=${action}`, {
            method: "POST",
            body: formData
        });

        // Verificar resposta
        const data = await response.json();
        
        if (!data || data.status !== "sucesso") {
            throw new Error(data.mensagem || data.erro || "Erro no servidor");
        }

        // Feedback e atualização
        enviarMensagemAjax(data.mensagem, "sucesso");
        setTimeout(() => {
            window.location.reload();
        }, 350);
        listarUsuarios();
        closeClientModal();

    } catch (error) {
        console.error("Erro ao salvar usuário:", error);
        enviarMensagemAjax(error.message, "erro");
        
        // Rolagem para o primeiro campo inválido
        const primeiroCampoInvalido = document.querySelector(".campo-invalido");
        if (primeiroCampoInvalido) {
            primeiroCampoInvalido.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}

// Funções auxiliares de validação
function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
    
    // Cálculo dos dígitos verificadores
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

function validarTelefone(telefone) {
    return telefone.length === 11; // 11 dígitos (DDD + número)
}

function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function verificarEmailExistente(email, id = null) {
    try {
        const url = `../PHP/controle_funcionarios.php?action=verificar_email&email=${encodeURIComponent(email)}${id ? `&id=${id}` : ''}`;
        const response = await fetch(url);
        const data = await response.json();
        return data.existe === true;
    } catch (error) {
        console.error("Erro ao verificar email:", error);
        return false;
    }
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
