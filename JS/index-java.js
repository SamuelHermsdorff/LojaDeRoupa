document.addEventListener("DOMContentLoaded", function() {
    // Formulários
    const loginForm = document.getElementById("login-form");
    const formCadastro = document.querySelector('.register-box form');
    const forgotForm = document.getElementById("forgot-form"); // Novo formulário
    
    // Boxes
    const loginBox = document.querySelector('.login-box');
    const registerBox = document.querySelector('.register-box');
    const forgotBox = document.querySelector('.forgot-box'); // Novo box

    // Elementos de input
    const cpfInput = document.getElementById("cpf");
    const telefoneInput = document.getElementById("telefone");
    
    // Variável para controlar o estado do cadastro
    let cadastroEmAndamento = false;

    // --- NOVA LÓGICA DE EXIBIÇÃO ---
    // Função para mostrar um box específico e esconder os outros
    function showBox(boxName) {
        // Esconde todos
        loginBox.classList.remove('active');
        registerBox.classList.remove('active');
        forgotBox.classList.remove('active');

        // Mostra o box desejado
        if (boxName === 'login') {
            loginBox.classList.add('active');
        } else if (boxName === 'register') {
            registerBox.classList.add('active');
        } else if (boxName === 'forgot') {
            forgotBox.classList.add('active');
        }
    }

    // --- NOVOS EVENT LISTENERS PARA OS LINKS ---
    // Link "Cadastre-se" (na tela de login)
    document.querySelector('.login-box .toggle-register').addEventListener('click', function() {
        showBox('register');
    });

    // Link "Esqueci minha senha" (na tela de login)
    document.querySelector('.login-box .toggle-forgot').addEventListener('click', function() {
        showBox('forgot');
    });

    // Links "Voltar ao login" (nas telas de cadastro e recuperação)
    document.querySelectorAll('.toggle-login').forEach(toggle => {
        toggle.addEventListener('click', function() {
            showBox('login');
        });
    });


    // --- LÓGICA DE LOGIN (Existente) ---
    if (loginForm) {
        loginForm.addEventListener("submit", function(e) {
            e.preventDefault(); 
            
            const btn = this.querySelector('button[type="submit"]');
            const btnOriginalText = btn.textContent;
            btn.disabled = true;
            btn.textContent = "Entrando...";
            
            const formData = new FormData(this);
            
            fetch('PHP/login.php', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro na rede');
                }
                return response.json();
            })
            .then(data => {
                if (data.status === 'sucesso') {
                    exibirMensagem(data.mensagem || "Login realizado com sucesso!", "sucesso");
                    setTimeout(() => {
                        window.location.href = data.redirect || 'HTML/catalogo.php';
                    }, 300);
                } else {
                    throw new Error(data.mensagem || "Erro ao fazer login");
                }
            })
            .catch(error => {
                exibirMensagem(error.message, "erro");
            })
            .finally(() => {
                btn.disabled = false;
                btn.textContent = btnOriginalText;
            });
        });
    }

    // --- NOVA LÓGICA PARA RECUPERAR SENHA ---
    if (forgotForm) {
        forgotForm.addEventListener("submit", function(e) {
            e.preventDefault();

            const btn = this.querySelector('button[type="submit"]');
            const btnOriginalText = btn.textContent;
            btn.disabled = true;
            btn.textContent = "Enviando...";
            
            const formData = new FormData(this);

            fetch('PHP/recuperar_senha.php', { // Chama o novo script PHP
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'sucesso') {
                    exibirMensagem(data.mensagem, "sucesso");
                    // Volta para o login após 2 segundos
                    setTimeout(() => {
                        showBox('login'); 
                    }, 2000);
                } else {
                    throw new Error(data.mensagem || "Erro ao solicitar recuperação.");
                }
            })
            .catch(error => {
                exibirMensagem(error.message, "erro");
            })
            .finally(() => {
                btn.disabled = false;
                btn.textContent = btnOriginalText;
            });
        });
    }


    // --- RESTANTE DO SEU JS (Formatações, Validações, Cadastro) ---
    // Nenhuma alteração necessária abaixo desta linha

    // Formatação e validação do CPF
    function formatCPF(event) {
        const input = event.target;
        let cpf = input.value.replace(/\D/g, '');
        
        if (cpf.length > 11) {
            cpf = cpf.substring(0, 11);
        }
        
        if (cpf.length > 9) {
            cpf = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        } else if (cpf.length > 6) {
            cpf = cpf.replace(/(\d{3})(\d{3})(\d{3})/, '$1.$2.$3');
        } else if (cpf.length > 3) {
            cpf = cpf.replace(/(\d{3})(\d{3})/, '$1.$2');
        }
        
        input.value = cpf;
        
        if (cpf.length === 14) {
            const valido = validarCPF(cpf);
            exibirMensagemCPF(valido ? "CPF válido" : "CPF inválido", valido);
        } else {
            limparMensagemCPF();
        }
    }

    // Função para validar CPF
    function validarCPF(cpf) {
        cpf = cpf.replace(/\D/g, '');
        
        if (cpf.length !== 11 || 
            /^(\d)\1{10}$/.test(cpf)) { // Simplifica a verificação de CPFs inválidos
            return false;
        }
        
        let soma = 0;
        let resto;

        for (let i = 1; i <= 9; i++) {
            soma += parseInt(cpf.substring(i-1, i)) * (11 - i);
        }
        resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(cpf.substring(9, 10))) return false;

        soma = 0;
        for (let i = 1; i <= 10; i++) {
            soma += parseInt(cpf.substring(i-1, i)) * (12 - i);
        }
        resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(cpf.substring(10, 11))) return false;
        
        return true;
    }

    // Exibe mensagem abaixo do campo CPF
    function exibirMensagemCPF(mensagem, valido) {
        let container = document.getElementById('cpf-mensagem');
        
        if (!container) {
            container = document.createElement('div');
            container.id = 'cpf-mensagem';
            container.style.cssText = `
                margin-top: 1px;
                font-size: 0.75rem;
                min-height: 18px;
                padding-left: 0;
                text-align: left;
                margin-right: 18.0rem;
            `;
            cpfInput.insertAdjacentElement('afterend', container);
        }
        
        if (mensagem) {
            container.innerHTML = `
                <span style="color: ${valido ? '#28a745' : '#dc3545'}; 
                        font-weight: 500;
                        display: inline-block;
                        text-align: left;
                        margin-left: 0;
                        padding-left: 0;">
                    ${mensagem}
                </span>
            `;
        } else {
            container.innerHTML = '';
        }
    }

    // Limpa a mensagem do CPF
    function limparMensagemCPF() {
        const container = document.getElementById('mensagem-cpf-container');
        if (container) {
            container.innerHTML = '';
        }
    }

    // Formatação do telefone
    function formatTelefone(event) {
        const input = event.target;
        let telefone = input.value.replace(/\D/g, '');
        
        if (telefone.length > 11) {
            telefone = telefone.substring(0, 11);
        }
        
        if (telefone.length > 10) {
            telefone = telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (telefone.length > 6) {
            telefone = telefone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        } else if (telefone.length > 2) {
            telefone = telefone.replace(/(\d{2})(\d{4})/, '($1) $2');
        } else if (telefone.length > 0) {
            telefone = telefone.replace(/(\d{2})/, '($1)');
        }
        
        input.value = telefone;
    }

    // Envio do formulário de cadastro
    async function enviarCadastro() {
        if (cadastroEmAndamento) return;
        cadastroEmAndamento = true;

        const btn = formCadastro.querySelector('button[type="submit"]');
        const btnOriginalText = btn.textContent;
        
        btn.disabled = true;
        btn.textContent = 'Cadastrando...';
        
        try {
            const response = await fetch('PHP/cadastrar.php', {
                method: 'POST',
                body: new FormData(formCadastro)
            });

            const responseText = await response.text();
            if (!responseText.trim()) {
                throw new Error('Resposta vazia do servidor');
            }

            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                throw new Error('Resposta inválida do servidor');
            }

            if (!response.ok) {
                throw new Error(data.mensagem || `Erro ${response.status}`);
            }

            if (data.status === 'sucesso') {
                exibirMensagem('Cadastro realizado com sucesso!', 'sucesso');
                formCadastro.reset();
                setTimeout(() => {
                    showBox('login'); // Volta pro login
                    // window.location.reload(); // Recarregar pode não ser necessário
                }, 800);
            } else {
                throw new Error(data.mensagem || 'Erro no cadastro');
            }
        } catch (error) {
            exibirMensagem(error.message, 'erro');
            
            if (error.message.includes('CPF já cadastrado')) {
                exibirMensagemCPF('CPF já cadastrado', false);
            }
        } finally {
            btn.disabled = false;
            btn.textContent = btnOriginalText;
            cadastroEmAndamento = false;
        }
    }

    // Exibe mensagens gerais
    function exibirMensagem(mensagem, tipo) {
        const mensagensAntigas = document.querySelectorAll('.mensagem-flutuante');
        mensagensAntigas.forEach(msg => msg.remove());
        
        const mensagemDiv = document.createElement('div');
        mensagemDiv.className = `mensagem-flutuante ${tipo}`;
        mensagemDiv.textContent = mensagem;
        
        Object.assign(mensagemDiv.style, {
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '15px 25px',
            borderRadius: '5px',
            backgroundColor: tipo === 'sucesso' ? '#4CAF50' : '#F44336',
            color: 'white',
            zIndex: '1000',
            animation: 'fadeIn 0.3s ease-in-out'
        });
        
        document.body.appendChild(mensagemDiv);
        
        setTimeout(() => {
            mensagemDiv.style.animation = 'fadeOut 0.3s ease-in-out';
            setTimeout(() => mensagemDiv.remove(), 300);
        }, 5000);
    }

    // Event Listeners (Inputs e Forms)
    if (cpfInput) {
        cpfInput.addEventListener('input', formatCPF);
    }
    
    if (telefoneInput) {
        telefoneInput.addEventListener('input', formatTelefone);
    }
    
    if (formCadastro) {
        formCadastro.addEventListener('submit', function(e) {
            e.preventDefault();
            enviarCadastro();
        });
    }

    // (Lógica de toggle removida daqui e substituída no início)
});

function formatNome(event) {
    let nome = event.target.value.replace(/[^a-zA-ZÀ-ÖØ-öø-ÿ\s]/g, '');
    event.target.value = nome;
}
