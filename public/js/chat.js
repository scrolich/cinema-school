// ============================================
// ЧАТ ПОДДЕРЖКИ TELEGRAM
// ============================================

function initChatWidget() {
    // Создаём кнопку чата
    const chatButton = document.createElement('div');
    chatButton.id = 'chatWidget';
    chatButton.innerHTML = `
        <button class="chat-toggle" id="chatToggle">
            💬
        </button>
        <div class="chat-popup" id="chatPopup">
            <div class="chat-popup-header">
                <span>💬 Поддержка Академии КИНО</span>
                <button class="chat-close" id="chatClose">✕</button>
            </div>
            <div class="chat-popup-body">
                <p>Задайте вопрос — мы ответим в Telegram!</p>
                <a href="https://t.me/scr0lll" target="_blank" class="btn btn-primary chat-btn">
                    Открыть Telegram
                </a>
                <p class="chat-small">Обычно отвечаем в течение 15 минут</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(chatButton);
    
    // Открытие/закрытие
    const toggle = document.getElementById('chatToggle');
    const popup = document.getElementById('chatPopup');
    const close = document.getElementById('chatClose');
    
    toggle.addEventListener('click', () => {
        popup.classList.toggle('active');
        toggle.classList.toggle('active');
    });
    
    close.addEventListener('click', () => {
        popup.classList.remove('active');
        toggle.classList.remove('active');
    });
}

// Запуск
document.addEventListener('DOMContentLoaded', initChatWidget);