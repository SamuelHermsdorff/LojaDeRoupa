async function criarSidebar() {
    let usuario_funcionario;
    let usuario_administrador;

    try {
        // Requisição para pegar os dados do usuário
        const response = await fetch('../PHP/get_usuario.php');
        const data = await response.json();

        if (data.status === "sucesso") {
            const usuario = data.usuario;
            usuario_funcionario = usuario.funcionario;
            usuario_administrador = usuario.administrador;
        } else {
            console.error("Erro ao carregar os dados do usuário:", data.mensagem);
            return; // Retorna aqui para não continuar com a execução se houver erro
        }
    } catch (error) {
        console.error("Erro na requisição ou processamento dos dados:", error);
        return; // Retorna aqui para não continuar com a execução em caso de erro
    }

    // Agora que temos o valor de usuario_admin, podemos construir a sidebar
    const funcionario = `
        <li class="submenu" onclick="toggleSubmenu(this)">
            <span>Funcionário</span>
            <ul class="submenu-items">
                <li onclick="window.location.href='controle_pedidos.php'">Gerenciar Pedidos</li>
                <li onclick="window.location.href='controle_produtos.php'">Gerenciar Produtos</li>
                <li onclick="window.location.href='controle_clientes.php'">Gerenciar Clientes</li>
                <li onclick="window.location.href='controle_fornecedores.php'">Gerenciar Fornecedores</li>
                <li onclick="window.location.href='registrar_venda.php'">Registrar Venda</li>
            </ul>
        </li>
    `;

    const administrador = `
        <li class="submenu" onclick="toggleSubmenu(this)">
            <span>Administrador</span>
            <ul class="submenu-items">
                <li onclick="window.location.href='controle_pedidos.php'">Gerenciar Pedidos</li>
                <li onclick="window.location.href='controle_produtos.php'">Gerenciar Produtos</li>
                <li onclick="window.location.href='controle_clientes.php'">Gerenciar Clientes</li>
                <li onclick="window.location.href='controle_funcionarios.php'">Gerenciar Funcionários</li>
                <li onclick="window.location.href='controle_fornecedores.php'">Gerenciar Fornecedores</li>
                <li onclick="window.location.href='registrar_venda.php'">Registrar Venda</li>
            </ul>
        </li>
    `;

    const client = `
    <div class="sidebar" id="sidebar">
        <h2 class="menu-title">Menu</h2>
        <ul>
            <li onclick="window.location.href='catalogo.php'">Tela Inicial</li>
            <li onclick="window.location.href='perfil.php'">Meu Perfil</li>
            <li onclick="window.location.href='carrinho.php'">Carrinho</li>

            <li class="submenu" onclick="toggleSubmenu(this)">
                <span>Cliente</span>
                <ul class="submenu-items">
                    <li onclick="window.location.href='minhas_compras.php'">Minhas compras</li>
                </ul>
            </li>

            ${usuario_administrador > 0 ? administrador : usuario_funcionario > 0 ? funcionario : ''}

            <li onclick="window.location.href='../PHP/logout.php'">Sair</li>
        </ul>
    </div>
    `;

    document.body.insertAdjacentHTML('afterbegin', client);
}

function toggleMenu() {
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.toggle("active");
}

// Função para alternar a visibilidade do submenu
function toggleSubmenu(element) {
    // Pegue o li que contém o submenu
    const submenu = element.parentElement;    
    //const submenu = element.querySelector('ul');  // Agora seleciona o 'ul' dentro do 'li'

    // Alterna a classe 'open' no submenu
    if (submenu) {
        element.classList.toggle('active');
    }
}

document.addEventListener("click", (event) => {
    const sidebar = document.getElementById("sidebar");
    const menuButton = document.querySelector(".menu-button");

    if (sidebar && menuButton) {
        if (!sidebar.contains(event.target) && !menuButton.contains(event.target)) {
            sidebar.classList.remove("active");
        }
    }
});

