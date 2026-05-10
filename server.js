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
            poster: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600",
            category: "Сценарий",
            price: 15000,
            description: "Как написать диалоги, от которых мурашки по коже."
        },
        {
            id: 2,
            title: "Режиссура Кино",
            master: "Кристофер Нолан",
            poster: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600",
            category: "Режиссура",
            price: 25000,
            description: "Визуальное повествование и работа с актёрами."
        },
        {
            id: 3,
            title: "Магия Монтажа",
            master: "Тельма Скунмейкер",
            poster: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600",
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