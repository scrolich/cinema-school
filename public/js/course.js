// ============================================
// СТРАНИЦА КУРСА (course.js)
// ============================================

async function loadCourse() {
    const container = document.getElementById('coursePage');
    
    // Получаем ID курса из URL (?id=1)
    const params = new URLSearchParams(window.location.search);
    const courseId = params.get('id');
    
    if (!courseId) {
        container.innerHTML = '<p class="loading-text">Курс не найден</p>';
        return;
    }
    
    try {
        const response = await fetch(`/api/courses/${courseId}`);
        
        if (!response.ok) {
            container.innerHTML = '<p class="loading-text">Курс не найден</p>';
            return;
        }
        
        const course = await response.json();
        renderCourse(course);
        
    } catch (error) {
        container.innerHTML = '<p class="loading-text" style="color: #e50914;">Ошибка загрузки курса</p>';
    }
}

function renderCourse(course) {
    const container = document.getElementById('coursePage');
    
    // Генерируем модули и уроки
    let modulesHTML = '';
    if (course.modules && course.modules.length > 0) {
        modulesHTML = course.modules.map((mod, i) => `
            <div class="module">
                <h3 class="module-title">
                    <span class="module-icon">📖</span>
                    Модуль ${i + 1}: ${mod.moduleTitle}
                </h3>
                <ul class="lesson-list">
                    ${mod.lessons.map(lesson => `
                        <li class="lesson-item">
                            <span>▶ ${lesson.title}</span>
                            <span class="lesson-duration">${lesson.duration}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `).join('');
    } else {
        modulesHTML = '<p style="color: #b8a088;">Программа курса скоро появится</p>';
    }
    
    container.innerHTML = `
        <a href="/" class="btn-back">← Назад к курсам</a>
        
        <div class="course-header">
            <img src="${course.poster}" alt="${course.title}" class="course-poster"
                 onerror="this.src='https://placehold.co/400x280/e8d5c4/d4a574?text=${encodeURIComponent(course.category)}'">
            
            <div class="course-header-info">
                <span class="course-category-big">${course.category}</span>
                <h1 class="course-title-big">${course.title}</h1>
                <p class="course-master-big">Мастер курса: <span>${course.master}</span></p>
                <p class="course-price-big">${course.price.toLocaleString()} ₽</p>
                <p class="course-description">${course.description}</p>
                <button class="btn btn-primary btn-enroll" onclick="enrollCourse(${course.id})">
                    🎬 Записаться на курс
                </button>
            </div>
        </div>
        
        <div class="course-program">
            <h2 class="program-title">📚 Программа курса</h2>
            ${modulesHTML}
        </div>
    `;
}

function enrollCourse(courseId) {
    const token = localStorage.getItem('token');
    
    if (!token) {
        // Если не вошёл — открываем модалку входа
        openModal();
        return;
    }
    
    alert('🎉 Вы записаны на курс! (функционал в разработке)');
    // Тут будет логика записи на курс
}

// Запуск
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    initAuthModal();
    loadCourse();
});