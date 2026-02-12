// ========== AI SUPPORT CHAT - MONA ==========
const CHAT_WORKER_URL = 'https://recovery-chat.kidell-powellj.workers.dev';

let chatHistory = [];
let isWaitingForResponse = false;
let userRecoveryContext = null;

// Format timestamp for messages
function formatTimestamp() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
}

// Build recovery context string to send with first message
function buildRecoveryContext() {
    const parts = [];
    try {
        const cleanTimeEl = document.getElementById('cleanTimeDisplay');
        if (cleanTimeEl && cleanTimeEl.textContent && !cleanTimeEl.textContent.includes('Set your')) {
            parts.push(`Time in recovery: ${cleanTimeEl.textContent}`);
        }
        // Get recent mood from timeline
        const moodCells = document.querySelectorAll('.mood-day');
        const recentMoods = [];
        moodCells.forEach(cell => {
            const emoji = cell.querySelector('.mood-day-emoji');
            const label = cell.querySelector('.mood-day-label');
            if (emoji && emoji.textContent.trim()) {
                recentMoods.push(`${label ? label.textContent : ''}: ${emoji.textContent.trim()}`);
            }
        });
        if (recentMoods.length > 0) {
            parts.push(`Recent moods (last few days): ${recentMoods.slice(-5).join(', ')}`);
        }
        // Check milestones
        const earnedBadges = document.querySelectorAll('.milestone-badge.earned');
        if (earnedBadges.length > 0) {
            const latest = earnedBadges[earnedBadges.length - 1];
            const icon = latest.querySelector('.milestone-badge-icon');
            const label = latest.querySelector('.milestone-badge-label');
            if (icon && label) {
                parts.push(`Latest milestone: ${icon.textContent} ${label.textContent}`);
            }
        }
    } catch (e) {
        console.log('Could not build recovery context:', e);
    }
    return parts.length > 0 ? parts.join('. ') + '.' : null;
}

// Simple markdown parser for Mona's messages
function formatMonaMessage(text) {
    let html = escapeHtml(text);
    // Bold: **text**
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Italic: *text* (but not inside bold)
    html = html.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
    // Bullet lists: lines starting with - or •
    html = html.replace(/^[\-•]\s+(.+)$/gm, '<li>$1</li>');
    html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul class="mona-list">$1</ul>');
    // Numbered lists: lines starting with 1. 2. etc.
    html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');
    // Phone numbers: make clickable
    html = html.replace(/(\d{3}[-.]?\d{3}[-.]?\d{4})/g, '<a href="tel:$1" class="mona-link">$1</a>');
    html = html.replace(/(1-\d{3}-\d{3}-\d{4})/g, '<a href="tel:$1" class="mona-link">$1</a>');
    // URLs: make clickable
    html = html.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener" class="mona-link">$1</a>');
    // Line breaks
    html = html.replace(/\n/g, '<br>');
    return html;
}

function addMessageToChat(content, role) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${role}`;
    const time = formatTimestamp();

    if (role === 'assistant') {
        const formatted = formatMonaMessage(content);
        messageDiv.innerHTML = `<img src="mona.png" alt="Mona" class="mona-avatar-msg"><div class="mona-msg-content">${formatted}<span class="msg-time">${time}</span></div>`;
    } else if (role === 'user') {
        messageDiv.innerHTML = `${escapeHtml(content)}<span class="msg-time">${time}</span>`;
    } else {
        messageDiv.textContent = content;
    }

    messagesContainer.appendChild(messageDiv);
    // Smooth scroll to bottom
    messagesContainer.scrollTo({ top: messagesContainer.scrollHeight, behavior: 'smooth' });
}

function showTypingIndicator() {
    const messagesContainer = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = '<img src="mona.png" alt="Mona" class="mona-avatar-msg"><span class="typing-label">Mona is typing</span><div class="typing-dots"><span></span><span></span><span></span></div>';
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTo({ top: messagesContainer.scrollHeight, behavior: 'smooth' });
}

function hideTypingIndicator() {
    const typing = document.getElementById('typingIndicator');
    if (typing) typing.remove();
}

async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const sendBtn = document.getElementById('chatSendBtn');
    const message = input.value.trim();

    if (!message || isWaitingForResponse) return;

    if (CHAT_WORKER_URL === 'YOUR_CHAT_WORKER_URL_HERE') {
        addMessageToChat("The chat feature is not yet configured. Please contact the site administrator.", 'system');
        return;
    }

    addMessageToChat(message, 'user');

    // On first message, inject recovery context as a system-style user context
    let contextMessage = message;
    if (chatHistory.length === 0) {
        const ctx = buildRecoveryContext();
        if (ctx) {
            userRecoveryContext = ctx;
            contextMessage = `[User context — ${ctx}]\n\n${message}`;
        }
    }
    chatHistory.push({ role: 'user', content: contextMessage });

    input.value = '';
    input.style.height = 'auto';
    isWaitingForResponse = true;
    sendBtn.disabled = true;

    // Permanently hide quick prompts once conversation begins
    const qp = document.getElementById('quickPrompts');
    qp.style.display = 'none';
    qp.dataset.dismissed = 'true';

    showTypingIndicator();

    try {
        const response = await fetch(CHAT_WORKER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: chatHistory })
        });

        const data = await response.json();
        hideTypingIndicator();

        if (data.content && data.content[0] && data.content[0].text) {
            const assistantMessage = data.content[0].text;
            addMessageToChat(assistantMessage, 'assistant');
            chatHistory.push({ role: 'assistant', content: assistantMessage });
        } else if (data.error) {
            addMessageToChat("I'm having trouble connecting right now. Please try again in a moment, or reach out to a fellow or sponsor. You can also call SAMHSA at 1-800-662-4357.", 'assistant');
            console.error('API Error:', data.error);
        }
    } catch (error) {
        hideTypingIndicator();
        addMessageToChat("I'm having trouble connecting right now. Please try again in a moment, or reach out to a fellow or sponsor. You can also call SAMHSA at 1-800-662-4357.", 'assistant');
        console.error('Chat error:', error);
    }

    isWaitingForResponse = false;
    sendBtn.disabled = false;
    input.focus();
}
window.sendChatMessage = sendChatMessage;

function sendQuickPrompt(prompt) {
    document.getElementById('chatInput').value = prompt;
    sendChatMessage();
}
window.sendQuickPrompt = sendQuickPrompt;

// Toolkit toggle
function toggleToolkit() {
    const exercises = document.getElementById('guidedExercises');
    const chevron = document.getElementById('toolkitChevron');
    const isOpen = exercises.style.display === 'flex';
    exercises.style.display = isOpen ? 'none' : 'flex';
    chevron.classList.toggle('open', !isOpen);
}
window.toggleToolkit = toggleToolkit;

// Welcome-back message for returning users
function showWelcomeBack() {
    const cleanTimeEl = document.getElementById('cleanTimeDisplay');
    if (cleanTimeEl && cleanTimeEl.textContent && !cleanTimeEl.textContent.includes('Set your')) {
        const timeText = cleanTimeEl.textContent.trim();
        // Add a personalized welcome-back as Mona's second message
        const messagesContainer = document.getElementById('chatMessages');
        const welcomeDiv = document.createElement('div');
        welcomeDiv.className = 'chat-message assistant';
        welcomeDiv.innerHTML = `<img src="mona.png" alt="Mona" class="mona-avatar-msg"><div class="mona-msg-content">Welcome back! <strong>${timeText}</strong> in recovery — that's something to be proud of. I'm right here whenever you need me.</div>`;
        messagesContainer.appendChild(welcomeDiv);
    }
}

// Initialize welcome-back after auth state resolves
function initMonaWelcome() {
    // Wait a bit for Firebase auth and clean time to load
    setTimeout(() => {
        const cleanTimeEl = document.getElementById('cleanTimeDisplay');
        if (cleanTimeEl && cleanTimeEl.textContent && !cleanTimeEl.textContent.includes('Set your')) {
            showWelcomeBack();
        }
    }, 3000);
}
// Run on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMonaWelcome);
} else {
    initMonaWelcome();
}

function handleChatKeydown(event) {
    const input = event.target;

    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 120) + 'px';

    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendChatMessage();
    }
}
window.handleChatKeydown = handleChatKeydown;
