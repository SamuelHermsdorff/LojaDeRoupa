window.onload = function() {
    fetch('../PHP/get_usuario.php')
        .then(response => response.json())
        .then(data => {
            if (data.status === "sucesso") {
                const usuario = data.usuario;

                // Preenchendo as informações pessoais
                //document.getElementById("user-id").textContent = usuario.id;
                document.getElementById("user-name").textContent = usuario.nome;
                document.getElementById("user-email").textContent = usuario.email;
                document.getElementById("user-cpf").textContent = usuario.cpf;
                document.getElementById("user-phone").textContent = usuario.telefone;

            } else {
                console.error("Erro ao carregar os dados do usuário:", data.mensagem);
            }
        })
        .catch(error => {
            console.error("Erro na requisição ou processamento dos dados:", error);
        });
};

function openEditModal(type) {
  const modal = document.getElementById("edit-modal");
  const form = document.getElementById("edit-form");
  let fields = "";

  if (type === "personal-info") {
    document.getElementById("modal-title").textContent = "Editar Informações Pessoais";
    fields = `
      <label for="edit-name">Nome:</label>
      <input type="text" id="edit-name" value="${document.getElementById("user-name").textContent}" maxlength="45" oninput="formatNome(event) ">
      <label for="edit-phone">Telefone:</label>
      <input type="text" id="edit-phone" value="${document.getElementById("user-phone").textContent}" maxlength="15" oninput="formatTelefone(event) ">
    `;
  }

  form.innerHTML = fields;
  modal.style.display = "flex";
}

function closeEditModal() {
  const modal = document.getElementById("edit-modal");
  modal.style.display = "none";
}

//function saveChanges() {
//  const modal = document.getElementById("edit-modal");
//
//  // Coletando os novos valores dos campos
//  const newName = document.getElementById("edit-name").value;
//  const newPhone = document.getElementById("edit-phone").value;
//
//  // Atualizando as informações no HTML
//  document.getElementById("user-name").textContent = newName;
//  document.getElementById("user-phone").textContent = newPhone;
//
//  // Fechando o modal
//  closeEditModal();
//
//  // Enviar os dados para o backend para salvar as alterações
//  fetch('../PHP/atualizar_usuario.php', {
//    method: 'POST',
//    headers: {
//      'Content-Type': 'application/json'
//    },
//    body: JSON.stringify({
//      nome: newName,
//      telefone: newPhone
//    })
//  })
//  .then(response => response.json())
//  .then(data => {
//    if (data.status === "sucesso") {
//      //alert("Informações atualizadas com sucesso!");
//    } else {
//      //alert("Erro ao atualizar as informações.");
//    }
//  })
//  .catch(error => {
//    console.error("Erro ao enviar os dados para o backend:", error);
//  });
//}

function formatNome(event) {
    let nome = event.target.value.replace(/[^a-zA-ZÀ-ÖØ-öø-ÿ\s]/g, '');

    event.target.value = nome;
}
function formatTelefone(event) {
    let telefone = event.target.value.replace(/\D/g, '');

    if (telefone.length > 11) {
        telefone = telefone.substring(0, 11);
    }

    telefone = telefone.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');

    event.target.value = telefone;
}

// Função para validar o formulário
function validateForm() {
    // Obter os valores dos campos
    const nome = document.getElementById('user-name').value;
    const telefone = document.getElementById('user-phone').value;

    // Verificar se o nome está vazio
    if (nome.trim() === "") {
        mostrarMensagem("O nome não pode estar vazio!", "erro");
        return false; // Não envia o formulário
    }

    // Verificar se o telefone tem o tamanho correto (considerando o formato de telefone com 15 caracteres: (XX) XXXXX-XXXX)
    const telefoneRegex = /^\(\d{2}\)\s\d{5}-\d{4}$/;
    if (!telefoneRegex.test(telefone)) {
        mostrarMensagem("O telefone deve ter o formato: (XX) XXXXX-XXXX", "erro");
        return false; // Não envia o formulário
    }

    // Se todas as validações passarem, o formulário será enviado
    return true;
}

// Função para mostrar a mensagem de sucesso ou erro na tela
function mostrarMensagem(mensagem, tipo) {
    const divMensagem = document.getElementById('mensagem');
    divMensagem.textContent = mensagem;
    
    // Adiciona a classe de sucesso ou erro
    divMensagem.classList.remove('sucesso', 'erro');
    divMensagem.classList.add(tipo);
    
    // Exibe a mensagem
    divMensagem.style.display = 'block';
    
    // Esconde a mensagem após 5 segundos
    setTimeout(() => {
        divMensagem.style.display = 'none';
    }, 5000);
}

function saveChanges(event) {
    const nome = document.getElementById("edit-name").value;
    const telefone = document.getElementById("edit-phone").value;

    const dados = { nome, telefone };

    closeEditModal();

    fetch('../PHP/atualizar_usuario.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados),
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'sucesso') {
            mostrarMensagem("Dados atualizados!", "sucesso");
            document.getElementById("user-name").textContent = nome;
            document.getElementById("user-phone").textContent = telefone;
        } else {
            mostrarMensagem("Não foi possível atualizar os dados.", "erro");
        }
    })
    .catch(error => {
        mostrarMensagem("Erro ao enviar os dados", "erro");
    });
}
