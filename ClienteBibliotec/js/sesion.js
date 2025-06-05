const API_BASE_URL = 'http://localhost/ProyectoFinDeGrado/APIbiblioteca/public/api';

function showAlert(message, type = "danger") {
    const alertBox = document.getElementById("alert-container");
    alertBox.className = `alert alert-${type}`;
    alertBox.textContent = message;
    alertBox.classList.remove("d-none");
}

function login() {
    // Limpiar alertas previas
    const alertBox = document.getElementById("alert-container");
    alertBox.classList.add("d-none");
    const email = document.getElementById("email").value.trim();
    const ps = document.getElementById("ps").value.trim();
    if (!email || !ps) {
        showAlert("Por favor, rellene todos los campos.", "warning");
        return;
    }
    const datos = { email, password: ps };
    axios.post(`${API_BASE_URL}/login`, datos)
        .then(response => {
            const token = response.data.token;
            const rol = response.data.usuario.tipo;
            console.log("usuario:", response.data.usuario);
            if(response.data.usuario.tipo!=='A') {
            const us = response.data.usuario.name;
            const id = response.data.socio.id;
            localStorage.setItem("token", token);
            localStorage.setItem("us", us);
            localStorage.setItem("id_usuario", response.data.usuario.id);
            localStorage.setItem("id_socio", id);
            localStorage.setItem("rol", rol);
            }else {
                localStorage.setItem("token", token);
                localStorage.setItem("us", response.data.usuario.name);
                 localStorage.setItem("rol", rol);
                 localStorage.setItem("id_usuario", response.data.usuario.id);
            }
            showAlert("Sesión iniciada correctamente. Redirigiendo...", "success");
            setTimeout(() => window.location.href = "index.html", 1500);
        })
        .catch(error => {
            setTimeout(() => {
                showAlert("credenciales incorrectas , intente nuevamente", "danger");
            }, 1500);
            console.error(error);
        });
}

function register() {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const ps = document.getElementById("ps").value.trim();
    const confirmPs = document.getElementById("confirmPs").value.trim();
    if (!name || !email || !ps || !confirmPs) {
        showAlert("Por favor, rellene todos los campos.", "warning");
        return;
    }
    if (ps !== confirmPs) {
        showAlert("Las contraseñas no coinciden.", "warning");
        return;
    }
    const datos = {
        name,
        email,
        password: ps,
        password_confirmation: confirmPs
    };
    axios.post(`${API_BASE_URL}/register`, datos)
        .then(response => {
            showAlert("¡Registro exitoso! Redirigiendo...", "success");
            setTimeout(() => window.location.href = "login.html", 1500);
        })
        .catch(error => {
            showAlert(error.response?.data?.error || "Error en el registro", "danger");
            console.error(error);
        });
}
/* ----------  CONFIG GLOBAL  ---------- */

const token = localStorage.getItem('token');
if (token) {
    window.location.href = 'index.html';
}