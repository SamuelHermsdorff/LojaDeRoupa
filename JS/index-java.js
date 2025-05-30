document.addEventListener("DOMContentLoaded", function() {
    const loginForm = document.getElementById("login-form");
    
    if (loginForm) {
        loginForm.addEventListener("submit", function(e) {
            e.preventDefault(); // Impede o envio tradicional do formulário
            
            const btn = this.querySelector('button[type="submit"]');
            const btnOriginalText = btn.textContent;
            btn.disabled = true;
            btn.textContent = "Entrando...";
            
            // Coleta os dados do formulário
            const formData = new FormData(this);
            
            // Envia via AJAX
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
    // Elementos do DOM
    const cpfInput = document.getElementById("cpf");
    const telefoneInput = document.getElementById("telefone");
    const formCadastro = document.querySelector('.register-box form');
    const formLogin = document.querySelector('.login-box form');
    
    // Variável para controlar o estado do cadastro
    let cadastroEmAndamento = false;

    // Função para alternar entre login e cadastro
    function toggleForm() {
        document.querySelector(".login-box").classList.toggle("active");
        document.querySelector(".register-box").classList.toggle("active");
    }

    // Formatação e validação do CPF
    function formatCPF(event) {
        const input = event.target;
        let cpf = input.value.replace(/\D/g, '');
        
        // Limita a 11 dígitos
        if (cpf.length > 11) {
            cpf = cpf.substring(0, 11);
        }
        
        // Aplica a formatação
        if (cpf.length > 9) {
            cpf = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        } else if (cpf.length > 6) {
            cpf = cpf.replace(/(\d{3})(\d{3})(\d{3})/, '$1.$2.$3');
        } else if (cpf.length > 3) {
            cpf = cpf.replace(/(\d{3})(\d{3})/, '$1.$2');
        }
        
        input.value = cpf;
        
        // Validação quando completo (14 caracteres com formatação)
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
        
        // Elimina CPFs inválidos conhecidos
        if (cpf.length !== 11 || 
            cpf === "00000000000" || 
            cpf === "11111111111" || 
            cpf === "22222222222" || 
            cpf === "33333333333" || 
            cpf === "44444444444" || 
            cpf === "55555555555" || 
            cpf === "66666666666" || 
            cpf === "77777777777" || 
            cpf === "88888888888" || 
            cpf === "99999999999") {
            return false;
        }
        
        // Valida 1º dígito
        let soma = 0;
        for (let i = 0; i < 9; i++) {
            soma += parseInt(cpf.charAt(i)) * (10 - i);
        }
        let resto = 11 - (soma % 11);
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(cpf.charAt(9))) return false;
        
        // Valida 2º dígito
        soma = 0;
        for (let i = 0; i < 10; i++) {
            soma += parseInt(cpf.charAt(i)) * (11 - i);
        }
        resto = 11 - (soma % 11);
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(cpf.charAt(10))) return false;
        
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
        
        // Limita a 11 dígitos
        if (telefone.length > 11) {
            telefone = telefone.substring(0, 11);
        }
        
        // Aplica a formatação
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
        
        // Configura estado de loading
        btn.disabled = true;
        btn.textContent = 'Cadastrando...';
        
        try {
            const response = await fetch('PHP/cadastrar.php', {
                method: 'POST',
                body: new FormData(formCadastro)
            });

            // Verifica se a resposta está vazia
            const responseText = await response.text();
            if (!responseText.trim()) {
                throw new Error('Resposta vazia do servidor');
            }

            // Tenta parsear o JSON
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
                    toggleForm();
                    window.location.reload();
                }, 800);
            } else {
                throw new Error(data.mensagem || 'Erro no cadastro');
            }
        } catch (error) {
            exibirMensagem(error.message, 'erro');
            
            // Mostra mensagem específica para CPF existente
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
        // Remove mensagens anteriores
        const mensagensAntigas = document.querySelectorAll('.mensagem-flutuante');
        mensagensAntigas.forEach(msg => msg.remove());
        
        // Cria nova mensagem
        const mensagemDiv = document.createElement('div');
        mensagemDiv.className = `mensagem-flutuante ${tipo}`;
        mensagemDiv.textContent = mensagem;
        
        // Estilos
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
        
        // Remove após 5 segundos
        setTimeout(() => {
            mensagemDiv.style.animation = 'fadeOut 0.3s ease-in-out';
            setTimeout(() => mensagemDiv.remove(), 300);
        }, 5000);
    }

    // Event Listeners
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
    
    // Botão "Cadastre-se"
    document.querySelectorAll(".toggle").forEach(toggle => {
        toggle.addEventListener("click", function(e) {
            e.preventDefault();
            toggleForm();
        });
    });
});


function formatNome(event) {
    let nome = event.target.value.replace(/[^a-zA-ZÀ-ÖØ-öø-ÿ\s]/g, '');
    event.target.value = nome;
}

/*
        setTimeout(() => {
            window.location.reload();
        }, 200)
*/
