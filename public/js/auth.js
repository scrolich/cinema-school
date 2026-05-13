// ============================================
// ОБЩАЯ ЛОГИКА АВТОРИЗАЦИИ (auth.js)
// Используется на всех страницах
// ============================================

function checkAuth() {
    const user = JSON.parse(localStorage.getItem('user'));
    const authBtn = document.getElementById('openAuthBtn');
    
    if (!authBtn) return;
    
    if (user) {
        authBtn.textContent = `👤 ${user.name}`;
        authBtn.classList.add('logged-in');
        authBtn.addEventListener('click', toggleUserMenu);
    } else {
        authBtn.textContent = 'Войти';
        authBtn.classList.remove('logged-in');
        authBtn.addEventListener('click', openModal);
    }
}

function openModal() {
    document.getElementById('authModal').classList.add('active');
}

function createUserMenu() {
    const oldMenu = document.getElementById('userDropdown');
    if (oldMenu) oldMenu.remove();
    
    const menu = document.createElement('div');
    menu.id = 'userDropdown';
    menu.className = 'user-dropdown';
    menu.innerHTML = `
        <a href="#" class="dropdown-item">📚 Мои курсы</a>
        <a href="#" class="dropdown-item">⚙️ Настройки</a>
        <hr>
        <a href="#" class="dropdown-item logout">🚪 Выйти</a>
    `;
    
    document.body.appendChild(menu);
    
    menu.querySelector('.logout').addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });
    
    return menu;
}

function toggleUserMenu(e) {
    e.stopPropagation();
    let menu = document.getElementById('userDropdown');
    
    if (!menu) {
        menu = createUserMenu();
    }
    
    const btn = document.getElementById('openAuthBtn');
    const rect = btn.getBoundingClientRect();
    menu.style.top = rect.bottom + 5 + 'px';
    menu.style.right = (window.innerWidth - rect.right) + 'px';
    
    menu.classList.toggle('active');
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    const menu = document.getElementById('userDropdown');
    if (menu) menu.remove();
    
    const authBtn = document.getElementById('openAuthBtn');
    if (authBtn) {
        authBtn.textContent = 'Войти';
        authBtn.classList.remove('logged-in');
        
        const newBtn = authBtn.cloneNode(true);
        authBtn.parentNode.replaceChild(newBtn, authBtn);
        document.getElementById('openAuthBtn').addEventListener('click', openModal);
    }
}

document.addEventListener('click', () => {
    const menu = document.getElementById('userDropdown');
    if (menu) menu.classList.remove('active');
});

function initAuthModal() {
    const modal = document.getElementById('authModal');
    if (!modal) return;
    
    const closeBtn = document.getElementById('closeModal');
    const tabs = document.querySelectorAll('.modal-tab');
    const forms = document.querySelectorAll('.auth-form');

    closeBtn.addEventListener('click', () => modal.classList.remove('active'));

    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            forms.forEach(f => f.classList.remove('active'));
            document.getElementById(tabName + 'Form').classList.add('active');
        });
    });

    // Вход
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = e.target.querySelector('input[type="email"]').value;
            const password = e.target.querySelector('input[type="password"]').value;
            const message = document.getElementById('loginMessage');
            
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    message.textContent = `Добро пожаловать, ${data.user.name}!`;
                    message.className = 'form-message success';
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    updateHeaderAfterLogin(data.user);
                    setTimeout(() => modal.classList.remove('active'), 1500);
                } else {
                    message.textContent = data.message || 'Ошибка входа';
                    message.className = 'form-message error';
                }
            } catch (error) {
                message.textContent = 'Ошибка соединения';
                message.className = 'form-message error';
            }
        });
    }

    // Регистрация
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const inputs = e.target.querySelectorAll('input');
            const name = inputs[0].value;
            const email = inputs[1].value;
            const password = inputs[2].value;
            const message = document.getElementById('registerMessage');
            
            if (password.length < 6) {
                message.textContent = 'Пароль должен быть минимум 6 символов';
                message.className = 'form-message error';
                return;
            }
            
            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    message.textContent = `${data.user.name}, вы успешно зарегистрированы!`;
                    message.className = 'form-message success';
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    updateHeaderAfterLogin(data.user);
                    setTimeout(() => modal.classList.remove('active'), 1500);
                } else {
                    message.textContent = data.message || 'Ошибка регистрации';
                    message.className = 'form-message error';
                }
            } catch (error) {
                message.textContent = 'Ошибка соединения';
                message.className = 'form-message error';
            }
        });
    }
}

function updateHeaderAfterLogin(user) {
    const authBtn = document.getElementById('openAuthBtn');
    if (!authBtn) return;
    
    const newBtn = authBtn.cloneNode(true);
    authBtn.parentNode.replaceChild(newBtn, authBtn);
    
    const freshBtn = document.getElementById('openAuthBtn');
    freshBtn.textContent = `👤 ${user.name}`;
    freshBtn.classList.add('logged-in');
    freshBtn.addEventListener('click', toggleUserMenu);
}