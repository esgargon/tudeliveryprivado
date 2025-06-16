
document.addEventListener('DOMContentLoaded', function() {
    // --- ELEMENTOS DEL DOM ---
    const loginForm = document.getElementById('loginForm');
    const registrationForm = document.getElementById('registrationForm');
    const showRegisterLink = document.getElementById('showRegisterLink');
    const showLoginLink = document.getElementById('showLoginLink');

    const usernameLoginInput = document.getElementById('usernameLogin');
    const passwordLoginInput = document.getElementById('passwordLogin');
    const rememberMeCheckbox = document.getElementById('rememberMe');
    const loginMessageDiv = document.getElementById('loginMessage');

    const fullNameRegInput = document.getElementById('fullNameReg');
    const usernameRegInput = document.getElementById('usernameReg');
    const phoneRegInput = document.getElementById('phoneReg');
    const passwordRegInput = document.getElementById('passwordReg');
    const confirmPasswordRegInput = document.getElementById('confirmPasswordReg');
    const addressRegInput = document.getElementById('addressReg');
    const emailRegInput = document.getElementById('emailReg');
    const registerMessageDiv = document.getElementById('registerMessage');

    const USERS_DB_KEY = 'tuDeliveryPrivadoUsers';

    // --- FUNCIONES AUXILIARES ---
    function getUsersFromStorage() {
        const users = localStorage.getItem(USERS_DB_KEY);
        return users ? JSON.parse(users) : [];
    }

    function saveUsersToStorage(users) {
        localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
    }

    function showMessage(element, message, type = 'error') {
        element.textContent = message;
        element.className = `message ${type}`;
        element.style.display = 'block';
    }

    function hideMessage(element) {
        element.style.display = 'none';
    }

    window.togglePasswordVisibility = function(inputId) {
        const passwordInput = document.getElementById(inputId);
        const checkbox = document.querySelector(`input[onclick="togglePasswordVisibility('${inputId}')"]`);
        if (passwordInput && checkbox) {
            passwordInput.type = checkbox.checked ? 'text' : 'password';
        }
    }

    // --- INICIALIZACIÓN DE USUARIOS ---
    function initializeUsers() {
        let users = getUsersFromStorage();
        // Añadir admin/admin si no existe
        if (!users.find(user => user.username === 'admin')) {
            users.push({
                username: 'admin',
                password: 'admin', // En una app real, esto debería ser hasheado
                role: 'admin',
                fullName: 'Administrador del Sistema',
                phone: '000000000',
                address: 'Oficina Central',
                email: 'admin@example.com'
            });
        }
        // Añadir demo/demo si no existe
        if (!users.find(user => user.username === 'demo')) {
            users.push({
                username: 'demo',
                password: 'demo', // En una app real, esto debería ser hasheado
                role: 'cliente',
                fullName: 'Usuario Demo',
                phone: '111111111',
                address: 'Calle Falsa 123',
                email: 'demo@example.com'
            });
        }
        saveUsersToStorage(users);
    }

    initializeUsers(); // Carga usuarios por defecto al iniciar

    // --- LÓGICA DE LOGIN ---
    if (loginForm) {
        // Recordar usuario si está guardado
        const rememberedUser = localStorage.getItem('rememberedUser');
        if (rememberedUser) {
            usernameLoginInput.value = rememberedUser;
            rememberMeCheckbox.checked = true;
        }

        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            hideMessage(loginMessageDiv);

            const username = usernameLoginInput.value.trim();
            const password = passwordLoginInput.value;
            const users = getUsersFromStorage();

            const foundUser = users.find(user => user.username === username && user.password === password);

            if (foundUser) {
                // Guardar usuario para la sesión (simple, se podría mejorar)
                sessionStorage.setItem('currentUser', JSON.stringify({ username: foundUser.username, role: foundUser.role }));

                // Manejar "Recordar contraseña" (en realidad recuerda el usuario)
                if (rememberMeCheckbox.checked) {
                    localStorage.setItem('rememberedUser', username);
                } else {
                    localStorage.removeItem('rememberedUser');
                }

                showMessage(loginMessageDiv, `Bienvenido ${foundUser.username}! Redirigiendo...`, 'success');
                setTimeout(() => {
                    if (foundUser.role === 'admin') {
                        window.location.href = 'administrador.html';
                    } else if (foundUser.role === 'cliente') {
                        window.location.href = 'cliente.html';
                    }
                }, 1500);
            } else {
                showMessage(loginMessageDiv, 'Usuario o contraseña incorrectos.', 'error');
            }
        });
    }

    // --- LÓGICA DE REGISTRO ---
    if (registrationForm) {
        registrationForm.addEventListener('submit', function(event) {
            event.preventDefault();
            hideMessage(registerMessageDiv);

            const fullName = fullNameRegInput.value.trim();
            const username = usernameRegInput.value.trim();
            const phone = phoneRegInput.value.trim();
            const password = passwordRegInput.value;
            const confirmPassword = confirmPasswordRegInput.value;
            const address = addressRegInput.value.trim();
            const email = emailRegInput.value.trim();

            if (password !== confirmPassword) {
                showMessage(registerMessageDiv, 'Las contraseñas no coinciden.', 'error');
                return;
            }
            if (password.length < 4) { // Validación simple de contraseña
                showMessage(registerMessageDiv, 'La contraseña debe tener al menos 4 caracteres.', 'error');
                return;
            }

            let users = getUsersFromStorage();

            if (users.find(user => user.username === username)) {
                showMessage(registerMessageDiv, 'El nombre de usuario ya existe.', 'error');
                return;
            }
            if (users.find(user => user.email === email)) {
                showMessage(registerMessageDiv, 'El correo electrónico ya está registrado.', 'error');
                return;
            }

            const newUser = {
                fullName,
                username,
                phone,
                password, // En una app real, hashear
                address,
                email,
                role: 'cliente' // Nuevos usuarios siempre son clientes
            };

            users.push(newUser);
            saveUsersToStorage(users);

            showMessage(registerMessageDiv, '¡Registro exitoso! Ahora puedes iniciar sesión.', 'success');
            registrationForm.reset(); // Limpia el formulario
            setTimeout(() => {
                showLoginForm(); // Muestra el formulario de login después de un registro exitoso
            }, 2000);
        });
    }

    // --- NAVEGACIÓN ENTRE FORMULARIOS ---
    function showRegistrationForm() {
        if(loginForm) loginForm.style.display = 'none';
        if(registrationForm) registrationForm.style.display = 'block';
        hideMessage(loginMessageDiv); // Limpia mensajes del login
    }

    function showLoginForm() {
        if(registrationForm) registrationForm.style.display = 'none';
        if(loginForm) loginForm.style.display = 'block';
        hideMessage(registerMessageDiv); // Limpia mensajes del registro
    }

    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', function(event) {
            event.preventDefault();
            showRegistrationForm();
        });
    }

    if (showLoginLink) {
        showLoginLink.addEventListener('click', function(event) {
            event.preventDefault();
            showLoginForm();
        });
    }
});
