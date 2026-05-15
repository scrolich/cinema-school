// ============================================
// ЛИЧНЫЙ КАБИНЕТ
// ============================================

function getToken() {
    return localStorage.getItem('token');
}

function getUser() {
    return JSON.parse(localStorage.getItem('user'));
}

// Проверка авторизации
function checkDashboardAccess() {
    const token = getToken();
    const user = getUser();
    
    if (!token || !user) {
        // Не вошёл — показываем модалку
        document.getElementById('myCourses').innerHTML = `
            <div class="empty-state">
                <span class="empty-state-icon">🔐</span>
                <h3>Требуется авторизация</h3>
                <p>Войдите или зарегистрируйтесь, чтобы увидеть свои курсы</p>
                <button class="btn btn-primary" onclick="document.getElementById('authModal').classList.add('active')">
                    Войти
                </button>
            </div>
        `;
        return false;
    }
    
    document.getElementById('userName').textContent = `Студент: ${user.name}`;
    return true;
}

// Загрузка курсов
async function loadMyCourses() {
    const container = document.getElementById('myCourses');
    
    if (!checkDashboardAccess()) return;
    
    try {
        const response = await fetch('/api/my-courses', {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        
        if (!response.ok) throw new Error('Ошибка');
        
        const myCourses = await response.json();
        
        if (myCourses.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="empty-state-icon">📚</span>
                    <h3>У вас пока нет курсов</h3>
                    <p>Выберите курс в каталоге и начните обучение!</p>
                    <a href="/#courses" class="btn btn-primary">Смотреть курсы</a>
                </div>
            `;
            return;
        }
        
        let html = '<div class="my-courses-grid">';
        
        myCourses.forEach(course => {
            html += `
                <div class="my-course-card">
                    <img src="${course.poster}" alt="${course.title}" class="my-course-poster"
                         onerror="this.src='https://placehold.co/120x80/e8d5c4/d4a574?text=🎬'">
                    <div class="my-course-info">
                        <h3 class="my-course-title">${course.title}</h3>
                        <p class="my-course-master">${course.master}</p>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${course.progress || 0}%"></div>
                        </div>
                        <p class="progress-text">${course.progress || 0}% пройдено</p>
                    </div>
                    <div class="my-course-actions">
                        <a href="/course.html?id=${course.id}" class="btn btn-primary btn-continue">
                            ${course.progress > 0 ? '▶ Продолжить' : '🎬 Начать'}
                        </a>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
        
    } catch (error) {
        container.innerHTML = '<p class="loading-text" style="color:red;">Ошибка загрузки</p>';
    }
}

// Обновление шапки после входа
function updateHeaderAfterLogin(user) {
    const authBtn = document.getElementById('openAuthBtn');
    if (!authBtn) return;
    
    const newBtn = authBtn.cloneNode(true);
    authBtn.parentNode.replaceChild(newBtn, authBtn);
    
    const freshBtn = document.getElementById('openAuthBtn');
    freshBtn.textContent = `👤 ${user.name}`;
    freshBtn.classList.add('logged-in');
    freshBtn.addEventListener('click', toggleUserMenu);
    
    // Обновляем кабинет
    loadMyCourses();
}

// Запуск
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    initAuthModal();
    loadMyCourses();
});