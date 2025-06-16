document.addEventListener('DOMContentLoaded', function() {
    // --- CLAVE GLOBAL PARA USUARIOS ---
    const USERS_DB_KEY = 'tuDeliveryPrivadoUsers';
    const CURRENT_USER_SESSION_KEY = 'currentUser';

    // --- FUNCIONES AUXILIARES DE ALMACENAMIENTO Y MENSAJES ---
    function getUsersFromStorage() {
        const users = localStorage.getItem(USERS_DB_KEY);
        return users ? JSON.parse(users) : [];
    }

    function saveUsersToStorage(users) {
        localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
    }

    function getCurrentUserFromSession() {
        const user = sessionStorage.getItem(CURRENT_USER_SESSION_KEY);
        return user ? JSON.parse(user) : null;
    }

    function saveCurrentUserToSession(userData) {
        sessionStorage.setItem(CURRENT_USER_SESSION_KEY, JSON.stringify(userData));
    }

    function clearCurrentUserSession() {
        sessionStorage.removeItem(CURRENT_USER_SESSION_KEY);
    }
    
    function showMessage(element, message, type = 'error') {
        if (!element) return;
        element.textContent = message;
        element.className = `message ${type}`;
        element.style.display = 'block';
    }

    function hideMessage(element) {
        if (!element) return;
        element.style.display = 'none';
    }

    // Función global para manejar visibilidad de contraseñas
    window.togglePasswordVisibility = function(inputId) {
        const passwordInput = document.getElementById(inputId);
        // El selector del checkbox necesita ser más específico si hay múltiples checkboxes con esta función
        // En este caso, buscaremos el checkbox que está justo después del input (o en su wrapper)
        // Por simplicidad, y como los checkboxes tienen IDs únicos ahora:
        const checkbox = document.getElementById(inputId.replace('password', 'showPassword').replace('Password', 'showPassword'));

        if (passwordInput && checkbox) {
            passwordInput.type = checkbox.checked ? 'text' : 'password';
        } else if (passwordInput) { // Fallback por si la estructura del checkbox es diferente
            const relatedCheckbox = document.querySelector(`input[type="checkbox"][onclick*="${inputId}"]`);
            if (relatedCheckbox) {
                 passwordInput.type = relatedCheckbox.checked ? 'text' : 'password';
            }
        }
    }

    // --- INICIALIZACIÓN DE USUARIOS POR DEFECTO ---
    function initializeDefaultUsers() {
        let users = getUsersFromStorage();
        if (!users.find(user => user.username === 'admin')) {
            users.push({
                username: 'admin', password: 'admin', role: 'admin',
                fullName: 'Administrador del Sistema', phone: '000000000',
                address: 'Oficina Central', email: 'admin@example.com'
            });
        }
        if (!users.find(user => user.username === 'demo')) {
            users.push({
                username: 'demo', password: 'demo', role: 'cliente',
                fullName: 'Usuario Demo Ejemplo', phone: '111111111',
                address: 'Calle Falsa 123', email: 'demo@example.com'
            });
        }
        saveUsersToStorage(users);
    }
    
    // Ejecutar inicialización de usuarios una vez
    if (localStorage.getItem('usersInitialized') !== 'true') {
        initializeDefaultUsers();
        localStorage.setItem('usersInitialized', 'true'); // Marcar como inicializado
    }


    // --- LÓGICA ESPECÍFICA DE CADA PÁGINA ---
    const currentPage = window.location.pathname.split("/").pop(); // Obtiene el nombre del archivo HTML

    // --- LÓGICA PARA login.html ---
    if (currentPage === 'login.html') {
        const loginForm = document.getElementById('loginForm');
        const registrationForm = document.getElementById('registrationForm');
        const showRegisterLink = document.getElementById('showRegisterLink');
        const showLoginLink = document.getElementById('showLoginLink');
        const usernameLoginInput = document.getElementById('usernameLogin');
        const passwordLoginInput = document.getElementById('passwordLogin');
        const rememberMeCheckbox = document.getElementById('rememberMe');
        const loginMessageDiv = document.getElementById('loginMessage');
        
        // Cargar usuario recordado
        const rememberedUser = localStorage.getItem('rememberedUserLogin');
        if (rememberedUser && usernameLoginInput) {
            usernameLoginInput.value = rememberedUser;
            if(rememberMeCheckbox) rememberMeCheckbox.checked = true;
        }

        if (loginForm) {
            loginForm.addEventListener('submit', function(event) {
                event.preventDefault();
                hideMessage(loginMessageDiv);
                const username = usernameLoginInput.value.trim();
                const password = passwordLoginInput.value;
                const users = getUsersFromStorage();
                const foundUser = users.find(user => user.username === username && user.password === password);

                if (foundUser) {
                    saveCurrentUserToSession({ username: foundUser.username, role: foundUser.role });
                    if (rememberMeCheckbox && rememberMeCheckbox.checked) {
                        localStorage.setItem('rememberedUserLogin', username);
                    } else {
                        localStorage.removeItem('rememberedUserLogin');
                    }
                    showMessage(loginMessageDiv, `Bienvenido ${foundUser.username}! Redirigiendo...`, 'success');
                    setTimeout(() => {
                        if (foundUser.role === 'admin') window.location.href = 'administrador.html';
                        else if (foundUser.role === 'cliente') window.location.href = 'cliente.html';
                    }, 1500);
                } else {
                    showMessage(loginMessageDiv, 'Usuario o contraseña incorrectos.', 'error');
                }
            });
        }

        if (registrationForm) {
            const fullNameRegInput = document.getElementById('fullNameReg');
            const usernameRegInput = document.getElementById('usernameReg');
            const phoneRegInput = document.getElementById('phoneReg');
            const passwordRegInput = document.getElementById('passwordReg');
            const confirmPasswordRegInput = document.getElementById('confirmPasswordReg');
            const addressRegInput = document.getElementById('addressReg');
            const emailRegInput = document.getElementById('emailReg');
            const registerMessageDiv = document.getElementById('registerMessage');

            registrationForm.addEventListener('submit', function(event) {
                event.preventDefault();
                hideMessage(registerMessageDiv);
                const password = passwordRegInput.value;
                const confirmPassword = confirmPasswordRegInput.value;

                if (password !== confirmPassword) {
                    showMessage(registerMessageDiv, 'Las contraseñas no coinciden.', 'error'); return;
                }
                if (password.length < 4) {
                    showMessage(registerMessageDiv, 'La contraseña debe tener al menos 4 caracteres.', 'error'); return;
                }

                let users = getUsersFromStorage();
                const username = usernameRegInput.value.trim();
                const email = emailRegInput.value.trim();

                if (users.find(user => user.username === username)) {
                    showMessage(registerMessageDiv, 'El nombre de usuario ya existe.', 'error'); return;
                }
                if (users.find(user => user.email === email)) {
                    showMessage(registerMessageDiv, 'El correo electrónico ya está registrado.', 'error'); return;
                }

                const newUser = {
                    fullName: fullNameRegInput.value.trim(), username, phone: phoneRegInput.value.trim(),
                    password, address: addressRegInput.value.trim(), email, role: 'cliente'
                };
                users.push(newUser);
                saveUsersToStorage(users);
                showMessage(registerMessageDiv, '¡Registro exitoso! Ahora puedes iniciar sesión.', 'success');
                registrationForm.reset();
                setTimeout(() => showLoginForm(), 2000);
            });
        }

        function showRegistrationFormView() {
            if(loginForm) loginForm.style.display = 'none';
            if(registrationForm) registrationForm.style.display = 'block';
            hideMessage(loginMessageDiv);
        }

        function showLoginForm() {
            if(registrationForm) registrationForm.style.display = 'none';
            if(loginForm) loginForm.style.display = 'block';
            hideMessage(document.getElementById('registerMessage'));
        }

        if (showRegisterLink) showRegisterLink.addEventListener('click', (e) => { e.preventDefault(); showRegistrationFormView(); });
        if (showLoginLink) showLoginLink.addEventListener('click', (e) => { e.preventDefault(); showLoginForm(); });
    }

    // --- LÓGICA PARA cliente.html ---
    if (currentPage === 'cliente.html') {
        const currentUser = getCurrentUserFromSession();
        
        // Protección de ruta y bienvenida
        if (!currentUser || currentUser.role !== 'cliente') {
            alert('Acceso denegado. Por favor, inicie sesión como cliente.');
            window.location.href = 'login.html';
            return; // Detener ejecución si no es cliente
        }

        const clientNameDisplay = document.getElementById('clientNameDisplay');
        const timeGreetingDisplay = document.getElementById('timeGreeting');
        const logoutLink = document.getElementById('logoutLinkCliente');

        // Buscar detalles completos del cliente
        const users = getUsersFromStorage();
        const clientData = users.find(user => user.username === currentUser.username && user.role === 'cliente');

        if (clientData && clientNameDisplay) {
            clientNameDisplay.textContent = `Bienvenido/a, ${clientData.fullName || currentUser.username}`;
        } else if (clientNameDisplay) {
             clientNameDisplay.textContent = `Bienvenido/a, ${currentUser.username}`; // Fallback si no se encuentra el nombre completo
        }

        if (timeGreetingDisplay) {
            const hour = new Date().getHours();
            if (hour < 12) {
                timeGreetingDisplay.textContent = 'Buenos días.';
            } else if (hour < 18) {
                timeGreetingDisplay.textContent = 'Buenas tardes.';
            } else {
                timeGreetingDisplay.textContent = 'Buenas noches.';
            }
        }

        if (logoutLink) {
            logoutLink.addEventListener('click', function(e) {
                e.preventDefault();
                clearCurrentUserSession();
                window.location.href = 'login.html';
            });
        }
    }

    // --- LÓGICA PARA administrador.html ---
    if (currentPage === 'administrador.html') {
        const currentUser = getCurrentUserFromSession();

        // Protección de ruta
        if (!currentUser || currentUser.role !== 'admin') {
            alert('Acceso denegado. Por favor, inicie sesión como administrador.');
            window.location.href = 'login.html';
            return; // Detener ejecución si no es admin
        }

        const logoutLink = document.getElementById('logoutLinkAdmin');
        if (logoutLink) {
            logoutLink.addEventListener('click', function(e) {
                e.preventDefault();
                clearCurrentUserSession();
                window.location.href = 'login.html';
            });
        }
    }
     // Podrías añadir lógica similar para envio.html y gestion.html si necesitas
     // proteger esas rutas o cargar datos específicos.
});
