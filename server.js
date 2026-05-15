const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const JWT_SECRET = 'секретный_ключ_киношколы_2024';

// Отдаём статические файлы из папки public
app.use(express.static(path.join(__dirname, 'public')));

// Папка для данных
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

// Функции для работы с JSON
function readJSON(filename) {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) return [];
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function writeJSON(filename, data) {
    fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2));
}

// Загружаем данные
let users = readJSON('users.json');
let courses = readJSON('courses.json');

// Создаём тестовые курсы
if (courses.length === 0) {
    courses = [
        {
            id: 1,
            title: "Сценарный Прорыв",
            master: "Квентин Тарантино",
            poster: "/images/scenariy.jpg",
            category: "Сценарий",
            price: 15000,
            description: "Как написать диалоги, от которых мурашки по коже."
        },
        {
            id: 2,
            title: "Режиссура Кино",
            master: "Кристофер Нолан",
            poster: "/images/rezhissura.jpg",
            category: "Режиссура",
            price: 25000,
            description: "Визуальное повествование и работа с актёрами."
        },
        {
            id: 3,
            title: "Магия Монтажа",
            master: "Тельма Скунмейкер",
            poster: "/images/montazh.jpg",
            category: "Монтаж",
            price: 10000,
            description: "От черновой сборки до цветокоррекции."
        }
    ];
    writeJSON('courses.json', courses);
    console.log('✅ Созданы 3 тестовых курса');
}

// ============================================
// API: Регистрация
// ============================================
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        if (users.find(u => u.email === email)) {
            return res.status(400).json({ message: 'Этот email уже зарегистрирован' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = {
            id: users.length + 1,
            name,
            email,
            password: hashedPassword,
            enrolledCourses: []
        };
        
        users.push(newUser);
        writeJSON('users.json', users);
        
        const token = jwt.sign({ userId: newUser.id }, JWT_SECRET);
        res.status(201).json({ token, user: { id: newUser.id, name: newUser.name } });
        
        console.log(`✅ Новый студент: ${name}`);
    } catch (error) {
        res.status(400).json({ message: 'Ошибка регистрации' });
    }
});

// ============================================
// API: Вход
// ============================================
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = users.find(u => u.email === email);
        
        if (!user) {
            return res.status(400).json({ message: 'Пользователь не найден' });
        }
        
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(400).json({ message: 'Неверный пароль' });
        }
        
        const token = jwt.sign({ userId: user.id }, JWT_SECRET);
        res.json({ token, user: { id: user.id, name: user.name } });
        
        console.log(`🔑 Вход: ${user.name}`);
    } catch (error) {
        res.status(400).json({ message: 'Ошибка входа' });
    }
});

// ============================================
// API: Список курсов
// ============================================
app.get('/api/courses', (req, res) => {
    const coursesList = courses.map(({ id, title, master, poster, category, price, description }) => ({
        id, title, master, poster, category, price, description
    }));
    res.json(coursesList);
});

// ============================================
// API: АДМИН-ПАНЕЛЬ (только для админа)
// ============================================

// Middleware проверки админа
function adminAuth(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'Требуется авторизация' });
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== 'admin') {
            return res.status(403).json({ message: 'Доступ запрещён' });
        }
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Неверный токен' });
    }
}

// Вход в админку
app.post('/api/admin/login', async (req, res) => {
    try {
        const { password } = req.body;
        const ADMIN_PASSWORD = 'Rafpuf456@11'; // ← ПОМЕНЯЙТЕ НА СВОЙ ПАРОЛЬ
        
        if (password !== ADMIN_PASSWORD) {
            return res.status(401).json({ message: 'Неверный пароль' });
        }
        
        const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, message: 'Добро пожаловать в админ-панель' });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// ============================================
// API: ЛИЧНЫЙ КАБИНЕТ СТУДЕНТА
// ============================================

// Middleware проверки обычного пользователя
function userAuth(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'Требуется авторизация' });
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Неверный токен' });
    }
}

// Записаться на курс
app.post('/api/enroll/:courseId', userAuth, (req, res) => {
    const courseId = parseInt(req.params.courseId);
    const user = users.find(u => u.id === req.userId);
    
    if (!user) {
        return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    if (!user.enrolledCourses) {
        user.enrolledCourses = [];
    }
    
    // Проверка: уже записан?
    if (user.enrolledCourses.find(e => e.courseId === courseId)) {
        return res.status(400).json({ message: 'Вы уже записаны на этот курс' });
    }
    
    const course = courses.find(c => c.id === courseId);
    if (!course) {
        return res.status(404).json({ message: 'Курс не найден' });
    }
    
    // Если курс платный — добавляем с пометкой "не оплачен"
    user.enrolledCourses.push({
        courseId: courseId,
        enrolledAt: new Date().toISOString(),
        progress: 0,
        completedLessons: [],
        paid: course.price === 0  // true если бесплатный
    });
    
    writeJSON('users.json', users);
    
    console.log(`📚 ${user.name} записался на курс #${courseId} (оплачен: ${course.price === 0})`);
    
    res.json({ 
        message: course.price === 0 
            ? '✅ Курс добавлен в личный кабинет!' 
            : '✅ Вы записаны! Курс появится в кабинете после оплаты.',
        paid: course.price === 0
    });
});

// Получить мои курсы
app.get('/api/my-courses', userAuth, (req, res) => {
    const user = users.find(u => u.id === req.userId);
    
    if (!user || !user.enrolledCourses) {
        return res.json([]);
    }
    
    const myCourses = user.enrolledCourses.map(enrollment => {
        const course = courses.find(c => c.id === enrollment.courseId);
        if (!course) return null;
        
        return {
            ...course,
            progress: enrollment.progress,
            enrolledAt: enrollment.enrolledAt,
            completedLessons: enrollment.completedLessons || []
        };
    }).filter(Boolean);
    
    res.json(myCourses);
});

// Обновить прогресс курса
app.put('/api/progress/:courseId', userAuth, (req, res) => {
    const courseId = parseInt(req.params.courseId);
    const { lessonTitle } = req.body;
    const user = users.find(u => u.id === req.userId);
    
    if (!user) return res.status(404).json({ message: 'Пользователь не найден' });
    
    const enrollment = user.enrolledCourses.find(e => e.courseId === courseId);
    if (!enrollment) return res.status(404).json({ message: 'Вы не записаны на этот курс' });
    
    // Добавляем урок в завершённые
    if (!enrollment.completedLessons.includes(lessonTitle)) {
        enrollment.completedLessons.push(lessonTitle);
    }
    
    // Считаем прогресс
    const course = courses.find(c => c.id === courseId);
    if (course && course.modules) {
        const totalLessons = course.modules.reduce((sum, mod) => sum + mod.lessons.length, 0);
        enrollment.progress = Math.round((enrollment.completedLessons.length / totalLessons) * 100);
    }
    
    writeJSON('users.json', users);
    
    console.log(`📊 ${user.name}: курс #${courseId} — прогресс ${enrollment.progress}%`);
    res.json({ progress: enrollment.progress, completedLessons: enrollment.completedLessons });
});

// Получить все курсы (с полными данными)
app.get('/api/admin/courses', adminAuth, (req, res) => {
    res.json(courses);
});

// Создать новый курс
app.post('/api/admin/courses', adminAuth, (req, res) => {
    const { title, master, poster, category, price, description, modules } = req.body;
    
    const newCourse = {
        id: courses.length > 0 ? Math.max(...courses.map(c => c.id)) + 1 : 1,
        title,
        master,
        poster: poster || 'https://placehold.co/400x230/e8d5c4/d4a574?text=Новый+курс',
        category,
        price: Number(price),
        description,
        modules: modules || []
    };
    
    courses.push(newCourse);
    writeJSON('courses.json', courses);
    
    console.log(`✅ Админ создал курс: ${title}`);
    res.status(201).json(newCourse);
});

// Обновить курс
app.put('/api/admin/courses/:id', adminAuth, (req, res) => {
    const id = parseInt(req.params.id);
    const index = courses.findIndex(c => c.id === id);
    
    if (index === -1) {
        return res.status(404).json({ message: 'Курс не найден' });
    }
    
    courses[index] = { ...courses[index], ...req.body, id };
    writeJSON('courses.json', courses);
    
    console.log(`✅ Админ обновил курс: ${courses[index].title}`);
    res.json(courses[index]);
});

// Удалить курс
app.delete('/api/admin/courses/:id', adminAuth, (req, res) => {
    const id = parseInt(req.params.id);
    const index = courses.findIndex(c => c.id === id);
    
    if (index === -1) {
        return res.status(404).json({ message: 'Курс не найден' });
    }
    
    const deleted = courses.splice(index, 1)[0];
    writeJSON('courses.json', courses);
    
    console.log(`🗑️ Админ удалил курс: ${deleted.title}`);
    res.json({ message: 'Курс удалён' });
});

// ============================================
// API: Конкретный курс
// ============================================
app.get('/api/courses/:id', (req, res) => {
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if (!course) return res.status(404).json({ message: 'Курс не найден' });
    res.json(course);
});

// ============================================
// ЗАПУСК
// ============================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log('═══════════════════════════════════');
    console.log('  🎬 АКАДЕМИЯ КИНО ЗАПУЩЕНА');
    console.log(`  📺 http://localhost:${PORT}`);
    console.log(`  📚 Курсов: ${courses.length}`);
    console.log(`  👥 Студентов: ${users.length}`);
    console.log('═══════════════════════════════════');
});

