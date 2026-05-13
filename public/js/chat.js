// ============================================
// ЧАТ ПОДДЕРЖКИ TELEGRAM
// ============================================

function initChatWidget() {
    // Создаём кнопку чата
    const chatButton = document.createElement('div');
    chatButton.id = 'chatWidget';
    chatButton.innerHTML = `
        <button class="chat-toggle" id="chatToggle">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0C5.373 0 0 4.701 0 10.5c0 3.063 1.523 5.844 3.938 7.719L2.86 23.5l5.906-3.031A12.66 12.66 0 0012 21c6.627 0 12-4.701 12-10.5S18.627 0 12 0zm0 19.5c-1.283 0-2.53-.247-3.68-.697l-.41-.203-3.502 1.798.944-3.407-.28-.456C3.77 15.192 3 13.646 3 12c0-3.866 4.037-7.5 9-7.5s9 3.634 9 7.5-4.037 7.5-9 7.5zm4.5-5.625c-.225-.113-1.332-.657-1.539-.732-.207-.075-.357-.113-.507.113s-.582.732-.713.882-.263.17-.488.057c-.225-.113-.95-.35-1.81-1.117-.669-.596-1.12-1.333-1.251-1.558-.132-.226-.014-.348.099-.46.101-.101.225-.263.337-.395.113-.131.15-.225.225-.375.075-.15.038-.282-.019-.395-.057-.113-.507-1.22-.695-1.671-.183-.44-.37-.38-.507-.387-.132-.007-.282-.009-.432-.009s-.395.057-.602.282c-.207.225-.79.772-.79 1.883s.81 2.184.922 2.335c.113.15 1.593 2.433 3.86 3.412.54.233.961.372 1.29.477.541.172 1.034.148 1.424.09.434-.065 1.332-.545 1.52-1.071.188-.527.188-.978.132-1.072-.057-.094-.207-.15-.432-.263z"/>
            </svg>
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