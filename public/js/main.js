// ============================================
// АКАДЕМИЯ КИНО — ГЛАВНЫЙ СКРИПТ
// ============================================

// ============================================
// ПРОВЕРКА АВТОРИЗАЦИИ ПРИ ЗАГРУЗКЕ
// ============================================
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('user'));
    const authBtn = document.getElementById('openAuthBtn');
    
    if (user) {
        // Пользователь вошёл — меняем кнопку
        authBtn.textContent = `👤 ${user.name}`;
        authBtn.classList.add('logged-in');
        
        // Создаём выпадающее меню
        authBtn.addEventListener('click', toggleUserMenu);
    } else {
        // Не вошёл — кнопка "Войти"
        authBtn.textContent = 'Войти';
        authBtn.classList.remove('logged-in');
        authBtn.addEventListener('click', openModal);
    }
}

// ============================================
// МЕНЮ ПОЛЬЗОВАТЕЛЯ (личный кабинет)
// ============================================
function createUserMenu() {
    // Удаляем старое меню если есть
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
    
    // Выход
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
    
    // Позиционируем меню под кнопкой
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
    authBtn.textContent = 'Войти';
    authBtn.classList.remove('logged-in');
    
    // Убираем старые обработчики
    const newBtn = authBtn.cloneNode(true);
    authBtn.parentNode.replaceChild(newBtn, authBtn);
    
    // Вешаем обработчик открытия модалки
    document.getElementById('openAuthBtn').addEventListener('click', openModal);
}

// Закрытие меню при клике вне
document.addEventListener('click', () => {
    const menu = document.getElementById('userDropdown');
    if (menu) menu.classList.remove('active');
});

// ============================================
// ЗАГРУЗКА КУРСОВ
// ============================================
async function loadCourses() {
    const container = document.getElementById('courses-container');
    
    try {
        container.innerHTML = '<p class="loading-text">🎥 Загружаем курсы...</p>';
        
        const response = await fetch('/api/courses');
        if (!response.ok) throw new Error('Ошибка сервера');
        
        const courses = await response.json();
        
        if (courses.length === 0) {
            container.innerHTML = '<p class="loading-text">📚 Курсы скоро появятся.</p>';
            return;
        }
        
        const html = courses.map(course => createCourseCard(course)).join('');
        container.innerHTML = html;
        
    } catch (error) {
        console.error('Ошибка загрузки курсов:', error);
        container.innerHTML = '<p class="loading-text" style="color: #e50914;">⚠️ Не удалось загрузить курсы</p>';
    }
}

function createCourseCard(course) {
    return `
        <article class="course-card" onclick="location.href='/course.html?id=${course.id}'">
            <img src="${course.poster}" alt="${course.title}" loading="lazy"
                 onerror="this.src='https://placehold.co/400x230/e8d5c4/d4a574?text=${encodeURIComponent(course.category)}'">
            <div class="course-info">
                <span class="course-category">${course.category}</span>
                <h3 class="course-title">${course.title}</h3>
                <p class="course-master">Мастер: ${course.master}</p>
                <p class="course-price">от ${course.price.toLocaleString()} ₽</p>
            </div>
        </article>
    `;
}

// ============================================
// МОДАЛЬНОЕ ОКНО ВХОДА / РЕГИСТРАЦИИ
// ============================================
function openModal() {
    document.getElementById('authModal').classList.add('active');
}

function initAuthModal() {
    const modal = document.getElementById('authModal');
    const closeBtn = document.getElementById('closeModal');
    const tabs = document.querySelectorAll('.modal-tab');
    const forms = document.querySelectorAll('.auth-form');

    // Закрыть модалку
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    // Клик по фону — закрыть
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    // Переключение вкладок
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            forms.forEach(f => f.classList.remove('active'));
            document.getElementById(tabName + 'Form').classList.add('active');
        });
    });

    // Обработка ВХОДА
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
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
                
                // Обновляем шапку
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

    // Обработка РЕГИСТРАЦИИ
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
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
                
                // Обновляем шапку
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

// ============================================
// ПЛАВНАЯ ПРОКРУТКА
// ============================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offset = 80;
                const position = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top: position, behavior: 'smooth' });
            }
        });
    });
}

// ============================================
// ЗАПУСК ПРИ ЗАГРУЗКЕ
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎬 Академия КИНО — страница загружена');
    checkAuth();
    loadCourses();
    initAuthModal();
    initSmoothScroll();
        // FAQ аккордеон
    document.querySelectorAll('.faq-question').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.parentElement;
            const isActive = item.classList.contains('active');
            
            // Закрыть все
            document.querySelectorAll('.faq-item').forEach(el => el.classList.remove('active'));
            
            // Открыть текущий (если был не открыт)
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
});