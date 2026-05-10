// ============================================
// АКАДЕМИЯ КИНО — ГЛАВНЫЙ СКРИПТ
// ============================================

/**
 * Загружает курсы с сервера и отображает их на странице
 */
async function loadCourses() {
    const container = document.getElementById('courses-container');
    
    try {
        // Показываем анимацию загрузки
        container.innerHTML = '<p class="loading-text">🎥 Загружаем курсы...</p>';
        
        // Запрос к API
        const response = await fetch('/api/courses');
        
        if (!response.ok) {
            throw new Error('Ошибка сервера');
        }
        
        const courses = await response.json();
        
        // Если курсов нет
        if (courses.length === 0) {
            container.innerHTML = '<p class="loading-text">📚 Курсы скоро появятся. Следите за обновлениями!</p>';
            return;
        }
        
        // Генерируем HTML для каждого курса
        const html = courses.map(course => createCourseCard(course)).join('');
        container.innerHTML = html;
        
    } catch (error) {
        console.error('Ошибка загрузки курсов:', error);
        container.innerHTML = '<p class="loading-text" style="color: #e50914;">⚠️ Не удалось загрузить курсы. Попробуйте позже.</p>';
    }
}

/**
 * Создаёт HTML-карточку курса
 * @param {Object} course - данные курса
 * @returns {string} HTML-разметка карточки
 */
function createCourseCard(course) {
    return `
        <article class="course-card">
            <img 
                src="${course.poster}" 
                alt="${course.title}"
                loading="lazy"
                onerror="this.src='https://placehold.co/400x230/1a1a1a/e50914?text=${encodeURIComponent(course.category)}'"
            >
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
// ПЛАВНАЯ ПРОКРУТКА ДЛЯ КНОПКИ "СМОТРЕТЬ ПРОГРАММУ"
// ============================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// ============================================
// ЗАПУСК ПРИ ЗАГРУЗКЕ СТРАНИЦЫ
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎬 Академия КИНО — страница загружена');
    loadCourses();
    initSmoothScroll();
});