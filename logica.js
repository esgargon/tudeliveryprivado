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
        element.className = `message ${type}`; // Asegúrate que la clase 'message' base existe si es necesaria globalmente
        element.style.display = 'block';
    }

    function hideMessage(element) {
        if (!element) return;
        element.style.display = 'none';
    }

    window.togglePasswordVisibility = function(inputId) {
        const passwordInput = document.getElementById(inputId);
        const checkboxId = inputId.replace('password', 'showPassword').replace('Password', 'showPassword');
        const checkbox = document.getElementById(checkboxId);

        if (passwordInput && checkbox) {
            passwordInput.type = checkbox.checked ? 'text' : 'password';
        }
    };

    // --- INICIALIZACIÓN DE USUARIOS POR DEFECTO ---
    function initializeDefaultUsers() {
        let users = getUsersFromStorage();
        let changed = false;

        // --- Administrador ---
        let adminUser = users.find(user => user.username === 'admin');
        if (!adminUser) {
            users.push({
                username: 'admin', password: 'admin', role: 'admin',
                fullName: 'Administrador Principal', phone: '000000000',
                address: 'Oficina Central', email: 'admin@deliverysystem.com'
            });
            changed = true;
        } else {
            // Asegurar que el admin tiene fullName y otros datos clave si es necesario
            if (adminUser.fullName !== 'Administrador Principal' || !adminUser.hasOwnProperty('fullName')) {
                adminUser.fullName = 'Administrador Principal';
                changed = true;
            }
             if (adminUser.role !== 'admin') { // Corregir rol si es necesario
                adminUser.role = 'admin';
                changed = true;
            }
        }
        
        // --- Usuario Demo Cliente ---
        let demoUser = users.find(user => user.username === 'demo');
        if (!demoUser) {
            users.push({
                username: 'demo', password: 'demo', role: 'cliente',
                fullName: 'Cliente de Prueba', phone: '123456789',
                address: 'Av. Siempre Viva 742', email: 'demo@example.com'
            });
            changed = true;
        } else {
            // Asegurar que el usuario demo tiene fullName y otros datos clave actualizados
            if (demoUser.fullName !== 'Cliente de Prueba' || !demoUser.hasOwnProperty('fullName')) {
                demoUser.fullName = 'Cliente de Prueba';
                changed = true;
            }
            if (demoUser.role !== 'cliente') { // Corregir rol si es necesario
                demoUser.role = 'cliente';
                changed = true;
            }
            // Puedes añadir aquí más verificaciones si cambias los datos por defecto
        }
        
        if (changed) {
            saveUsersToStorage(users);
            console.log("Usuarios por defecto verificados/actualizados en localStorage.");
        }
    }
    
    // Llamar SIEMPRE en esta etapa de desarrollo para asegurar datos actualizados.
    // En producción, podrías usar una bandera de 'versión de datos' o similar.
    initializeDefaultUsers();

    // --- LÓGICA ESPECÍFICA DE CADA PÁGINA ---
    const currentPage = window.location.pathname.split("/").pop() || "login.html"; // Default to login if path is "/"

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
                    showMessage(loginMessageDiv, `¡Hola ${foundUser.username}! Redirigiendo...`, 'success');
                    setTimeout(() => {
                        if (foundUser.role === 'admin') window.location.href = 'administrador.html';
                        else if (foundUser.role === 'cliente') window.location.href = 'cliente.html';
                    }, 1200);
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
                setTimeout(() => showLoginFormView(), 2000); // Llamar showLoginFormView
            });
        }

        function showRegistrationFormView() { // Cambiado nombre para claridad
            if(loginForm) loginForm.style.display = 'none';
            if(registrationForm) registrationForm.style.display = 'block';
            if(loginMessageDiv) hideMessage(loginMessageDiv);
        }

        function showLoginFormView() { // Cambiado nombre para claridad
            if(registrationForm) registrationForm.style.display = 'none';
            if(loginForm) loginForm.style.display = 'block';
            const registerMsg = document.getElementById('registerMessage');
            if(registerMsg) hideMessage(registerMsg);
        }

        if (showRegisterLink) showRegisterLink.addEventListener('click', (e) => { e.preventDefault(); showRegistrationFormView(); });
        if (showLoginLink) showLoginLink.addEventListener('click', (e) => { e.preventDefault(); showLoginFormView(); });
    }

    // --- LÓGICA PARA cliente.html ---
    if (currentPage === 'cliente.html') {
        const currentUser = getCurrentUserFromSession();
        
        if (!currentUser || currentUser.role !== 'cliente') {
            alert('Acceso no autorizado. Por favor, inicie sesión como cliente.');
            window.location.href = 'login.html';
            return; 
        }

        const mainWelcomeMessageEl = document.getElementById('mainWelcomeMessage');
        const timeSpecificGreetingEl = document.getElementById('timeSpecificGreeting');
        const logoutLink = document.getElementById('logoutLinkCliente');

        const users = getUsersFromStorage();
        // Encuentra todos los datos del usuario actual desde nuestra "BD" (localStorage)
        const clientData = users.find(user => user.username === currentUser.username && user.role === 'cliente');

        let welcomeName = currentUser.username; // Fallback por si no hay nombre completo
        if (clientData && clientData.fullName && clientData.fullName.trim() !== '') {
            welcomeName = clientData.fullName;
        }

        let timeGreeting = "";
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) { // Madrugada/Mañana
            timeGreeting = 'Buenos días';
        } else if (hour >= 12 && hour < 19) { // Tarde
            timeGreeting = 'Buenas tardes';
        } else { // Noche (y madrugada temprana)
            timeGreeting = 'Buenas noches';
        }

        if (mainWelcomeMessageEl) {
            mainWelcomeMessageEl.textContent = `Bienvenido/a, ${welcomeName}`;
        }
        
        if (timeSpecificGreetingEl) {
            timeSpecificGreetingEl.textContent = `${timeGreeting}.`;
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
        if (!currentUser || currentUser.role !== 'admin') {
            alert('Acceso no autorizado. Por favor, inicie sesión como administrador.');
            window.location.href = 'login.html';
            return;
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
});
