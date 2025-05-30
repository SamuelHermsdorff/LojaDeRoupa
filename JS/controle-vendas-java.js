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

const submenus = document.querySelectorAll(".submenu");

submenus.forEach(submenu => {
    submenu.addEventListener("click", () => {
        submenu.classList.toggle("active");
    });
});

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

    
function confirmSend() {
    const modal = document.getElementById("confirmation-modal");
    modal.style.display = "flex";
}

function confirmAction() {
    alert("Status atualizado para 'Produto Enviado'");
    closeModal();
}

function closeModal() {
    const modal = document.getElementById("confirmation-modal");
    modal.style.display = "none";
}

function showCustomerDetails() {
    const modal = document.getElementById("customer-details-modal");
    modal.style.display = "flex";
}

function closeCustomerDetailsModal() {
    const modal = document.getElementById("customer-details-modal");
    modal.style.display = "none";
}
