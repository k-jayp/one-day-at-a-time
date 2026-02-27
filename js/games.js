// ========== CHALLENGES HUB & GAMES MODULE ==========
// 6 gamified CBT exercises for the Challenges section

const WORKER_URL = typeof CHAT_WORKER_URL !== 'undefined' ? CHAT_WORKER_URL : 'https://recovery-chat.kidell-powellj.workers.dev';

// ========== GAME CONFIGS ==========
const GAME_CONFIGS = [
    { id: 'identify-distortions', title: 'Identify Distortions', icon: '🧠', desc: 'Test your ability to spot cognitive distortions in everyday thoughts', xpRange: 'Up to 100 XP', featured: false },
    { id: 'thought-categorizer', title: 'Thought Categorizer', icon: '🗂️', desc: 'Drag distorted thoughts into their correct category', xpRange: 'Up to 90 XP', featured: false },
    { id: 'reframe-builder', title: 'Reframe Builder', icon: '🔧', desc: 'Complete balanced reframes by filling in the right words', xpRange: 'Up to 80 XP', featured: false },
    { id: 'coping-skills-game', title: 'Coping Skills Menu', icon: '🛡️', desc: 'Sort coping strategies into the right wellness categories', xpRange: 'Up to 100 XP', featured: false },
    { id: 'frustration-tolerance', title: 'Frustration Tolerance', icon: '🌊', desc: 'Challenge rigid beliefs and build tolerance with balanced reframes', xpRange: 'Up to 120 XP', featured: false },
    { id: 'ai-reframe-studio', title: 'AI Reframe Studio', icon: '✨', desc: 'Get AI-powered analysis of your thought patterns with personalized reframes', xpRange: '30+ XP', featured: true },
];

// ========== BADGE DEFINITIONS ==========
const CHALLENGE_BADGES = [
    { id: 'first_session', name: 'First Step', icon: '💡', desc: 'Earned your first XP' },
    { id: 'xp_100', name: 'Century Club', icon: '⭐', desc: 'Accumulated 100+ total XP' },
    { id: 'master_dichotomous', name: 'Nuance Seeker', icon: '🧩', desc: 'Completed Thought Categorizer' },
    { id: 'ai_reframe_master', name: 'AI Insight', icon: '🔮', desc: 'Used AI Reframe Studio' },
    { id: 'coping_master', name: 'Toolkit Builder', icon: '🛡️', desc: 'Completed Coping Skills Menu' },
];

// ========== IDENTIFY DISTORTIONS DATA ==========
const ID_DISTORTIONS = [
    { id: 'all-or-nothing', name: 'All-or-Nothing Thinking', desc: 'Seeing things in black and white terms' },
    { id: 'catastrophizing', name: 'Catastrophizing', desc: 'Expecting the worst possible outcome' },
    { id: 'should-statements', name: '"Should" Statements', desc: 'Rigid rules about how things should be' },
    { id: 'personalization', name: 'Personalization', desc: 'Blaming yourself for things outside your control' },
    { id: 'mind-reading', name: 'Mind Reading', desc: 'Assuming you know what others think' },
    { id: 'emotional-reasoning', name: 'Emotional Reasoning', desc: 'Feeling it, so it must be true' },
    { id: 'overgeneralization', name: 'Overgeneralization', desc: 'Using "always" or "never" thinking' },
];

const ID_SCENARIOS = [
    { thought: "I made one mistake at work, so I'm completely incompetent.", correct: 'all-or-nothing' },
    { thought: "If I speak up in the meeting, everyone will laugh at me and I'll get fired.", correct: 'catastrophizing' },
    { thought: "I should be further along in my recovery by now.", correct: 'should-statements' },
    { thought: "My friend seems upset — it must be something I did.", correct: 'personalization' },
    { thought: "They didn't text me back — they must think I'm annoying.", correct: 'mind-reading' },
    { thought: "I feel like a failure, so I must be one.", correct: 'emotional-reasoning' },
    { thought: "Nothing ever works out for me. This always happens.", correct: 'overgeneralization' },
    { thought: "I didn't get the promotion — my career is completely over.", correct: 'catastrophizing' },
    { thought: "If I can't do it perfectly, there's no point in trying at all.", correct: 'all-or-nothing' },
    { thought: "Everyone at the party was judging me the whole time.", correct: 'mind-reading' },
];

// ========== THOUGHT CATEGORIZER DATA ==========
const TC_CATEGORIES = [
    { id: 'all-or-nothing', name: 'All-or-Nothing' },
    { id: 'catastrophizing', name: 'Catastrophizing' },
    { id: 'mind-reading', name: 'Mind Reading' },
];

const TC_THOUGHTS = [
    { id: 'tc1', text: "If I'm not perfect, I'm a total failure.", category: 'all-or-nothing' },
    { id: 'tc2', text: "This one setback means everything is ruined.", category: 'catastrophizing' },
    { id: 'tc3', text: "They think I'm not good enough.", category: 'mind-reading' },
    { id: 'tc4', text: "I either do it right or not at all.", category: 'all-or-nothing' },
    { id: 'tc5', text: "If I fail this test, my life is over.", category: 'catastrophizing' },
    { id: 'tc6', text: "Everyone is secretly judging me.", category: 'mind-reading' },
];

// ========== REFRAME BUILDER DATA ==========
const RB_SCENARIOS = [
    {
        id: 'rb1', distorted: "I made a mistake on the presentation — I'm completely incompetent.",
        distortion: 'All-or-Nothing Thinking',
        parts: [
            "I made a mistake, but ",
            { type: 'blank', id: 'rb1-b1', options: ['everyone makes mistakes', 'I am completely incompetent', 'mistakes are unforgivable'], correct: 'everyone makes mistakes' },
            ". I can ",
            { type: 'blank', id: 'rb1-b2', options: ['learn from this experience', 'never show my face again', 'give up entirely'], correct: 'learn from this experience' },
            "."
        ]
    },
    {
        id: 'rb2', distorted: "They didn't reply to my text — they must hate me now.",
        distortion: 'Mind Reading',
        parts: [
            "They haven't replied yet, which could mean ",
            { type: 'blank', id: 'rb2-b1', options: ["they're busy right now", 'they definitely hate me', "I'm worthless"], correct: "they're busy right now" },
            ". I'll try to ",
            { type: 'blank', id: 'rb2-b2', options: ['give them space and not assume', 'never text them again', 'send 10 follow-up messages'], correct: 'give them space and not assume' },
            "."
        ]
    }
];

// ========== COPING SKILLS GAME DATA ==========
const CSM_CATEGORIES = [
    { id: 'physical', name: 'Physical' },
    { id: 'emotional', name: 'Emotional' },
    { id: 'mental', name: 'Mental' },
    { id: 'sensory', name: 'Sensory' },
    { id: 'social', name: 'Social' },
];

const CSM_SKILLS = [
    { id: 'cs1', text: 'Go for a walk or run', category: 'physical' },
    { id: 'cs2', text: 'Take a warm shower', category: 'physical' },
    { id: 'cs3', text: 'Journal your feelings', category: 'emotional' },
    { id: 'cs4', text: 'Listen to calming music', category: 'emotional' },
    { id: 'cs5', text: 'Practice deep breathing', category: 'mental' },
    { id: 'cs6', text: 'Do a crossword puzzle', category: 'mental' },
    { id: 'cs7', text: 'Light a scented candle', category: 'sensory' },
    { id: 'cs8', text: 'Wrap up in a soft blanket', category: 'sensory' },
    { id: 'cs9', text: 'Call a supportive friend', category: 'social' },
    { id: 'cs10', text: 'Attend a support group', category: 'social' },
];

// ========== FRUSTRATION TOLERANCE DATA ==========
const FT_BELIEFS = [
    { id: 'ft1', text: "I should get my way.", reframe: "I prefer to get my way, but I can tolerate it when I don't." },
    { id: 'ft2', text: "People should treat me fairly.", reframe: "I'd like fair treatment, but people act according to their own perspectives." },
    { id: 'ft3', text: "I can't stand feeling uncomfortable.", reframe: "Discomfort is temporary — I've handled hard things before." },
    { id: 'ft4', text: "Things should be easier than this.", reframe: "Difficulty is part of growth. I'm building resilience right now." },
    { id: 'ft5', text: "I shouldn't have to wait for what I want.", reframe: "Patience is a skill I'm developing. Good things take time." },
    { id: 'ft6', text: "It's unbearable when things don't go as planned.", reframe: "It's uncomfortable, but I can adapt. Flexibility is strength." },
    { id: 'ft7', text: "Other people cause my frustration.", reframe: "I choose how I respond. My reactions are within my control." },
    { id: 'ft8', text: "If I get frustrated, I've failed.", reframe: "Frustration is a normal human emotion — it doesn't define my recovery." },
];

// ========== GAME STATE ==========
let _activeGame = null;

// Identify Distortions state
let _idScenarios = [];
let _idCurrentIndex = 0;
let _idScore = 0;
let _idSelected = null;
let _idIsCorrect = null;

// Thought Categorizer state
let _tcThoughts = [];
let _tcPlaced = {};
let _tcScore = 0;

// Reframe Builder state
let _rbCurrentIndex = 0;
let _rbScore = 0;
let _rbAnswers = {};
let _rbShowFeedback = false;

// Coping Skills state
let _csmSkills = [];
let _csmPlaced = {};
let _csmScore = 0;

// Frustration Tolerance state
let _ftCurrentIndex = 0;
let _ftScore = 0;
let _ftShowReframe = false;

// AI Reframe Studio state
let _aiStep = 'input';
let _aiThought = '';
let _aiIntensity = 5;
let _aiAnalysis = null;
let _aiUserReframe = '';
let _aiNewIntensity = 5;
let _aiError = null;

// Touch drag state
let _touchDragItem = null;
let _touchGhost = null;

// ========== UTILITY FUNCTIONS ==========
function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function escapeHtmlGame(str) {
    if (typeof escapeHtml === 'function') return escapeHtml(str);
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ========== OVERLAY MANAGEMENT ==========
function openGame(gameId) {
    _activeGame = gameId;
    const overlay = document.getElementById('gameOverlay');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    const content = document.getElementById('gameContent');
    const progress = document.getElementById('gameProgress');

    switch (gameId) {
        case 'identify-distortions': initIdentifyDistortions(content, progress); break;
        case 'thought-categorizer': initThoughtCategorizer(content, progress); break;
        case 'reframe-builder': initReframeBuilder(content, progress); break;
        case 'coping-skills-game': initCopingSkillsGame(content, progress); break;
        case 'frustration-tolerance': initFrustrationTolerance(content, progress); break;
        case 'ai-reframe-studio': initAIReframeStudio(content, progress); break;
    }
}
window.openGame = openGame;

function closeGame() {
    _activeGame = null;
    const overlay = document.getElementById('gameOverlay');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    // Clean up touch ghost
    if (_touchGhost) { _touchGhost.remove(); _touchGhost = null; }
    // Refresh hub
    if (typeof window.renderChallengesHub === 'function') window.renderChallengesHub();
}
window.closeGame = closeGame;

// ========== CHALLENGES HUB ==========
async function renderChallengesHub() {
    const container = document.querySelector('#challenges-hub .challenges-hub-container');
    if (!container) return;

    // Load gamification data
    let xp = 0, levelInfo = null, badges = [];
    try {
        if (typeof window.getGameData === 'function') {
            const gameData = await window.getGameData();
            xp = gameData.reframeXP || 0;
            badges = gameData.gameBadges || [];
            levelInfo = getLevelForXP(xp);
        }
    } catch (e) { console.error('Hub gamification error:', e); }

    if (!levelInfo) levelInfo = { current: { icon: '🌱', name: 'Seedling' }, next: { xpRequired: 100 }, progress: 0 };

    let html = '';

    // Gamification row
    html += `<div class="challenges-hub-gamification">
        <span class="challenges-hub-level">${levelInfo.current.icon} ${levelInfo.current.name}</span>
        <span class="challenges-hub-xp">${xp} XP</span>
        <div class="challenges-hub-bar"><div class="challenges-hub-bar-fill" style="width:${levelInfo.progress}%"></div></div>
    </div>`;

    // Game cards grid
    html += '<div class="games-grid">';
    for (const game of GAME_CONFIGS) {
        const featuredClass = game.featured ? ' featured' : '';
        html += `<div class="game-card${featuredClass}" onclick="openGame('${game.id}')">`;
        if (game.featured) html += '<span class="game-card-new-badge">AI Powered</span>';
        html += `<div class="game-card-icon">${game.icon}</div>`;
        html += `<div class="game-card-title">${game.title}</div>`;
        html += `<div class="game-card-desc">${game.desc}</div>`;
        html += `<div class="game-card-xp">${game.xpRange}</div>`;
        html += `<button class="game-card-play-btn" onclick="event.stopPropagation(); openGame('${game.id}')">Play</button>`;
        html += '</div>';
    }
    html += '</div>';

    // Badge showcase
    html += '<div class="badge-showcase"><h3>Badges</h3><div class="badge-grid">';
    for (const badge of CHALLENGE_BADGES) {
        const earned = badges.includes(badge.id) || (badge.id === 'first_session' && xp > 0) || (badge.id === 'xp_100' && xp >= 100);
        html += `<div class="badge-item${earned ? '' : ' locked'}">
            <div class="badge-item-icon">${badge.icon}</div>
            <div class="badge-item-name">${badge.name}</div>
            <div class="badge-item-desc">${badge.desc}</div>
        </div>`;
    }
    html += '</div></div>';

    container.innerHTML = html;
}
window.renderChallengesHub = renderChallengesHub;

// ========== SHARED: Award XP + Save Session ==========
async function completeGame(gameId, xpEarned, score, maxScore) {
    const xpResult = { totalXP: xpEarned, breakdown: [{ label: 'Score', xp: xpEarned }] };

    // Award XP via existing system
    try {
        if (typeof awardXP === 'function') {
            await awardXP(xpResult);
        }
    } catch (e) { console.error('XP award error:', e); }

    // Save game session to Firestore
    try {
        if (typeof window.saveGameSession === 'function') {
            await window.saveGameSession({ gameId, xpEarned, score, maxScore });
        }
    } catch (e) { console.error('Save session error:', e); }

    // Check badges
    let newBadges = [];
    try {
        newBadges = await checkAndAwardBadges(gameId);
    } catch (e) { console.error('Badge check error:', e); }

    return { xpResult, newBadges };
}

async function checkAndAwardBadges(gameId) {
    if (typeof window.getGameData !== 'function' || typeof window.saveGameData !== 'function') return [];
    try {
        const gameData = await window.getGameData();
        const currentBadges = gameData.gameBadges || [];
        const xp = gameData.reframeXP || 0;
        const newBadges = [];

        if (!currentBadges.includes('first_session') && xp > 0) newBadges.push('first_session');
        if (!currentBadges.includes('xp_100') && xp >= 100) newBadges.push('xp_100');
        if (gameId === 'thought-categorizer' && !currentBadges.includes('master_dichotomous')) newBadges.push('master_dichotomous');
        if (gameId === 'ai-reframe-studio' && !currentBadges.includes('ai_reframe_master')) newBadges.push('ai_reframe_master');
        if (gameId === 'coping-skills-game' && !currentBadges.includes('coping_master')) newBadges.push('coping_master');

        if (newBadges.length > 0) {
            await window.saveGameData({ gameBadges: [...currentBadges, ...newBadges] });
        }
        return newBadges;
    } catch (e) { return []; }
}

function renderGameCelebration(content, title, subtitle, xpResult, newBadges) {
    let html = '<div class="game-celebration">';
    html += '<div class="game-celebration-icon">🎉</div>';
    html += `<div class="game-celebration-title">${title}</div>`;
    if (subtitle) html += `<div class="game-celebration-subtitle">${subtitle}</div>`;

    if (xpResult) {
        html += `<div class="game-xp-gain"><span class="game-xp-number">+${xpResult.totalXP} XP</span></div>`;
        if (xpResult.breakdown && xpResult.breakdown.length > 1) {
            html += '<div class="game-xp-breakdown">';
            xpResult.breakdown.forEach(b => { html += `<span class="game-xp-item">${b.label}: +${b.xp}</span>`; });
            html += '</div>';
        }
        if (xpResult.currentLevel) {
            html += `<div class="game-level-display">
                <div class="game-level-name">${xpResult.currentLevel.icon} ${xpResult.currentLevel.name}</div>
                <div class="game-level-bar"><div class="game-level-fill" style="width:${xpResult.levelProgress || 0}%"></div></div>
                <div class="game-level-xp-text">${xpResult.currentXP || 0} / ${xpResult.nextLevelXP || 100} XP</div>
            </div>`;
        }
        if (xpResult.leveledUp) {
            html += `<div class="game-level-up">🎉 Level Up! You are now <strong>${xpResult.currentLevel.name}</strong></div>`;
        }
    }

    if (newBadges && newBadges.length > 0) {
        newBadges.forEach(badgeId => {
            const def = CHALLENGE_BADGES.find(b => b.id === badgeId);
            if (def) {
                html += `<div class="game-badge-award"><span class="game-badge-award-icon">${def.icon}</span><span class="game-badge-award-text">New Badge: ${def.name}</span></div>`;
            }
        });
    }

    html += `<div class="game-action-row">
        <button class="game-btn game-btn-secondary" onclick="closeGame()">Return to Hub</button>
    </div>`;
    html += '</div>';
    content.innerHTML = html;

    if (typeof launchOnboardingConfetti === 'function') launchOnboardingConfetti();
}

// ========== GAME 1: IDENTIFY DISTORTIONS ==========
function initIdentifyDistortions(content, progress) {
    _idScenarios = shuffleArray(ID_SCENARIOS).slice(0, 5);
    _idCurrentIndex = 0;
    _idScore = 0;
    _idSelected = null;
    _idIsCorrect = null;
    renderIdGame(content, progress);
}

function renderIdGame(content, progress) {
    if (!content) content = document.getElementById('gameContent');
    if (!progress) progress = document.getElementById('gameProgress');

    progress.innerHTML = `<span class="game-progress-label">Question ${_idCurrentIndex + 1} of 5</span><span class="game-progress-xp">${_idScore} XP</span>`;

    const scenario = _idScenarios[_idCurrentIndex];
    let html = '<div class="game-step-card">';
    html += '<div class="game-step-title">What distortion is this?</div>';
    html += '<div class="game-step-subtitle">Read the thought below and identify the cognitive distortion.</div>';
    html += `<div class="game-thought-box distorted">"${escapeHtmlGame(scenario.thought)}"</div>`;
    html += '<div class="game-choices">';
    ID_DISTORTIONS.forEach(d => {
        let cls = 'game-choice-btn';
        if (_idSelected) {
            cls += ' disabled';
            if (d.id === scenario.correct) cls += ' correct correct-answer';
            if (d.id === _idSelected && d.id !== scenario.correct) cls += ' incorrect';
        }
        html += `<button class="${cls}" onclick="handleIdSelect('${d.id}')">${d.name}</button>`;
    });
    html += '</div>';

    if (_idSelected) {
        const isLast = _idCurrentIndex >= 4;
        html += '<div class="game-action-row">';
        if (!isLast) {
            html += '<button class="game-btn game-btn-primary" onclick="handleIdNext()">Next Thought</button>';
        } else {
            html += `<button class="game-btn game-btn-primary" onclick="handleIdFinish()">Claim ${_idScore} XP & Finish</button>`;
            html += '<button class="game-btn game-btn-secondary" onclick="handleIdReplay()">Play Again</button>';
        }
        html += '</div>';
    }
    html += '</div>';
    content.innerHTML = html;
}

function handleIdSelect(distortionId) {
    if (_idSelected) return;
    _idSelected = distortionId;
    const scenario = _idScenarios[_idCurrentIndex];
    _idIsCorrect = distortionId === scenario.correct;
    if (_idIsCorrect) _idScore += 20;
    renderIdGame();
}
window.handleIdSelect = handleIdSelect;

function handleIdNext() {
    _idCurrentIndex++;
    _idSelected = null;
    _idIsCorrect = null;
    renderIdGame();
}
window.handleIdNext = handleIdNext;

async function handleIdFinish() {
    const content = document.getElementById('gameContent');
    const { xpResult, newBadges } = await completeGame('identify-distortions', _idScore, _idScore / 20, 5);
    renderGameCelebration(content, 'Well Done!', `You scored ${_idScore} out of 100 XP`, xpResult, newBadges);
}
window.handleIdFinish = handleIdFinish;

function handleIdReplay() {
    initIdentifyDistortions(document.getElementById('gameContent'), document.getElementById('gameProgress'));
}
window.handleIdReplay = handleIdReplay;

// ========== GAME 2: THOUGHT CATEGORIZER (Drag & Drop) ==========
function initThoughtCategorizer(content, progress) {
    _tcThoughts = shuffleArray(TC_THOUGHTS);
    _tcPlaced = {};
    _tcScore = 0;
    renderTcGame(content, progress);
}

function renderTcGame(content, progress) {
    if (!content) content = document.getElementById('gameContent');
    if (!progress) progress = document.getElementById('gameProgress');

    const placedCount = Object.keys(_tcPlaced).length;
    const allPlaced = placedCount === _tcThoughts.length;
    progress.innerHTML = `<span class="game-progress-label">Placed ${placedCount} of ${_tcThoughts.length}</span><span class="game-progress-xp">${_tcScore} XP</span>`;

    let html = '<div class="game-step-card">';
    html += '<div class="game-step-title">Categorize These Thoughts</div>';
    html += '<div class="game-step-subtitle">Drag each distorted thought into its correct category.</div>';

    html += '<div class="game-dd-layout">';

    // Pool (unplaced items)
    html += '<div class="game-dd-pool"><div class="game-dd-pool-title">Thoughts</div>';
    _tcThoughts.forEach(t => {
        if (!_tcPlaced[t.id]) {
            html += `<div class="game-dd-item" draggable="true" data-id="${t.id}"
                ontouchstart="handleTouchStart(event, '${t.id}', '${escapeHtmlGame(t.text)}')"
                ondragstart="event.dataTransfer.setData('text/plain','${t.id}')">
                <span class="grip-icon">&#9776;</span>${escapeHtmlGame(t.text)}</div>`;
        }
    });
    html += '</div>';

    // Drop zones
    html += '<div class="game-dd-zones cols-3">';
    TC_CATEGORIES.forEach(cat => {
        html += `<div class="game-dd-zone" data-cat="${cat.id}"
            ondragover="event.preventDefault(); this.classList.add('drag-over')"
            ondragleave="this.classList.remove('drag-over')"
            ondrop="handleTcDrop(event, '${cat.id}')">
            <div class="game-dd-zone-title">${cat.name}</div>`;
        // Show placed items
        _tcThoughts.forEach(t => {
            if (_tcPlaced[t.id] === cat.id) {
                html += `<div class="game-dd-placed"><span class="check-icon">&#10003;</span>${escapeHtmlGame(t.text)}</div>`;
            }
        });
        html += '</div>';
    });
    html += '</div></div>';

    if (allPlaced) {
        html += '<div class="game-action-row">';
        html += `<button class="game-btn game-btn-primary" onclick="handleTcFinish()">Claim ${_tcScore} XP & Finish</button>`;
        html += '<button class="game-btn game-btn-secondary" onclick="handleTcReplay()">Practice Again</button>';
        html += '</div>';
    }

    html += '</div>';
    content.innerHTML = html;

    // Add touch event listeners to zones
    document.querySelectorAll('.game-dd-zone').forEach(zone => {
        zone.setAttribute('data-drop-zone', 'true');
    });
}

function handleTcDrop(event, categoryId) {
    event.preventDefault();
    event.currentTarget.classList.remove('drag-over');
    const thoughtId = event.dataTransfer ? event.dataTransfer.getData('text/plain') : null;
    if (!thoughtId) return;
    placeTcItem(thoughtId, categoryId);
}
window.handleTcDrop = handleTcDrop;

function placeTcItem(thoughtId, categoryId) {
    const thought = _tcThoughts.find(t => t.id === thoughtId);
    if (!thought || _tcPlaced[thoughtId]) return;
    if (thought.category === categoryId) {
        _tcPlaced[thoughtId] = categoryId;
        _tcScore += 15;
    }
    renderTcGame();
}

async function handleTcFinish() {
    const content = document.getElementById('gameContent');
    const { xpResult, newBadges } = await completeGame('thought-categorizer', _tcScore, Object.keys(_tcPlaced).length, _tcThoughts.length);
    renderGameCelebration(content, 'Great Job!', `You categorized ${Object.keys(_tcPlaced).length} of ${_tcThoughts.length} thoughts correctly`, xpResult, newBadges);
}
window.handleTcFinish = handleTcFinish;

function handleTcReplay() {
    initThoughtCategorizer(document.getElementById('gameContent'), document.getElementById('gameProgress'));
}
window.handleTcReplay = handleTcReplay;

// ========== GAME 3: REFRAME BUILDER ==========
function initReframeBuilder(content, progress) {
    _rbCurrentIndex = 0;
    _rbScore = 0;
    _rbAnswers = {};
    _rbShowFeedback = false;
    renderRbGame(content, progress);
}

function renderRbGame(content, progress) {
    if (!content) content = document.getElementById('gameContent');
    if (!progress) progress = document.getElementById('gameProgress');

    progress.innerHTML = `<span class="game-progress-label">Scenario ${_rbCurrentIndex + 1} of ${RB_SCENARIOS.length}</span><span class="game-progress-xp">${_rbScore} XP</span>`;

    const scenario = RB_SCENARIOS[_rbCurrentIndex];
    let html = '<div class="game-step-card">';
    html += '<div class="game-step-title">Complete the Reframe</div>';
    html += `<div class="game-step-subtitle">Distortion: ${scenario.distortion}</div>`;
    html += `<div class="game-thought-box distorted">"${escapeHtmlGame(scenario.distorted)}"</div>`;

    // Build reframe sentence with inline selects
    html += '<div class="game-reframe-sentence">';
    scenario.parts.forEach(part => {
        if (typeof part === 'string') {
            html += part;
        } else {
            const val = _rbAnswers[part.id] || '';
            let cls = 'game-blank-select';
            if (val) cls += ' answered';
            if (_rbShowFeedback) {
                cls += val === part.correct ? ' correct' : ' wrong';
            }
            html += `<select class="${cls}" onchange="handleRbAnswer('${part.id}', this.value)">`;
            html += '<option value="">Choose...</option>';
            part.options.forEach(opt => {
                const sel = val === opt ? ' selected' : '';
                html += `<option value="${escapeHtmlGame(opt)}"${sel}>${escapeHtmlGame(opt)}</option>`;
            });
            html += '</select>';
        }
    });
    html += '</div>';

    // Check / Next buttons
    const blanks = scenario.parts.filter(p => typeof p !== 'string');
    const allFilled = blanks.every(b => _rbAnswers[b.id]);
    html += '<div class="game-action-row">';
    if (!_rbShowFeedback && allFilled) {
        html += '<button class="game-btn game-btn-primary" onclick="handleRbCheck()">Check Reframe</button>';
    }
    if (_rbShowFeedback) {
        const isLast = _rbCurrentIndex >= RB_SCENARIOS.length - 1;
        if (!isLast) {
            html += '<button class="game-btn game-btn-primary" onclick="handleRbNext()">Next Scenario</button>';
        } else {
            html += `<button class="game-btn game-btn-primary" onclick="handleRbFinish()">Claim ${_rbScore} XP & Finish</button>`;
        }
    }
    html += '</div></div>';
    content.innerHTML = html;
}

function handleRbAnswer(blankId, value) {
    _rbAnswers[blankId] = value;
    renderRbGame();
}
window.handleRbAnswer = handleRbAnswer;

function handleRbCheck() {
    const scenario = RB_SCENARIOS[_rbCurrentIndex];
    const blanks = scenario.parts.filter(p => typeof p !== 'string');
    blanks.forEach(b => {
        if (_rbAnswers[b.id] === b.correct) _rbScore += 20;
    });
    _rbShowFeedback = true;
    renderRbGame();
}
window.handleRbCheck = handleRbCheck;

function handleRbNext() {
    _rbCurrentIndex++;
    _rbAnswers = {};
    _rbShowFeedback = false;
    renderRbGame();
}
window.handleRbNext = handleRbNext;

async function handleRbFinish() {
    const content = document.getElementById('gameContent');
    const totalBlanks = RB_SCENARIOS.reduce((acc, s) => acc + s.parts.filter(p => typeof p !== 'string').length, 0);
    const { xpResult, newBadges } = await completeGame('reframe-builder', _rbScore, _rbScore / 20, totalBlanks);
    renderGameCelebration(content, 'Nice Reframing!', `You earned ${_rbScore} XP`, xpResult, newBadges);
}
window.handleRbFinish = handleRbFinish;

// ========== GAME 4: COPING SKILLS MENU (Drag & Drop) ==========
function initCopingSkillsGame(content, progress) {
    _csmSkills = shuffleArray(CSM_SKILLS);
    _csmPlaced = {};
    _csmScore = 0;
    renderCsmGame(content, progress);
}

function renderCsmGame(content, progress) {
    if (!content) content = document.getElementById('gameContent');
    if (!progress) progress = document.getElementById('gameProgress');

    const placedCount = Object.keys(_csmPlaced).length;
    const allPlaced = placedCount === _csmSkills.length;
    progress.innerHTML = `<span class="game-progress-label">Placed ${placedCount} of ${_csmSkills.length}</span><span class="game-progress-xp">${_csmScore} XP</span>`;

    let html = '<div class="game-step-card">';
    html += '<div class="game-step-title">Build Your Coping Menu</div>';
    html += '<div class="game-step-subtitle">Drag each coping skill into its correct category.</div>';

    html += '<div class="game-dd-layout">';

    // Pool
    html += '<div class="game-dd-pool"><div class="game-dd-pool-title">Available Skills</div>';
    _csmSkills.forEach(s => {
        if (!_csmPlaced[s.id]) {
            html += `<div class="game-dd-item" draggable="true" data-id="${s.id}"
                ontouchstart="handleTouchStart(event, '${s.id}', '${escapeHtmlGame(s.text)}')"
                ondragstart="event.dataTransfer.setData('text/plain','${s.id}')">
                <span class="grip-icon">&#9776;</span>${escapeHtmlGame(s.text)}</div>`;
        }
    });
    html += '</div>';

    // Drop zones (5 categories, 2-col grid)
    html += '<div class="game-dd-zones cols-2">';
    CSM_CATEGORIES.forEach(cat => {
        html += `<div class="game-dd-zone" data-cat="${cat.id}"
            ondragover="event.preventDefault(); this.classList.add('drag-over')"
            ondragleave="this.classList.remove('drag-over')"
            ondrop="handleCsmDrop(event, '${cat.id}')">
            <div class="game-dd-zone-title">${cat.name}</div>`;
        _csmSkills.forEach(s => {
            if (_csmPlaced[s.id] === cat.id) {
                html += `<div class="game-dd-placed"><span class="check-icon">&#10003;</span>${escapeHtmlGame(s.text)}</div>`;
            }
        });
        html += '</div>';
    });
    html += '</div></div>';

    if (allPlaced) {
        html += '<div class="game-action-row">';
        html += `<button class="game-btn game-btn-primary" onclick="handleCsmFinish()">Claim ${_csmScore} XP & Finish</button>`;
        html += '<button class="game-btn game-btn-secondary" onclick="handleCsmReplay()">Practice Again</button>';
        html += '</div>';
    }

    html += '</div>';
    content.innerHTML = html;

    document.querySelectorAll('.game-dd-zone').forEach(zone => {
        zone.setAttribute('data-drop-zone', 'true');
    });
}

function handleCsmDrop(event, categoryId) {
    event.preventDefault();
    event.currentTarget.classList.remove('drag-over');
    const skillId = event.dataTransfer ? event.dataTransfer.getData('text/plain') : null;
    if (!skillId) return;
    placeCsmItem(skillId, categoryId);
}
window.handleCsmDrop = handleCsmDrop;

function placeCsmItem(skillId, categoryId) {
    const skill = _csmSkills.find(s => s.id === skillId);
    if (!skill || _csmPlaced[skillId]) return;
    if (skill.category === categoryId) {
        _csmPlaced[skillId] = categoryId;
        _csmScore += 10;
    }
    renderCsmGame();
}

async function handleCsmFinish() {
    const content = document.getElementById('gameContent');
    const { xpResult, newBadges } = await completeGame('coping-skills-game', _csmScore, Object.keys(_csmPlaced).length, _csmSkills.length);
    renderGameCelebration(content, 'Toolkit Built!', `You categorized ${Object.keys(_csmPlaced).length} coping skills`, xpResult, newBadges);
}
window.handleCsmFinish = handleCsmFinish;

function handleCsmReplay() {
    initCopingSkillsGame(document.getElementById('gameContent'), document.getElementById('gameProgress'));
}
window.handleCsmReplay = handleCsmReplay;

// ========== GAME 5: FRUSTRATION TOLERANCE ==========
function initFrustrationTolerance(content, progress) {
    _ftCurrentIndex = 0;
    _ftScore = 0;
    _ftShowReframe = false;
    renderFtGame(content, progress);
}

function renderFtGame(content, progress) {
    if (!content) content = document.getElementById('gameContent');
    if (!progress) progress = document.getElementById('gameProgress');

    progress.innerHTML = `<span class="game-progress-label">Belief ${_ftCurrentIndex + 1} of ${FT_BELIEFS.length}</span><span class="game-progress-xp">${_ftScore} XP</span>`;

    const belief = FT_BELIEFS[_ftCurrentIndex];
    let html = '<div class="game-step-card">';
    html += '<div class="game-step-title">Frustration Tolerance</div>';
    html += '<div class="game-step-subtitle">Challenge this frustration-driving belief.</div>';

    if (!_ftShowReframe) {
        html += `<div class="game-ft-card belief">
            <div class="game-ft-card-icon">⚡</div>
            <div class="game-ft-card-text">"${escapeHtmlGame(belief.text)}"</div>
            <button class="game-btn game-btn-warning" onclick="handleFtChallenge()">Challenge This Thought</button>
        </div>`;
    } else {
        html += `<div class="game-ft-card reframe">
            <div class="game-ft-card-icon">🎯</div>
            <div class="game-ft-card-text">"${escapeHtmlGame(belief.reframe)}"</div>`;
        const isLast = _ftCurrentIndex >= FT_BELIEFS.length - 1;
        html += '<div class="game-action-row">';
        if (!isLast) {
            html += '<button class="game-btn game-btn-primary" onclick="handleFtNext()">Next Belief</button>';
        } else {
            html += `<button class="game-btn game-btn-primary" onclick="handleFtFinish()">Claim ${_ftScore} XP & Finish</button>`;
            html += '<button class="game-btn game-btn-secondary" onclick="handleFtReplay()">Play Again</button>';
        }
        html += '</div></div>';
    }

    html += '</div>';
    content.innerHTML = html;
}

function handleFtChallenge() {
    _ftShowReframe = true;
    _ftScore += 15;
    renderFtGame();
}
window.handleFtChallenge = handleFtChallenge;

function handleFtNext() {
    _ftCurrentIndex++;
    _ftShowReframe = false;
    renderFtGame();
}
window.handleFtNext = handleFtNext;

async function handleFtFinish() {
    const content = document.getElementById('gameContent');
    const { xpResult, newBadges } = await completeGame('frustration-tolerance', _ftScore, _ftCurrentIndex + 1, FT_BELIEFS.length);
    renderGameCelebration(content, 'Tolerance Built!', `You reframed ${_ftCurrentIndex + 1} frustration beliefs`, xpResult, newBadges);
}
window.handleFtFinish = handleFtFinish;

function handleFtReplay() {
    initFrustrationTolerance(document.getElementById('gameContent'), document.getElementById('gameProgress'));
}
window.handleFtReplay = handleFtReplay;

// ========== GAME 6: AI REFRAME STUDIO ==========
function initAIReframeStudio(content, progress) {
    _aiStep = 'input';
    _aiThought = '';
    _aiIntensity = 5;
    _aiAnalysis = null;
    _aiUserReframe = '';
    _aiNewIntensity = 5;
    _aiError = null;
    renderAiGame(content, progress);
}

function renderAiGame(content, progress) {
    if (!content) content = document.getElementById('gameContent');
    if (!progress) progress = document.getElementById('gameProgress');

    const stepLabels = { input: 'Share Your Thought', analyzing: 'Analyzing...', reveal: 'Distortions Found', reframe: 'Write Your Reframe', complete: 'Complete' };
    progress.innerHTML = `<span class="game-progress-label">${stepLabels[_aiStep]}</span><span class="game-progress-xp">AI Reframe Studio</span>`;

    switch (_aiStep) {
        case 'input': renderAiInput(content); break;
        case 'analyzing': renderAiLoading(content); break;
        case 'reveal': renderAiReveal(content); break;
        case 'reframe': renderAiReframe(content); break;
        case 'complete': renderAiComplete(content); break;
    }
}

function renderAiInput(content) {
    let html = '<div class="game-step-card">';
    html += '<div class="game-step-title">What thought is bothering you?</div>';
    html += '<div class="game-step-subtitle">Write a thought that\'s been on your mind. Our AI will help you identify any cognitive distortions and guide you toward a balanced reframe.</div>';

    if (_aiError) {
        html += `<div class="game-ai-error">${escapeHtmlGame(_aiError)}</div>`;
    }

    html += `<textarea class="game-ai-textarea" id="aiThoughtInput" placeholder="e.g., I made one mistake and now everyone thinks I'm incompetent..."
        oninput="_aiThought = this.value">${escapeHtmlGame(_aiThought)}</textarea>`;

    html += `<div class="game-ai-slider-row">
        <span class="game-ai-slider-label">Intensity</span>
        <input type="range" class="game-ai-slider distress" min="1" max="10" value="${_aiIntensity}"
            oninput="_aiIntensity = parseInt(this.value); document.getElementById('aiIntensityVal').textContent = this.value">
        <span class="game-ai-slider-value" id="aiIntensityVal">${_aiIntensity}</span>
    </div>`;

    html += '<div class="game-action-row">';
    html += `<button class="game-btn game-btn-primary" onclick="handleAiAnalyze()" ${!_aiThought.trim() ? 'disabled' : ''}>Analyze My Thought</button>`;
    html += '</div></div>';
    content.innerHTML = html;

    // Focus textarea and restore value
    const ta = document.getElementById('aiThoughtInput');
    if (ta) ta.value = _aiThought;
}

function renderAiLoading(content) {
    content.innerHTML = `<div class="game-step-card">
        <div class="game-loading">
            <div class="game-spinner"></div>
            <div class="game-loading-text">Analyzing your thought patterns...</div>
        </div>
    </div>`;
}

function renderAiReveal(content) {
    let html = '<div class="game-step-card">';
    html += '<div class="game-step-title">Distortions Identified</div>';
    html += `<div class="game-thought-box neutral">"${escapeHtmlGame(_aiThought)}"</div>`;

    html += '<div class="game-ai-distortion-list">';
    if (_aiAnalysis && _aiAnalysis.distortions) {
        _aiAnalysis.distortions.forEach(d => {
            html += `<div class="game-ai-distortion-card">
                <div class="game-ai-distortion-name">${escapeHtmlGame(d.name)}</div>
                <div class="game-ai-distortion-explain">${escapeHtmlGame(d.explanation)}</div>`;
            // Show reframe question(s)
            const questions = d.reframingQuestions || (d.reframeQuestion ? [d.reframeQuestion] : []);
            questions.forEach(q => {
                html += `<div class="game-ai-distortion-question">${escapeHtmlGame(q)}</div>`;
            });
            html += '</div>';
        });
    }
    html += '</div>';

    html += '<div class="game-action-row">';
    html += '<button class="game-btn game-btn-primary" onclick="handleAiToReframe()">Reframe This Thought</button>';
    html += '</div></div>';
    content.innerHTML = html;
}

function renderAiReframe(content) {
    let html = '<div class="game-step-card">';
    html += '<div class="game-step-title">Write Your Balanced Thought</div>';
    html += `<div class="game-original-struck">"${escapeHtmlGame(_aiThought)}"</div>`;

    html += `<textarea class="game-ai-textarea reframe-input" id="aiReframeInput" placeholder="Write a more balanced version of your thought..."
        oninput="_aiUserReframe = this.value">${escapeHtmlGame(_aiUserReframe)}</textarea>`;

    html += `<div class="game-ai-slider-row">
        <span class="game-ai-slider-label">New intensity</span>
        <input type="range" class="game-ai-slider" min="1" max="10" value="${_aiNewIntensity}"
            oninput="_aiNewIntensity = parseInt(this.value); document.getElementById('aiNewIntensityVal').textContent = this.value">
        <span class="game-ai-slider-value" id="aiNewIntensityVal">${_aiNewIntensity}</span>
    </div>`;
    html += `<div style="font-size: 0.8rem; opacity: 0.6; color: var(--warm-brown);">Original intensity: ${_aiIntensity}/10</div>`;

    html += '<div class="game-action-row">';
    html += `<button class="game-btn game-btn-primary" onclick="handleAiFinalize()" ${!_aiUserReframe.trim() ? 'disabled' : ''}>Finalize Reframe</button>`;
    html += '</div></div>';
    content.innerHTML = html;

    const ta = document.getElementById('aiReframeInput');
    if (ta) ta.value = _aiUserReframe;
}

async function renderAiComplete(content) {
    const distortionCount = _aiAnalysis ? _aiAnalysis.distortions.length : 0;
    const intensityDrop = Math.max(0, _aiIntensity - _aiNewIntensity);
    const baseXP = 30;
    const distortionXP = distortionCount * 10;
    const dropXP = intensityDrop * 5;
    const totalXP = baseXP + distortionXP + dropXP;

    const xpResult = {
        totalXP,
        breakdown: [
            { label: 'Completion', xp: baseXP },
            { label: `${distortionCount} distortion${distortionCount !== 1 ? 's' : ''}`, xp: distortionXP },
        ]
    };
    if (dropXP > 0) xpResult.breakdown.push({ label: `Intensity -${intensityDrop}`, xp: dropXP });

    try {
        if (typeof awardXP === 'function') await awardXP(xpResult);
    } catch (e) { console.error('XP error:', e); }

    // Save session
    try {
        if (typeof window.saveGameSession === 'function') {
            await window.saveGameSession({
                gameId: 'ai-reframe-studio',
                thought: _aiThought,
                reframe: _aiUserReframe,
                intensityBefore: _aiIntensity,
                intensityAfter: _aiNewIntensity,
                distortions: _aiAnalysis ? _aiAnalysis.distortions.map(d => d.name) : [],
                xpEarned: totalXP
            });
        }
    } catch (e) { console.error('Save error:', e); }

    let newBadges = [];
    try { newBadges = await checkAndAwardBadges('ai-reframe-studio'); } catch (e) {}

    let subtitle = `You earned ${totalXP} XP`;
    if (intensityDrop > 0) subtitle = `You reduced distress by ${intensityDrop} point${intensityDrop > 1 ? 's' : ''}!`;

    // Custom celebration with distress display
    let html = '<div class="game-celebration">';
    html += '<div class="game-celebration-icon">✨</div>';
    html += '<div class="game-celebration-title">Excellent Work!</div>';

    if (intensityDrop > 0) {
        html += `<div class="game-distress-drop">
            <span class="game-distress-num">${_aiIntensity}</span>
            <span class="game-distress-arrow">&#8594;</span>
            <span class="game-distress-num after">${_aiNewIntensity}</span>
        </div>
        <div class="game-distress-text">Distress reduced by ${intensityDrop} point${intensityDrop > 1 ? 's' : ''}</div>`;
    }

    if (_aiUserReframe) {
        html += `<div class="game-thought-box balanced" style="text-align: left; margin: 1rem 0;">"${escapeHtmlGame(_aiUserReframe)}"</div>`;
    }

    html += `<div class="game-xp-gain"><span class="game-xp-number">+${totalXP} XP</span></div>`;
    html += '<div class="game-xp-breakdown">';
    xpResult.breakdown.forEach(b => { html += `<span class="game-xp-item">${b.label}: +${b.xp}</span>`; });
    html += '</div>';

    if (xpResult.currentLevel) {
        html += `<div class="game-level-display">
            <div class="game-level-name">${xpResult.currentLevel.icon} ${xpResult.currentLevel.name}</div>
            <div class="game-level-bar"><div class="game-level-fill" style="width:${xpResult.levelProgress || 0}%"></div></div>
            <div class="game-level-xp-text">${xpResult.currentXP || 0} / ${xpResult.nextLevelXP || 100} XP</div>
        </div>`;
    }
    if (xpResult.leveledUp) {
        html += `<div class="game-level-up">🎉 Level Up! You are now <strong>${xpResult.currentLevel.name}</strong></div>`;
    }

    newBadges.forEach(badgeId => {
        const def = CHALLENGE_BADGES.find(b => b.id === badgeId);
        if (def) {
            html += `<div class="game-badge-award"><span class="game-badge-award-icon">${def.icon}</span><span class="game-badge-award-text">New Badge: ${def.name}</span></div>`;
        }
    });

    html += '<div class="game-action-row">';
    html += '<button class="game-btn game-btn-secondary" onclick="closeGame()">Return to Hub</button>';
    html += '</div></div>';
    content.innerHTML = html;

    if (typeof launchOnboardingConfetti === 'function') launchOnboardingConfetti();
}

async function handleAiAnalyze() {
    // Read current textarea value
    const ta = document.getElementById('aiThoughtInput');
    if (ta) _aiThought = ta.value.trim();
    if (!_aiThought) return;

    _aiStep = 'analyzing';
    _aiError = null;
    renderAiGame();

    try {
        const response = await fetch(WORKER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'analyze-thought',
                thought: _aiThought,
                distressLevel: _aiIntensity
            })
        });
        const data = await response.json();
        let text = data.content?.[0]?.text || '';
        // Strip markdown fences
        text = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
        _aiAnalysis = JSON.parse(text);
        _aiStep = 'reveal';
    } catch (e) {
        console.error('AI analysis error:', e);
        _aiError = 'Something went wrong analyzing your thought. Please try again.';
        _aiStep = 'input';
    }
    renderAiGame();
}
window.handleAiAnalyze = handleAiAnalyze;

function handleAiToReframe() {
    _aiStep = 'reframe';
    renderAiGame();
}
window.handleAiToReframe = handleAiToReframe;

async function handleAiFinalize() {
    const ta = document.getElementById('aiReframeInput');
    if (ta) _aiUserReframe = ta.value.trim();
    if (!_aiUserReframe) return;
    _aiStep = 'complete';
    renderAiGame();
}
window.handleAiFinalize = handleAiFinalize;

// ========== TOUCH DRAG & DROP SUPPORT ==========
function handleTouchStart(event, itemId, itemText) {
    event.preventDefault();
    const touch = event.touches[0];
    _touchDragItem = itemId;

    // Create ghost element
    if (_touchGhost) _touchGhost.remove();
    _touchGhost = document.createElement('div');
    _touchGhost.className = 'game-dd-ghost';
    _touchGhost.textContent = itemText;
    document.body.appendChild(_touchGhost);
    _touchGhost.style.left = (touch.clientX - 60) + 'px';
    _touchGhost.style.top = (touch.clientY - 20) + 'px';

    // Attach move/end listeners
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });
}
window.handleTouchStart = handleTouchStart;

function handleTouchMove(event) {
    event.preventDefault();
    const touch = event.touches[0];
    if (_touchGhost) {
        _touchGhost.style.left = (touch.clientX - 60) + 'px';
        _touchGhost.style.top = (touch.clientY - 20) + 'px';
    }
    // Highlight drop zone under touch
    document.querySelectorAll('.game-dd-zone').forEach(zone => {
        const rect = zone.getBoundingClientRect();
        if (touch.clientX >= rect.left && touch.clientX <= rect.right && touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
            zone.classList.add('drag-over');
        } else {
            zone.classList.remove('drag-over');
        }
    });
}

function handleTouchEnd(event) {
    event.preventDefault();
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);

    const touch = event.changedTouches[0];
    let dropped = false;

    document.querySelectorAll('.game-dd-zone').forEach(zone => {
        zone.classList.remove('drag-over');
        const rect = zone.getBoundingClientRect();
        if (touch.clientX >= rect.left && touch.clientX <= rect.right && touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
            const categoryId = zone.dataset.cat;
            if (_touchDragItem && categoryId) {
                // Determine which game based on active game
                if (_activeGame === 'thought-categorizer') {
                    placeTcItem(_touchDragItem, categoryId);
                } else if (_activeGame === 'coping-skills-game') {
                    placeCsmItem(_touchDragItem, categoryId);
                }
                dropped = true;
            }
        }
    });

    if (_touchGhost) { _touchGhost.remove(); _touchGhost = null; }
    _touchDragItem = null;
}

// ========== ACCESS getLevelForXP FROM APP.JS ==========
// getLevelForXP is defined in app.js and accessible via closure since games.js is loaded after app.js
// If not available, provide a fallback
function getLevelForXP(xp) {
    if (typeof window._getLevelForXP === 'function') return window._getLevelForXP(xp);
    // Fallback using GAME_LEVELS if available on window
    const levels = window.GAME_LEVELS || [
        { level: 1, name: 'Seedling', icon: '🌱', xpRequired: 0 },
        { level: 2, name: 'Sprout', icon: '🌿', xpRequired: 100 },
        { level: 3, name: 'Growing Strong', icon: '🌳', xpRequired: 300 },
        { level: 4, name: 'Flourishing', icon: '🔥', xpRequired: 600 },
        { level: 5, name: 'Thriving', icon: '👑', xpRequired: 1000 },
        { level: 6, name: 'Radiant', icon: '💎', xpRequired: 1500 },
        { level: 7, name: 'Recovery Master', icon: '🌟', xpRequired: 2500 }
    ];
    let current = levels[0], next = levels[1] || levels[0];
    for (let i = levels.length - 1; i >= 0; i--) {
        if (xp >= levels[i].xpRequired) {
            current = levels[i];
            next = levels[i + 1] || levels[i];
            break;
        }
    }
    const progress = next.xpRequired > current.xpRequired
        ? Math.round(((xp - current.xpRequired) / (next.xpRequired - current.xpRequired)) * 100)
        : 100;
    return { current, next, progress };
}
