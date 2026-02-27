// Parent mapping for dropdown nav highlighting
const NAV_PARENT_MAP = {
    'jft': true,
    'daily-reflections': true,
    'thought-for-the-day': true,
    'gratitude': true,
    'journal': true,
    'urges': true,
    'thought-log': true,
    'coping-toolbox': true,
    'workbook': true,
    'safety-plan': true,
    'events': true,
    'community': true,
};

// Pages that require authentication — guests are redirected to auth
const AUTH_GATED_PAGES = new Set(['gratitude', 'journal', 'urges', 'safety-plan', 'thought-log', 'coping-toolbox', 'workbook', 'profile', 'public-profile']);
let _showPageActive = false;

function showPage(pageId) {
    // Auth gate: redirect to sign-in if trying to access gated page while signed out
    if (AUTH_GATED_PAGES.has(pageId) && typeof window.getCurrentUser === 'function' && !window.getCurrentUser()) {
        showPage('auth');
        // Show toast notification
        const toast = document.getElementById('toast');
        if (toast) {
            toast.textContent = 'Sign in to access this feature';
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }
        return;
    }

    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    const target = document.getElementById(pageId);
    if (target) target.classList.add('active');

    // Clear all nav active states
    document.querySelectorAll('.nav-links a[data-page]').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === pageId) link.classList.add('active');
    });
    document.querySelectorAll('.has-dropdown').forEach(dd => dd.classList.remove('active-parent'));

    // Highlight parent dropdown if child page is active
    if (NAV_PARENT_MAP[pageId]) {
        const activeLink = document.querySelector(`.nav-links a[data-page="${pageId}"]`);
        if (activeLink) {
            const parentLi = activeLink.closest('.has-dropdown');
            if (parentLi) parentLi.classList.add('active-parent');
        }
    }

    // Close mobile menu and all dropdowns
    document.getElementById('navLinks').classList.remove('open');
    document.querySelectorAll('.has-dropdown.open').forEach(dd => dd.classList.remove('open'));

    _showPageActive = true;
    if (pageId !== 'shared') window.location.hash = pageId;
    _showPageActive = false;
    window.scrollTo(0, 0);

    // Page-specific callbacks
    if (pageId === 'community') {
        switchCommunityTab(_activeCommunityTab);
        populateMedallionMilestones();
    }
    if (pageId === 'daily-reflections' && window.loadDailyReflections) {
        window.loadDailyReflections();
    }
    if (pageId === 'thought-for-the-day' && window.loadThoughtForTheDay) {
        window.loadThoughtForTheDay();
    }
    if (pageId === 'profile') {
        if (typeof window.loadProfileData === 'function') window.loadProfileData();
        if (typeof syncA11yUI === 'function') syncA11yUI();
        if (typeof initProfilePage === 'function') initProfilePage();
    }
    if (pageId === 'thought-log' && typeof window.loadThoughtEntries === 'function') {
        window.loadThoughtEntries();
    }
    if (pageId === 'coping-toolbox' && typeof window.loadCopingToolbox === 'function') {
        window.loadCopingToolbox();
    }
    if (pageId === 'workbook' && typeof window.loadWorkbookGrid === 'function') {
        window.loadWorkbookGrid();
    }
    if (pageId === 'public-profile') {
        const uid = window._pendingPublicProfileUid;
        if (uid && typeof window.loadPublicProfile === 'function') {
            window.loadPublicProfile(uid);
        }
    }
}
window.showPage = showPage;

function toggleMobileMenu() {
    document.getElementById('navLinks').classList.toggle('open');
    // Close all dropdowns when closing the menu
    if (!document.getElementById('navLinks').classList.contains('open')) {
        document.querySelectorAll('.has-dropdown.open').forEach(dd => dd.classList.remove('open'));
    }
}
window.toggleMobileMenu = toggleMobileMenu;

function toggleAvatarDropdown() {
    document.getElementById('avatarDropdown').classList.toggle('open');
}
window.toggleAvatarDropdown = toggleAvatarDropdown;

// Close avatar dropdown and nav dropdowns on outside click
document.addEventListener('click', (e) => {
    const wrapper = document.getElementById('avatarDropdownWrapper');
    if (wrapper && !wrapper.contains(e.target)) {
        document.getElementById('avatarDropdown').classList.remove('open');
    }
    // Close nav dropdowns on outside click (desktop)
    if (!e.target.closest('.has-dropdown') && !e.target.closest('.mobile-menu-btn')) {
        document.querySelectorAll('.has-dropdown.open').forEach(dd => dd.classList.remove('open'));
    }
});

// Page link click handlers
document.querySelectorAll('.nav-links a[data-page]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        showPage(link.dataset.page);
    });
});

// Dropdown trigger handlers (mobile accordion)
document.querySelectorAll('.nav-dropdown-trigger').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const parentLi = trigger.closest('.has-dropdown');
        // Close other open dropdowns
        document.querySelectorAll('.has-dropdown.open').forEach(dd => {
            if (dd !== parentLi) dd.classList.remove('open');
        });
        parentLi.classList.toggle('open');
        trigger.setAttribute('aria-expanded', parentLi.classList.contains('open') ? 'true' : 'false');
    });
});

function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.add('hidden'));
    if (tab === 'signin') {
        document.querySelector('.auth-tab:first-child').classList.add('active');
        document.getElementById('signinForm').classList.remove('hidden');
    } else {
        document.querySelector('.auth-tab:last-child').classList.add('active');
        document.getElementById('signupForm').classList.remove('hidden');
    }
    document.getElementById('authError').classList.remove('show');
}
window.switchAuthTab = switchAuthTab;

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}
window.showToast = showToast;

// escapeHtml is defined in firebase.js (loaded first) — reference it here for local use
const escapeHtml = window.escapeHtml || function(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

// ========== MOTIVATIONAL QUOTES ==========
const RECOVERY_QUOTES = [
    { text: "Recovery is not a race. You don't have to feel guilty if it takes you longer than you thought it would.", author: "Unknown" },
    { text: "The only person you are destined to become is the person you decide to be.", author: "Ralph Waldo Emerson" },
    { text: "Fall seven times, stand up eight.", author: "Japanese Proverb" },
    { text: "You are allowed to be both a masterpiece and a work in progress simultaneously.", author: "Sophia Bush" },
    { text: "Every moment is a fresh beginning.", author: "T.S. Eliot" },
    { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
    { text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", author: "Ralph Waldo Emerson" },
    { text: "Courage isn't having the strength to go on \u2014 it is going on when you don't have strength.", author: "Napoleon Bonaparte" },
    { text: "One day at a time. One step at a time. One breath at a time.", author: "Recovery Wisdom" },
    { text: "You are not your addiction. You are not your mistakes. You are a human being with an infinite capacity for growth.", author: "Unknown" },
    { text: "The secret of change is to focus all of your energy not on fighting the old, but on building the new.", author: "Socrates" },
    { text: "Recovery is about progression, not perfection.", author: "Unknown" },
    { text: "Healing is not linear.", author: "Unknown" },
    { text: "Be gentle with yourself. You're doing the best you can.", author: "Unknown" },
    { text: "The wound is the place where the light enters you.", author: "Rumi" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "Your present circumstances don't determine where you can go; they merely determine where you start.", author: "Nido Qubein" },
    { text: "We do recover.", author: "NA Basic Text" },
    { text: "Just for today, my thoughts will be on my recovery, living and enjoying life without the use of drugs.", author: "NA Just for Today" },
    { text: "Strength doesn't come from what you can do. It comes from overcoming the things you once thought you couldn't.", author: "Rikki Rogers" },
];

function displayDailyQuote() {
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth()+1) * 100 + today.getDate();
    const index = seed % RECOVERY_QUOTES.length;
    const quote = RECOVERY_QUOTES[index];
    document.getElementById('quoteText').textContent = quote.text;
    document.getElementById('quoteAuthor').textContent = '\u2014 ' + quote.author;
}
displayDailyQuote();

// ========== COMMUNITY WALL HELPERS ==========
window._selectedWallMood = '';
function selectWallMood(btn) {
    document.querySelectorAll('.wall-mood-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    window._selectedWallMood = btn.dataset.mood;
}
window.selectWallMood = selectWallMood;

function updateWallCharCount() {
    const input = document.getElementById('wallPostInput');
    const count = document.getElementById('wallCharCount');
    const len = input.value.length;
    count.textContent = len + '/280';
    count.classList.toggle('over', len > 280);
}
window.updateWallCharCount = updateWallCharCount;

// ========== COMMUNITY HUB DRAWER + TAB SWITCHING ==========
let _activeCommunityTab = 'support';

function switchCommunityTab(tabName) {
    _activeCommunityTab = tabName;

    // Update sidebar item styles
    document.querySelectorAll('.community-drawer-item').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Show/hide tab content
    document.querySelectorAll('.community-tab-content').forEach(content => {
        content.classList.remove('active');
    });

    const tabMap = {
        'milestones': 'communityTabMilestones',
        'support': 'communityTabSupport',
        'medallion': 'communityTabMedallion',
        'gratitude': 'communityTabGratitude',
        'partners': 'communityTabPartners'
    };

    const target = document.getElementById(tabMap[tabName]);
    if (target) target.classList.add('active');

    // Lazy-load data for selected tab
    if (tabName === 'milestones' && window.loadMilestoneFeed) {
        window.loadMilestoneFeed();
    } else if (tabName === 'support' && window.loadCommunityWall) {
        window.loadCommunityWall();
    } else if (tabName === 'medallion' && window.loadMedallionFeed) {
        window.loadMedallionFeed();
    } else if (tabName === 'gratitude' && window.loadSharedGratitudeFeed) {
        window.loadSharedGratitudeFeed();
    } else if (tabName === 'partners' && window.loadPartnersTab) {
        window.loadPartnersTab();
    }
}
window.switchCommunityTab = switchCommunityTab;

function populateMedallionMilestones() {
    const select = document.getElementById('medallionMilestone');
    if (!select || !window.MILESTONES) return;
    if (select.options.length > 1) return; // Already populated
    // Medallions are presented starting at 1 year — filter out anything under 365 days
    window.MILESTONES.filter(m => m.days >= 365).forEach(m => {
        const option = document.createElement('option');
        option.value = m.days;
        option.textContent = `${m.icon} ${m.label}`;
        select.appendChild(option);
    });
}

// ========== JFT CONFIGURATION ==========
const JFT_WORKER_URL = 'https://jft-proxy.kidell-powellj.workers.dev';
// =======================================

function updateJFTDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('jftDate').textContent = new Date().toLocaleDateString('en-US', options);
}

async function loadJFTContent() {
    const loadingEl = document.getElementById('jftLoading');
    const contentEl = document.getElementById('jftContentContainer');
    const errorEl = document.getElementById('jftError');
    
    // Update date regardless
    updateJFTDate();
    
    // Check if worker URL is configured
    if (JFT_WORKER_URL === 'YOUR_CLOUDFLARE_WORKER_URL_HERE') {
        // Worker not configured, show fallback
        loadingEl.style.display = 'none';
        errorEl.style.display = 'block';
        contentEl.style.display = 'none';
        return;
    }

    try {
        const response = await fetch(JFT_WORKER_URL);
        const data = await response.json();

        if (data.success && data.content) {
            // Populate the content
            document.getElementById('jftTitle').textContent = data.title || 'Just for Today';
            
            // Quote section
            if (data.quote) {
                document.getElementById('jftQuoteText').textContent = '"' + data.quote + '"';
                document.getElementById('jftQuoteSource').textContent = data.quoteSource ? '— ' + data.quoteSource : '';
                document.getElementById('jftQuote').style.display = 'block';
            } else {
                document.getElementById('jftQuote').style.display = 'none';
            }
            
            // Main content
            document.getElementById('jftBody').textContent = data.content;
            
            // Closing thought
            const thoughtEl = document.getElementById('jftThought');
            if (data.thought) {
                thoughtEl.querySelector('p').textContent = data.thought;
                thoughtEl.style.display = 'block';
            } else {
                thoughtEl.style.display = 'none';
            }
            
            // Show content, hide loading
            loadingEl.style.display = 'none';
            contentEl.style.display = 'block';
            errorEl.style.display = 'none';
        } else {
            throw new Error('Invalid response');
        }
    } catch (error) {
        console.error('Error loading JFT:', error);
        // Show fallback
        loadingEl.style.display = 'none';
        contentEl.style.display = 'none';
        errorEl.style.display = 'block';
    }
}

// ========== DAILY REFLECTIONS (AA) ==========
const DR_WORKER_URL = 'https://daily-reflections-proxy.kidell-powellj.workers.dev';
let drLoaded = false;

async function loadDailyReflections() {
    if (drLoaded) return;
    const loadingEl = document.getElementById('drLoading');
    const contentEl = document.getElementById('drContentContainer');
    const errorEl = document.getElementById('drError');

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('drDate').textContent = new Date().toLocaleDateString('en-US', options);

    try {
        const response = await fetch(DR_WORKER_URL);
        const data = await response.json();
        if (data.success && data.content) {
            document.getElementById('drTitle').textContent = data.title || 'Daily Reflection';
            if (data.quote) {
                document.getElementById('drQuoteText').textContent = '\u201C' + data.quote + '\u201D';
                document.getElementById('drQuoteSource').textContent = data.quoteSource ? '\u2014 ' + data.quoteSource : '';
                document.getElementById('drQuote').style.display = 'block';
            } else {
                document.getElementById('drQuote').style.display = 'none';
            }
            document.getElementById('drBody').textContent = data.content;
            loadingEl.style.display = 'none';
            contentEl.style.display = 'block';
            errorEl.style.display = 'none';
            drLoaded = true;
        } else {
            throw new Error('Invalid response');
        }
    } catch (error) {
        console.error('Error loading Daily Reflections:', error);
        loadingEl.style.display = 'none';
        contentEl.style.display = 'none';
        errorEl.style.display = 'block';
    }
}
window.loadDailyReflections = loadDailyReflections;

// ========== THOUGHT FOR THE DAY (Hazelden) ==========
const TFTD_WORKER_URL = 'https://thought-for-the-day-proxy.kidell-powellj.workers.dev';
let tftdLoaded = false;

async function loadThoughtForTheDay() {
    if (tftdLoaded) return;
    const loadingEl = document.getElementById('tftdLoading');
    const contentEl = document.getElementById('tftdContentContainer');
    const errorEl = document.getElementById('tftdError');

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('tftdDate').textContent = new Date().toLocaleDateString('en-US', options);

    try {
        const response = await fetch(TFTD_WORKER_URL);
        const data = await response.json();
        if (data.success && data.content) {
            document.getElementById('tftdTitle').textContent = data.title || 'Thought for the Day';
            if (data.quote) {
                document.getElementById('tftdQuoteText').textContent = '\u201C' + data.quote + '\u201D';
                document.getElementById('tftdQuoteSource').textContent = data.quoteSource ? '\u2014 ' + data.quoteSource : '';
                document.getElementById('tftdQuote').style.display = 'block';
            } else {
                document.getElementById('tftdQuote').style.display = 'none';
            }
            document.getElementById('tftdBody').textContent = data.content;
            loadingEl.style.display = 'none';
            contentEl.style.display = 'block';
            errorEl.style.display = 'none';
            tftdLoaded = true;
        } else {
            throw new Error('Invalid response');
        }
    } catch (error) {
        console.error('Error loading Thought for the Day:', error);
        loadingEl.style.display = 'none';
        contentEl.style.display = 'none';
        errorEl.style.display = 'block';
    }
}
window.loadThoughtForTheDay = loadThoughtForTheDay;

document.getElementById('gratitudeForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!window.getCurrentUser || !window.getCurrentUser()) {
        showToast('Please sign in first');
        showPage('auth');
        return;
    }

    const items = [];
    for (let i = 1; i <= 5; i++) {
        const value = document.getElementById(`gratitude${i}`).value;
        if (value.trim()) items.push(value.trim());
    }
    if (items.length === 0) {
        showToast('Please enter at least one gratitude item');
        return;
    }
    try {
        // Save to user's gratitude collection (also creates linked shared entry)
        const entryId = await window.saveGratitudeEntry(items);

        // Get the shared link for this entry
        if (entryId) {
            const sharedQuery = await window.getSharedEntryBySource(entryId);
            if (sharedQuery) {
                const shareUrl = `${window.location.origin}${window.location.pathname}#shared?id=${sharedQuery}`;
                document.getElementById('shareLink').value = shareUrl;
                document.getElementById('shareSection').style.display = 'block';
            }
        }
        clearGratitudeForm();
        window.loadGratitudeEntries();
        showToast('Gratitude saved! 🙏');
    } catch (error) {
        showToast('Error saving gratitude');
    }
});

function clearGratitudeForm() {
    for (let i = 1; i <= 5; i++) document.getElementById(`gratitude${i}`).value = '';
}
window.clearGratitudeForm = clearGratitudeForm;

function copyShareLink() {
    const linkInput = document.getElementById('shareLink');
    linkInput.select();
    navigator.clipboard.writeText(linkInput.value).then(() => showToast('Link copied! 📋'));
}
window.copyShareLink = copyShareLink;

let selectedMood = '';

function selectMood(btn) {
    document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedMood = btn.dataset.mood;
}
window.selectMood = selectMood;

document.getElementById('journalForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!window.getCurrentUser || !window.getCurrentUser()) {
        showToast('Please sign in first');
        showPage('auth');
        return;
    }

    const title = document.getElementById('journalTitle').value.trim();
    const content = document.getElementById('journalContent').value.trim();
    if (!content) {
        showToast('Please write something in your journal');
        return;
    }
    try {
        await window.saveJournalEntry(title, content, selectedMood);
        clearJournalForm();
        window.loadJournalEntries();
        showToast('Journal entry saved! 📝');
    } catch (error) {
        showToast('Error saving journal entry');
    }
});

function clearJournalForm() {
    document.getElementById('journalTitle').value = '';
    document.getElementById('journalContent').value = '';
    document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
    selectedMood = '';
}
window.clearJournalForm = clearJournalForm;

// ========== URGE LOG ==========
let selectedIntensity = null;
let selectedTrigger = '';

function selectIntensity(btn) {
    document.querySelectorAll('.intensity-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedIntensity = parseInt(btn.dataset.intensity);
}
window.selectIntensity = selectIntensity;

function selectTrigger(btn) {
    document.querySelectorAll('.trigger-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedTrigger = btn.dataset.trigger;
}
window.selectTrigger = selectTrigger;

function toggleUrgeDetails() {
    const fields = document.getElementById('urgeDetailFields');
    const toggle = document.querySelector('.urge-detail-toggle');
    const isOpen = fields.style.display !== 'none';
    fields.style.display = isOpen ? 'none' : 'block';
    toggle.classList.toggle('open', !isOpen);
}
window.toggleUrgeDetails = toggleUrgeDetails;

document.getElementById('urgeForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!window.getCurrentUser || !window.getCurrentUser()) {
        showToast('Please sign in first');
        showPage('auth');
        return;
    }

    if (!selectedIntensity) {
        showToast('Please select an intensity level');
        return;
    }

    const triggerNote = document.getElementById('urgeTriggerNote').value.trim();
    const situation = document.getElementById('urgeSituation').value.trim();
    const copedHow = document.getElementById('urgeCopedHow').value.trim();
    const nextTime = document.getElementById('urgeNextTime').value.trim();

    try {
        await window.saveUrgeEntry(selectedIntensity, selectedTrigger, triggerNote, situation, copedHow, nextTime);
        clearUrgeForm();
        window.loadUrgeEntries();
        showToast('Urge logged — you rode that wave! 🌊');
    } catch (error) {
        showToast('Error saving urge entry');
    }
});

function clearUrgeForm() {
    document.querySelectorAll('.intensity-btn').forEach(b => b.classList.remove('selected'));
    document.querySelectorAll('.trigger-btn').forEach(b => b.classList.remove('selected'));
    selectedIntensity = null;
    selectedTrigger = '';
    document.getElementById('urgeTriggerNote').value = '';
    document.getElementById('urgeSituation').value = '';
    document.getElementById('urgeCopedHow').value = '';
    document.getElementById('urgeNextTime').value = '';
    // Collapse detail fields
    document.getElementById('urgeDetailFields').style.display = 'none';
    const toggle = document.querySelector('.urge-detail-toggle');
    if (toggle) toggle.classList.remove('open');
}
window.clearUrgeForm = clearUrgeForm;

async function handleSharedView() {
    const hash = window.location.hash;
    
    // Handle new short ID format: #shared?id=abc123
    if (hash.startsWith('#shared?id=')) {
        try {
            const shareId = hash.split('id=')[1];
            const data = await window.loadSharedGratitude(shareId);
            
            if (!data) {
                showToast('Shared list not found');
                showPage('home');
                return;
            }
            
            document.getElementById('sharedDate').textContent = new Date(data.date).toLocaleDateString('en-US', { 
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
            });
            document.getElementById('sharedList').innerHTML = data.items.map(item => `<li>${escapeHtml(item)}</li>`).join('');
            
            // Show the shared page
            document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
            document.getElementById('shared').classList.add('active');
        } catch (e) {
            console.error('Error loading shared gratitude:', e);
            showToast('Error loading shared list');
            showPage('home');
        }
    }
    // Handle legacy long data format: #shared?data=...
    else if (hash.startsWith('#shared?data=')) {
        try {
            const data = JSON.parse(decodeURIComponent(escape(atob(hash.split('data=')[1]))));
            document.getElementById('sharedDate').textContent = new Date(data.date).toLocaleDateString('en-US', { 
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
            });
            document.getElementById('sharedList').innerHTML = data.items.map(item => `<li>${escapeHtml(item)}</li>`).join('');
            
            // Show the shared page
            document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
            document.getElementById('shared').classList.add('active');
        } catch (e) {
            console.error('Error parsing shared data:', e);
            showPage('home');
        }
    }
}
window.handleSharedView = handleSharedView;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadJFTContent(); // This also calls updateJFTDate()
    
    // Check for shared view or handle initial navigation
    const hash = window.location.hash;
    if (hash.startsWith('#shared?id=')) {
        // Wait for Firebase to be ready before loading shared content
        const waitForFirebase = setInterval(() => {
            if (window.loadSharedGratitude) {
                clearInterval(waitForFirebase);
                handleSharedView();
            }
        }, 100);
        // Timeout after 5 seconds
        setTimeout(() => clearInterval(waitForFirebase), 5000);
    } else if (hash.startsWith('#shared?data=')) {
        handleSharedView();
    } else if (hash && hash !== '#auth' && hash !== '#home' && hash !== '#') {
        const pageId = hash.replace('#', '').split('?')[0];
        if (document.getElementById(pageId)) {
            showPage(pageId);
        } else {
            showPage('home');
        }
    } else {
        showPage('home');
    }
});

// Handle hash changes (browser back/forward buttons)
window.addEventListener('hashchange', () => {
    if (_showPageActive) return; // ignore hash changes triggered by showPage itself
    const hash = window.location.hash;
    if (hash.startsWith('#shared?id=') || hash.startsWith('#shared?data=')) {
        handleSharedView();
    } else if (hash && hash !== '#') {
        const pageId = hash.replace('#', '').split('?')[0];
        if (document.getElementById(pageId)) {
            showPage(pageId);
        }
    } else {
        showPage('home');
    }
});

// ========== COOKIE CONSENT ==========
function acceptCookies() {
    localStorage.setItem('cookie-consent', 'accepted');
    hideCookieBanner();
    if (typeof loadAnalytics === 'function') loadAnalytics();
    if (typeof loadRecaptcha === 'function') loadRecaptcha();
}
window.acceptCookies = acceptCookies;

function declineCookies() {
    localStorage.setItem('cookie-consent', 'declined');
    hideCookieBanner();
}
window.declineCookies = declineCookies;

function hideCookieBanner() {
    const banner = document.getElementById('cookieBanner');
    if (banner) banner.classList.add('hidden');
}

// Show/hide banner on load
(function initCookieBanner() {
    const consent = localStorage.getItem('cookie-consent');
    if (consent) {
        hideCookieBanner();
    }
})();

// ========== FELLOWSHIP RESOURCES ==========
function showFellowship(id) {
    document.getElementById('fellowshipSelector').classList.add('hidden');
    document.querySelectorAll('.fellowship-detail').forEach(d => d.classList.add('hidden'));
    const detail = document.getElementById('fellowship-' + id);
    if (detail) {
        detail.classList.remove('hidden');
        window.scrollTo(0, document.getElementById('resources').offsetTop);
    }
}
window.showFellowship = showFellowship;

function showFellowshipSelector() {
    document.querySelectorAll('.fellowship-detail').forEach(d => d.classList.add('hidden'));
    document.getElementById('fellowshipSelector').classList.remove('hidden');
    window.scrollTo(0, document.getElementById('resources').offsetTop);
}
window.showFellowshipSelector = showFellowshipSelector;

/* ============================================================
   SAFETY PLAN — GUIDED JOURNEY
   ============================================================ */

const JOURNEY_STEPS = [
    {
        key: 'warningSigns',
        icon: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
        question: 'What are your warning signs?',
        subtitle: 'The red flags that tell you trouble might be ahead \u2014 like isolating, skipping meetings, or romanticizing the past.',
        placeholder: 'e.g., Isolating from friends',
        type: 'text'
    },
    {
        key: 'triggers',
        icon: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
        question: 'What triggers you?',
        subtitle: 'People, places, things, and emotions that put you at risk. Knowing them is power.',
        placeholder: 'e.g., Old neighborhoods, paydays',
        type: 'text'
    },
    {
        key: 'copingStrategies',
        icon: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
        question: 'What helps you cope?',
        subtitle: 'Healthy things you can do when the urge hits \u2014 call your sponsor, go to a meeting, exercise, breathe.',
        placeholder: 'e.g., Call my sponsor',
        type: 'text'
    },
    {
        key: 'supportNetwork',
        icon: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
        question: 'Who can you call?',
        subtitle: 'Your sponsor, therapist, trusted friends, family \u2014 add their name and number so they\'re one tap away.',
        placeholder: '',
        type: 'contact'
    },
    {
        key: 'safePlaces',
        icon: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
        question: 'Where do you feel safe?',
        subtitle: 'Physical spaces where you feel grounded \u2014 your home group, a friend\'s house, the gym, a place of worship.',
        placeholder: 'e.g., My home group meeting hall',
        type: 'text'
    },
    {
        key: 'emergencySteps',
        icon: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
        question: 'What\'s your emergency plan?',
        subtitle: 'Step-by-step actions for when you\'re on the edge. Write them so you don\'t have to think \u2014 just follow the steps.',
        placeholder: 'e.g., Step 1: Call my sponsor',
        type: 'numbered'
    },
    {
        key: 'reasonsToStay',
        icon: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
        question: 'Why does recovery matter?',
        subtitle: 'Your children, your health, your goals, the life you\'re building. Write them down for the hard days.',
        placeholder: 'e.g., My children need me present',
        type: 'text'
    }
];

let journeyDraft = {};
let currentJourneyStep = 0;
let journeyIsAnimating = false;

function openSafetyPlanJourney() {
    const overlay = document.getElementById('rppJourneyOverlay');
    if (!overlay) return;

    // Initialize draft from existing data or empty
    const existing = window.rppData || {};
    journeyDraft = {};
    JOURNEY_STEPS.forEach(s => {
        const val = existing[s.key];
        if (Array.isArray(val) && val.length > 0) {
            journeyDraft[s.key] = JSON.parse(JSON.stringify(val)); // deep copy
        } else {
            journeyDraft[s.key] = [];
        }
    });

    currentJourneyStep = 0;
    journeyIsAnimating = false;

    // Build overlay shell
    overlay.innerHTML = `
        <button class="rpp-journey-close" onclick="closeSafetyPlanJourney()" title="Close">&times;</button>
        <div class="rpp-journey-progress" id="rppJourneyProgress"></div>
        <div class="rpp-journey-step-wrapper" id="rppJourneyStepWrapper"></div>
    `;

    renderJourneyProgress();
    renderJourneyStep(0, 'none');

    // Show overlay
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            overlay.classList.add('active');
        });
    });
}
window.openSafetyPlanJourney = openSafetyPlanJourney;

function closeSafetyPlanJourney() {
    const overlay = document.getElementById('rppJourneyOverlay');
    if (!overlay) return;

    overlay.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => {
        overlay.style.display = 'none';
        overlay.innerHTML = '';
    }, 600);
}
window.closeSafetyPlanJourney = closeSafetyPlanJourney;

function renderJourneyProgress() {
    const container = document.getElementById('rppJourneyProgress');
    if (!container) return;

    container.innerHTML = JOURNEY_STEPS.map((step, i) => {
        let cls = 'rpp-journey-dot';
        cls += ` dot-${step.key}`;
        if (i === currentJourneyStep) cls += ' active';
        if (i < currentJourneyStep) cls += ' completed';
        return `<div class="${cls}"></div>`;
    }).join('');
}

function renderJourneyStep(index, direction) {
    const wrapper = document.getElementById('rppJourneyStepWrapper');
    if (!wrapper) return;

    const step = JOURNEY_STEPS[index];
    const items = journeyDraft[step.key] || [];
    const isLast = index === JOURNEY_STEPS.length - 1;
    const isFirst = index === 0;

    let inputHtml = '';
    if (step.type === 'contact') {
        inputHtml = `
            <div class="rpp-journey-contact-row">
                <input type="text" class="rpp-journey-input" id="rppJourneyNameInput"
                       placeholder="Name (e.g., John — Sponsor)">
                <input type="tel" class="rpp-journey-input phone-input" id="rppJourneyPhoneInput"
                       placeholder="Phone number">
                <button class="rpp-journey-add-btn" onclick="addJourneyContact()">Add</button>
            </div>
        `;
    } else {
        inputHtml = `
            <div class="rpp-journey-input-area">
                <input type="text" class="rpp-journey-input" id="rppJourneyTextInput"
                       placeholder="${step.placeholder}">
                <button class="rpp-journey-add-btn" onclick="addJourneyItem('${step.key}')">Add</button>
            </div>
        `;
    }

    let animClass = '';
    if (direction === 'forward') animClass = 'slide-in-right';
    else if (direction === 'back') animClass = 'slide-in-left';

    const html = `
        <div class="rpp-journey-step ${animClass}" id="rppJourneyCurrentStep">
            <div class="rpp-journey-counter">Step ${index + 1} of ${JOURNEY_STEPS.length}</div>
            <div class="rpp-journey-icon icon-${step.key}">
                ${step.icon}
            </div>
            <h2 class="rpp-journey-question">${step.question}</h2>
            <p class="rpp-journey-subtitle">${step.subtitle}</p>
            ${inputHtml}
            <div class="rpp-journey-items" id="rppJourneyItems">
                ${renderJourneyItemsHtml(step.key)}
            </div>
            <div class="rpp-journey-nav">
                ${!isFirst ? '<button class="rpp-journey-nav-btn rpp-journey-back-btn" onclick="prevJourneyStep()">Back</button>' : ''}
                <button class="rpp-journey-nav-btn rpp-journey-next-btn" id="rppJourneyNextBtn"
                        onclick="${isLast ? 'completeJourney()' : 'nextJourneyStep()'}"
                        ${items.length === 0 ? 'disabled' : ''}>
                    ${isLast ? 'Complete My Plan' : 'Next'}
                </button>
            </div>
        </div>
    `;

    wrapper.innerHTML = html;

    // Focus input
    setTimeout(() => {
        const textInput = document.getElementById('rppJourneyTextInput');
        const nameInput = document.getElementById('rppJourneyNameInput');
        if (textInput) textInput.focus();
        else if (nameInput) nameInput.focus();
    }, 400);

    // Enter key handler
    setTimeout(() => {
        const textInput = document.getElementById('rppJourneyTextInput');
        const nameInput = document.getElementById('rppJourneyNameInput');
        const phoneInput = document.getElementById('rppJourneyPhoneInput');

        if (textInput) {
            textInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && textInput.value.trim()) {
                    addJourneyItem(step.key);
                }
            });
        }
        if (phoneInput) {
            phoneInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    addJourneyContact();
                }
            });
        }
        if (nameInput) {
            nameInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const pi = document.getElementById('rppJourneyPhoneInput');
                    if (pi) pi.focus();
                }
            });
        }
    }, 100);
}

function renderJourneyItemsHtml(key) {
    const items = journeyDraft[key] || [];
    if (items.length === 0) return '';

    const step = JOURNEY_STEPS.find(s => s.key === key);

    if (step.type === 'contact') {
        return items.map((item, i) => `
            <div class="rpp-journey-contact-pill">
                <span class="contact-name">${escapeHtml(item.name)}</span>
                <span class="contact-phone">${escapeHtml(item.phone || '')}</span>
                <button class="rpp-journey-pill-remove" onclick="removeJourneyItem('${key}', ${i})">&times;</button>
            </div>
        `).join('');
    }

    if (step.type === 'numbered') {
        return items.map((item, i) => `
            <div class="rpp-journey-numbered-pill">
                <span class="rpp-journey-step-num">${i + 1}</span>
                <span class="pill-text">${escapeHtml(item)}</span>
                <button class="rpp-journey-pill-remove" onclick="removeJourneyItem('${key}', ${i})">&times;</button>
            </div>
        `).join('');
    }

    // Default text pills
    return items.map((item, i) => `
        <div class="rpp-journey-pill">
            <span>${escapeHtml(item)}</span>
            <button class="rpp-journey-pill-remove" onclick="removeJourneyItem('${key}', ${i})">&times;</button>
        </div>
    `).join('');
}

function addJourneyItem(key) {
    const input = document.getElementById('rppJourneyTextInput');
    if (!input) return;
    const val = input.value.trim();
    if (!val) return;

    if (!journeyDraft[key]) journeyDraft[key] = [];
    journeyDraft[key].push(val);
    input.value = '';
    input.focus();

    // Re-render items
    const container = document.getElementById('rppJourneyItems');
    if (container) container.innerHTML = renderJourneyItemsHtml(key);

    // Update next button state
    updateJourneyNextBtn();
}
window.addJourneyItem = addJourneyItem;

function addJourneyContact() {
    const nameInput = document.getElementById('rppJourneyNameInput');
    const phoneInput = document.getElementById('rppJourneyPhoneInput');
    if (!nameInput) return;

    const name = nameInput.value.trim();
    const phone = phoneInput ? phoneInput.value.trim() : '';
    if (!name) return;

    if (!journeyDraft.supportNetwork) journeyDraft.supportNetwork = [];
    journeyDraft.supportNetwork.push({ name, phone });
    nameInput.value = '';
    if (phoneInput) phoneInput.value = '';
    nameInput.focus();

    const container = document.getElementById('rppJourneyItems');
    if (container) container.innerHTML = renderJourneyItemsHtml('supportNetwork');

    updateJourneyNextBtn();
}
window.addJourneyContact = addJourneyContact;

function removeJourneyItem(key, index) {
    if (!journeyDraft[key]) return;
    journeyDraft[key].splice(index, 1);

    const container = document.getElementById('rppJourneyItems');
    if (container) container.innerHTML = renderJourneyItemsHtml(key);

    updateJourneyNextBtn();
}
window.removeJourneyItem = removeJourneyItem;

function updateJourneyNextBtn() {
    const btn = document.getElementById('rppJourneyNextBtn');
    if (!btn) return;
    const step = JOURNEY_STEPS[currentJourneyStep];
    const items = journeyDraft[step.key] || [];
    btn.disabled = items.length === 0;
}

function nextJourneyStep() {
    if (journeyIsAnimating) return;
    if (currentJourneyStep >= JOURNEY_STEPS.length - 1) return;

    journeyIsAnimating = true;
    const currentStep = document.getElementById('rppJourneyCurrentStep');
    if (currentStep) currentStep.className = 'rpp-journey-step slide-out-left';

    setTimeout(() => {
        currentJourneyStep++;
        renderJourneyProgress();
        renderJourneyStep(currentJourneyStep, 'forward');
        journeyIsAnimating = false;
    }, 400);
}
window.nextJourneyStep = nextJourneyStep;

function prevJourneyStep() {
    if (journeyIsAnimating) return;
    if (currentJourneyStep <= 0) return;

    journeyIsAnimating = true;
    const currentStep = document.getElementById('rppJourneyCurrentStep');
    if (currentStep) currentStep.className = 'rpp-journey-step slide-out-right';

    setTimeout(() => {
        currentJourneyStep--;
        renderJourneyProgress();
        renderJourneyStep(currentJourneyStep, 'back');
        journeyIsAnimating = false;
    }, 400);
}
window.prevJourneyStep = prevJourneyStep;

function completeJourney() {
    if (journeyIsAnimating) return;
    journeyIsAnimating = true;

    const currentStep = document.getElementById('rppJourneyCurrentStep');
    if (currentStep) currentStep.className = 'rpp-journey-step slide-out-left';

    setTimeout(() => {
        const wrapper = document.getElementById('rppJourneyStepWrapper');
        const progress = document.getElementById('rppJourneyProgress');
        if (progress) progress.style.display = 'none';

        if (wrapper) {
            wrapper.innerHTML = `
                <div class="rpp-journey-complete">
                    <div class="rpp-journey-checkmark">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                    </div>
                    <h3>Your Plan Is Ready</h3>
                    <p>You've built something powerful. This safety plan is yours \u2014 a lifeline you created from a place of strength. Come back to it whenever you need it.</p>
                    <button class="rpp-journey-view-btn" onclick="finishJourney()">View My Plan</button>
                </div>
            `;
        }
        journeyIsAnimating = false;
    }, 400);
}
window.completeJourney = completeJourney;

async function finishJourney() {
    // Save all sections to Firestore
    if (typeof window.saveSafetyPlanFull === 'function') {
        await window.saveSafetyPlanFull(journeyDraft);
    }

    closeSafetyPlanJourney();

    // Let overlay close, then update view state
    setTimeout(() => {
        updateSafetyPlanViewState();
    }, 650);
}
window.finishJourney = finishJourney;

function updateSafetyPlanViewState() {
    const introCard = document.getElementById('rppIntroCard');
    const sectionsWrapper = document.getElementById('rppSectionsWrapper');
    const actionButtons = document.getElementById('rppActionButtons');
    const lastUpdated = document.getElementById('rppLastUpdated');

    // Check if plan has any data
    const data = window.rppData || {};
    const hasData = JOURNEY_STEPS.some(s => {
        const val = data[s.key];
        return Array.isArray(val) && val.length > 0;
    });

    if (hasData) {
        // Show completed plan view
        if (introCard) introCard.style.display = 'none';
        if (sectionsWrapper) sectionsWrapper.style.display = 'block';
        if (actionButtons) actionButtons.style.display = 'flex';
        if (lastUpdated) lastUpdated.style.display = '';
    } else {
        // Show intro card (first-time user)
        if (introCard) introCard.style.display = '';
        if (sectionsWrapper) sectionsWrapper.style.display = 'none';
        if (actionButtons) actionButtons.style.display = 'none';
        if (lastUpdated) lastUpdated.style.display = 'none';
    }
}
window.updateSafetyPlanViewState = updateSafetyPlanViewState;

// Escape key to close journey overlay
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const overlay = document.getElementById('rppJourneyOverlay');
        if (overlay && overlay.classList.contains('active')) {
            closeSafetyPlanJourney();
        }
    }
});

/* ============================================================
   ONBOARDING FLOW
   ============================================================ */

const ONBOARDING_STEPS = [
    { key: 'welcome', label: 'Welcome' },
    { key: 'name', label: 'Name' },
    { key: 'sobrietyDate', label: 'Date' },
    { key: 'fellowship', label: 'Fellowship' },
    { key: 'avatar', label: 'Avatar' },
    { key: 'community', label: 'Community' },
    { key: 'complete', label: 'Done' }
];

const FELLOWSHIP_OPTIONS = [
    { value: 'NA', label: 'NA' },
    { value: 'AA', label: 'AA' },
    { value: 'CA', label: 'CA' },
    { value: 'CMA', label: 'CMA' },
    { value: 'SMART', label: 'SMART' },
    { value: 'CR', label: 'Celebrate Recovery' },
    { value: 'RR', label: 'Refuge Recovery' },
    { value: 'None', label: 'None' },
    { value: 'Other', label: 'Other' }
];

let onboardingStep = 0;
let onboardingData = {
    preferredName: '',
    cleanDate: '',
    fellowship: '',
    avatarType: 'initial',
    avatarColor: 'linear-gradient(135deg, #2D5A3D, #1E4D2E)',
    avatarIcon: '',
    publicMilestones: true,
    openToPartner: true,
    sharedGratitude: true,
    skipDate: false
};
let onboardingAvatarTab = 'initial';
// Expose to window for inline onclick handlers
window.onboardingData = onboardingData;
window.setOnboardingAvatarTab = function(val) { onboardingAvatarTab = val; };

function startOnboarding() {
    const overlay = document.getElementById('onboardingOverlay');
    if (!overlay) return;
    onboardingStep = 0;

    // Pre-fill name from auth
    const user = typeof getCurrentUser === 'function' ? getCurrentUser() : (window.getCurrentUser ? window.getCurrentUser() : null);
    if (user && user.displayName) {
        onboardingData.preferredName = user.displayName;
    }

    // Reset to defaults
    onboardingData.cleanDate = '';
    onboardingData.fellowship = '';
    onboardingData.avatarType = 'initial';
    onboardingData.avatarColor = 'linear-gradient(135deg, #2D5A3D, #1E4D2E)';
    onboardingData.avatarIcon = '';
    onboardingData.publicMilestones = true;
    onboardingData.openToPartner = true;
    onboardingData.sharedGratitude = true;
    onboardingData.skipDate = false;
    onboardingAvatarTab = 'initial';

    renderOnboardingStep();
    overlay.style.display = 'flex';
    requestAnimationFrame(() => overlay.classList.add('active'));

    // Hide the nudge
    const nudge = document.getElementById('onboardingNudge');
    if (nudge) nudge.style.display = 'none';
}
window.startOnboarding = startOnboarding;

function closeOnboarding() {
    const overlay = document.getElementById('onboardingOverlay');
    if (!overlay) return;
    overlay.classList.remove('active');
    setTimeout(() => {
        overlay.style.display = 'none';
        overlay.innerHTML = '';
    }, 600);
}
window.closeOnboarding = closeOnboarding;

function dismissOnboardingNudge() {
    const nudge = document.getElementById('onboardingNudge');
    if (nudge) nudge.style.display = 'none';
    sessionStorage.setItem('onboardingNudgeDismissed', 'true');
}
window.dismissOnboardingNudge = dismissOnboardingNudge;

function showOnboardingNudge() {
    if (sessionStorage.getItem('onboardingNudgeDismissed') === 'true') return;
    const nudge = document.getElementById('onboardingNudge');
    if (nudge) nudge.style.display = 'flex';
}
window.showOnboardingNudge = showOnboardingNudge;

function navigateOnboarding(direction) {
    const wrapper = document.querySelector('.onboarding-step-wrapper');
    if (!wrapper) return;

    const currentStep = wrapper.querySelector('.onboarding-step');
    if (currentStep) {
        currentStep.classList.remove('slide-in-left', 'slide-in-right');
        currentStep.classList.add(direction === 'next' ? 'slide-out-left' : 'slide-out-right');
    }

    setTimeout(() => {
        onboardingStep += direction === 'next' ? 1 : -1;
        onboardingStep = Math.max(0, Math.min(onboardingStep, ONBOARDING_STEPS.length - 1));
        renderOnboardingStep(direction === 'next' ? 'slide-in-right' : 'slide-in-left');
    }, 400);
}
window.navigateOnboarding = navigateOnboarding;

function renderOnboardingStep(animClass) {
    const overlay = document.getElementById('onboardingOverlay');
    if (!overlay) return;

    const step = ONBOARDING_STEPS[onboardingStep];
    const isFirst = onboardingStep === 0;
    const isLast = onboardingStep === ONBOARDING_STEPS.length - 1;

    // Progress dots (not shown on welcome or complete)
    let dotsHtml = '';
    if (!isFirst && !isLast) {
        dotsHtml = '<div class="onboarding-progress">';
        for (let i = 1; i < ONBOARDING_STEPS.length - 1; i++) {
            const active = i === onboardingStep ? ' active' : '';
            const completed = i < onboardingStep ? ' completed' : '';
            dotsHtml += `<div class="onboarding-dot${active}${completed}"></div>`;
        }
        dotsHtml += '</div>';
    }

    // Close button (not on complete step)
    const closeBtn = !isLast ? `<button class="onboarding-close" onclick="closeOnboarding()">Skip</button>` : '';

    // Step content
    let stepContent = '';
    const anim = animClass || '';

    switch (step.key) {
        case 'welcome':
            stepContent = renderWelcomeStep();
            break;
        case 'name':
            stepContent = renderNameStep();
            break;
        case 'sobrietyDate':
            stepContent = renderDateStep();
            break;
        case 'fellowship':
            stepContent = renderFellowshipStep();
            break;
        case 'avatar':
            stepContent = renderAvatarStep();
            break;
        case 'community':
            stepContent = renderCommunityStep();
            break;
        case 'complete':
            stepContent = renderCompleteStep();
            break;
    }

    overlay.innerHTML = `
        ${closeBtn}
        ${dotsHtml}
        <div class="onboarding-step-wrapper">
            <div class="onboarding-step ${anim}">
                ${stepContent}
            </div>
        </div>
    `;

    // Fire confetti on complete step
    if (step.key === 'complete') {
        launchOnboardingConfetti();
    }
}
window.renderOnboardingStep = renderOnboardingStep;

function renderWelcomeStep() {
    return `
        <div class="onboarding-welcome-logo">We Do Recover</div>
        <div class="onboarding-welcome-sub">One Day at a Time</div>
        <div class="onboarding-question">Welcome to your recovery journey</div>
        <div class="onboarding-subtitle">Your personal space for healing, growth, and community</div>
        <div class="onboarding-features">
            <div class="onboarding-feature-card">
                <div class="feature-icon">&#127942;</div>
                <div class="feature-label">Track Recovery</div>
            </div>
            <div class="onboarding-feature-card">
                <div class="feature-icon">&#128591;</div>
                <div class="feature-label">Daily Gratitude</div>
            </div>
            <div class="onboarding-feature-card">
                <div class="feature-icon">&#129309;</div>
                <div class="feature-label">Community</div>
            </div>
        </div>
        <div class="onboarding-nav">
            <button class="onboarding-nav-btn primary" onclick="navigateOnboarding('next')">Let's Get Started</button>
        </div>
        <button class="onboarding-skip-link" onclick="closeOnboarding()">I'll do this later</button>
    `;
}

function renderNameStep() {
    const val = onboardingData.preferredName || '';
    return `
        <div class="onboarding-icon" style="background: linear-gradient(135deg, var(--forest), #4A8B5E); color: white;">&#128075;</div>
        <div class="onboarding-question">What should we call you?</div>
        <div class="onboarding-subtitle">This is how you'll appear in the community</div>
        <input class="onboarding-input" id="onboardingName" type="text" placeholder="Your name" maxlength="50" value="${val}" oninput="onboardingData.preferredName = this.value">
        <div class="onboarding-nav">
            <button class="onboarding-nav-btn secondary" onclick="navigateOnboarding('back')">Back</button>
            <button class="onboarding-nav-btn primary" onclick="navigateOnboarding('next')">Next</button>
        </div>
    `;
}

function renderDateStep() {
    const d = new Date();
    const today = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    const val = onboardingData.cleanDate || '';
    const checked = onboardingData.skipDate ? 'checked' : '';
    return `
        <div class="onboarding-icon" style="background: linear-gradient(135deg, #D4880A, #C9952B); color: white;">&#128197;</div>
        <div class="onboarding-question">When did your recovery journey begin?</div>
        <div class="onboarding-subtitle">We'll celebrate every milestone with you</div>
        <input class="onboarding-input" id="onboardingDate" type="date" max="${today}" value="${val}"
            oninput="onboardingData.cleanDate = this.value; onboardingData.skipDate = false; if(document.getElementById('onboardingSkipDate')) document.getElementById('onboardingSkipDate').checked = false;"
            ${onboardingData.skipDate ? 'disabled' : ''}>
        <label class="onboarding-date-skip">
            <input type="checkbox" id="onboardingSkipDate" ${checked}
                onchange="onboardingData.skipDate = this.checked; if(this.checked) { onboardingData.cleanDate = ''; var d = document.getElementById('onboardingDate'); if(d) { d.value = ''; d.disabled = true; } } else { var d = document.getElementById('onboardingDate'); if(d) d.disabled = false; }">
            I'm not sure yet
        </label>
        <div class="onboarding-nav">
            <button class="onboarding-nav-btn secondary" onclick="navigateOnboarding('back')">Back</button>
            <button class="onboarding-nav-btn primary" onclick="navigateOnboarding('next')">Next</button>
        </div>
    `;
}

function renderFellowshipStep() {
    let btns = FELLOWSHIP_OPTIONS.map(f => {
        const sel = onboardingData.fellowship === f.value ? ' selected' : '';
        return `<button class="onboarding-fellowship-btn${sel}" onclick="onboardingData.fellowship = '${f.value}'; document.querySelectorAll('.onboarding-fellowship-btn').forEach(b => b.classList.remove('selected')); this.classList.add('selected');">${f.label}</button>`;
    }).join('');
    return `
        <div class="onboarding-icon" style="background: linear-gradient(135deg, #3D6B99, #2A4D6E); color: white;">&#127988;</div>
        <div class="onboarding-question">Which fellowship do you identify with?</div>
        <div class="onboarding-subtitle">Shown as a badge on your community posts</div>
        <div class="onboarding-fellowship-grid">${btns}</div>
        <div class="onboarding-nav">
            <button class="onboarding-nav-btn secondary" onclick="navigateOnboarding('back')">Back</button>
            <button class="onboarding-nav-btn primary" onclick="navigateOnboarding('next')">Next</button>
        </div>
    `;
}

function renderAvatarStep() {
    // Preview
    let previewContent = '';
    if (onboardingData.avatarType === 'icon' && onboardingData.avatarIcon && AVATAR_ICONS[onboardingData.avatarIcon]) {
        previewContent = `<span style="display:flex;align-items:center;justify-content:center;width:40px;height:40px;">${AVATAR_ICONS[onboardingData.avatarIcon]}</span>`;
    } else {
        const initial = (onboardingData.preferredName || 'U').charAt(0).toUpperCase();
        previewContent = initial;
    }

    // Tabs
    const tabs = ['initial', 'icon'].map(t => {
        const active = onboardingAvatarTab === t ? ' active' : '';
        const label = t === 'initial' ? 'Color' : 'Icon';
        return `<button class="onboarding-avatar-tab${active}" onclick="setOnboardingAvatarTab('${t}'); renderOnboardingStep();">${label}</button>`;
    }).join('');

    // Content
    let tabContent = '';
    if (onboardingAvatarTab === 'initial') {
        const colors = AVATAR_COLORS.map(c => {
            const sel = onboardingData.avatarColor === c.value ? ' selected' : '';
            return `<button class="onboarding-color-btn${sel}" style="background: ${c.value};" title="${c.name}" onclick="onboardingData.avatarColor = '${c.value}'; onboardingData.avatarType = 'initial'; onboardingData.avatarIcon = ''; renderOnboardingStep();"></button>`;
        }).join('');
        tabContent = `<div class="onboarding-color-grid">${colors}</div>`;
    } else {
        const icons = Object.entries(AVATAR_ICONS).map(([key, svg]) => {
            const sel = onboardingData.avatarIcon === key ? ' selected' : '';
            return `<button class="onboarding-icon-btn${sel}" title="${key}" onclick="onboardingData.avatarIcon = '${key}'; onboardingData.avatarType = 'icon'; renderOnboardingStep();">${svg}</button>`;
        }).join('');
        tabContent = `<div class="onboarding-icon-grid">${icons}</div>`;
    }

    return `
        <div class="onboarding-question">Choose your look</div>
        <div class="onboarding-subtitle">Your avatar will appear next to your posts</div>
        <div class="onboarding-avatar-preview" style="background: ${onboardingData.avatarColor};">
            ${previewContent}
        </div>
        <div class="onboarding-avatar-tabs">${tabs}</div>
        <div class="onboarding-avatar-content">${tabContent}</div>
        <div class="onboarding-nav">
            <button class="onboarding-nav-btn secondary" onclick="navigateOnboarding('back')">Back</button>
            <button class="onboarding-nav-btn primary" onclick="navigateOnboarding('next')">Next</button>
        </div>
    `;
}

function renderCommunityStep() {
    function toggle(key, label, desc) {
        const checked = onboardingData[key] ? 'checked' : '';
        return `
            <div class="onboarding-toggle-item">
                <div>
                    <div class="onboarding-toggle-label">${label}</div>
                    <div class="onboarding-toggle-desc">${desc}</div>
                </div>
                <label class="onboarding-toggle-switch">
                    <input type="checkbox" ${checked} onchange="onboardingData['${key}'] = this.checked;">
                    <span class="onboarding-toggle-slider"></span>
                </label>
            </div>
        `;
    }
    return `
        <div class="onboarding-icon" style="background: linear-gradient(135deg, #4A7C59, #356B45); color: white;">&#129309;</div>
        <div class="onboarding-question">Join the community</div>
        <div class="onboarding-subtitle">You can change these anytime in your profile</div>
        <div class="onboarding-toggle-list">
            ${toggle('publicMilestones', 'Celebrate milestones publicly', 'Share your recovery achievements with the community')}
            ${toggle('openToPartner', 'Be discoverable as a partner', 'Let others find you for accountability partnerships')}
            ${toggle('sharedGratitude', 'Share gratitude with community', 'Your gratitude entries can appear on the community feed')}
        </div>
        <div class="onboarding-nav">
            <button class="onboarding-nav-btn secondary" onclick="navigateOnboarding('back')">Back</button>
            <button class="onboarding-nav-btn primary" onclick="completeOnboarding()">Finish Setup</button>
        </div>
    `;
}

function renderCompleteStep() {
    const name = onboardingData.preferredName || 'friend';
    let summaryCards = '';

    summaryCards += `<div class="onboarding-summary-card"><div class="onboarding-summary-label">Name</div><div class="onboarding-summary-value">${name}</div></div>`;

    if (onboardingData.cleanDate && !onboardingData.skipDate) {
        summaryCards += `<div class="onboarding-summary-card"><div class="onboarding-summary-label">Recovery Date</div><div class="onboarding-summary-value">${new Date(onboardingData.cleanDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div></div>`;
    }

    if (onboardingData.fellowship) {
        summaryCards += `<div class="onboarding-summary-card"><div class="onboarding-summary-label">Fellowship</div><div class="onboarding-summary-value">${onboardingData.fellowship}</div></div>`;
    }

    summaryCards += `<div class="onboarding-summary-card"><div class="onboarding-summary-label">Community</div><div class="onboarding-summary-value">${[onboardingData.publicMilestones && 'Milestones', onboardingData.openToPartner && 'Partners', onboardingData.sharedGratitude && 'Gratitude'].filter(Boolean).join(', ') || 'Private'}</div></div>`;

    return `
        <div class="onboarding-complete-icon">
            <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div class="onboarding-question">You're all set, ${name}!</div>
        <div class="onboarding-subtitle">Your recovery journey starts now</div>
        <div class="onboarding-summary">${summaryCards}</div>
        <div class="onboarding-nav" style="margin-top: 2rem;">
            <button class="onboarding-nav-btn primary" onclick="closeOnboarding(); showPage('home');">Go to My Dashboard</button>
        </div>
    `;
}

async function completeOnboarding() {
    // Save data via firebase function
    if (typeof window.saveOnboardingData === 'function') {
        try {
            await window.saveOnboardingData(onboardingData);
        } catch (err) {
            console.error('Onboarding save error:', err);
        }
    }
    // Show completion step
    onboardingStep = ONBOARDING_STEPS.length - 1;
    renderOnboardingStep();
}
window.completeOnboarding = completeOnboarding;

function launchOnboardingConfetti() {
    const colors = ['#2D5A3D', '#BF6A3A', '#D4880A', '#C9527A', '#3D6B99', '#4A7C59', '#7B68AE'];
    for (let i = 0; i < 40; i++) {
        const piece = document.createElement('div');
        piece.className = 'onboarding-confetti-piece';
        piece.style.left = Math.random() * 100 + 'vw';
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDelay = Math.random() * 1.5 + 's';
        piece.style.animationDuration = (2 + Math.random() * 2) + 's';
        piece.style.width = (6 + Math.random() * 8) + 'px';
        piece.style.height = (6 + Math.random() * 8) + 'px';
        piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        document.body.appendChild(piece);
        setTimeout(() => piece.remove(), 4000);
    }
}

// Escape key closes onboarding
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const overlay = document.getElementById('onboardingOverlay');
        if (overlay && overlay.classList.contains('active')) {
            closeOnboarding();
        }
    }
});

/* ============================================================
   MY PROFILE PAGE
   ============================================================ */

const AVATAR_COLORS = [
    { name: 'Forest',     value: 'linear-gradient(135deg, #2D5A3D, #1E4D2E)' },
    { name: 'Terracotta', value: 'linear-gradient(135deg, #BF6A3A, #A0522D)' },
    { name: 'Ocean',      value: 'linear-gradient(135deg, #3D6B99, #2A4D6E)' },
    { name: 'Sunrise',    value: 'linear-gradient(135deg, #D4880A, #C9952B)' },
    { name: 'Lavender',   value: 'linear-gradient(135deg, #7B68AE, #5B4D8E)' },
    { name: 'Rose',       value: 'linear-gradient(135deg, #C9527A, #9B3A5C)' },
    { name: 'Sage',       value: 'linear-gradient(135deg, #4A7C59, #356B45)' },
    { name: 'Midnight',   value: 'linear-gradient(135deg, #3D3229, #2A1F17)' },
    { name: 'Amber',      value: 'linear-gradient(135deg, #D2691E, #8B3A1F)' },
    { name: 'Teal',       value: 'linear-gradient(135deg, #2A7B7B, #1D5555)' },
];

const AVATAR_ICONS = {
    lotus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C6.5 9.5 3 14 3 17a9 9 0 0 0 18 0c0-3-3.5-7.5-9-15z"/></svg>',
    sunrise: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 18a5 5 0 0 0-10 0"/><line x1="12" y1="2" x2="12" y2="9"/><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/><line x1="1" y1="18" x2="3" y2="18"/><line x1="21" y1="18" x2="23" y2="18"/><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/><line x1="23" y1="22" x2="1" y2="22"/><polyline points="8 6 12 2 16 6"/></svg>',
    mountain: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21l4-10 4 10"/><path d="M2 21h20"/><path d="M14.5 15l3.5-7 4 7"/></svg>',
    tree: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22v-7"/><path d="M7 15l5-12 5 12H7z"/></svg>',
    wave: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0"/><path d="M2 17c2-3 4-3 6 0s4 3 6 0 4-3 6 0"/></svg>',
    butterfly: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18"/><path d="M5.5 8C3 5 1 7 2 10s4 5 7 4c1-.3 2-1 3-2"/><path d="M18.5 8C21 5 23 7 22 10s-4 5-7 4c-1-.3-2-1-3-2"/><path d="M5.5 16C3 19 1 17 2 14"/><path d="M18.5 16c2.5 3 4.5 1 3.5-2"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    feather: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" y1="8" x2="2" y2="22"/><line x1="17.5" y1="15" x2="9" y2="15"/></svg>',
    compass: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>',
    dove: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8c0-3-2-6-6-6S6 5 6 8c0 2 1 4 3 5l-4 8h14l-4-8c2-1 3-3 3-5z"/><circle cx="12" cy="7" r="1"/></svg>',
    phoenix: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c-4-4-8-8-8-14 0-3 2-6 5-6 2 0 3 1.5 3 1.5S13 1 15 1c3 0 5 3 5 6 0 6-4 10-8 15z"/></svg>',
    rainbow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 17a10 10 0 0 0-20 0"/><path d="M19 17a7 7 0 0 0-14 0"/><path d="M16 17a4 4 0 0 0-8 0"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
    flame: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c-4 0-8-3-8-8 0-6 8-14 8-14s8 8 8 14c0 5-4 8-8 8z"/><path d="M12 22c-2 0-4-1.5-4-4 0-3 4-7 4-7s4 4 4 7c0 2.5-2 4-4 4z"/></svg>',
    leaf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 4 13C4 6 11 2 17 2c0 6-3.5 10-6 13"/><path d="M4 20l7-7"/></svg>',
};
window.AVATAR_ICONS = AVATAR_ICONS;

function initProfilePage() {
    const colorGrid = document.getElementById('profileColorGrid');
    if (colorGrid && colorGrid.children.length === 0) {
        colorGrid.innerHTML = AVATAR_COLORS.map(c =>
            `<button class="profile-color-swatch${window._profileAvatarColor === c.value ? ' selected' : ''}"
                     style="background: ${c.value}" title="${c.name}"
                     data-color="${c.value}" onclick="selectAvatarColor(this)"></button>`
        ).join('');
    }

    const iconGrid = document.getElementById('profileIconGrid');
    if (iconGrid && iconGrid.children.length === 0) {
        iconGrid.innerHTML = Object.entries(AVATAR_ICONS).map(([key, svg]) =>
            `<button class="profile-icon-btn${window._profileAvatarIcon === key ? ' selected' : ''}"
                     data-icon="${key}" onclick="selectAvatarIcon(this)">${svg}</button>`
        ).join('');
    }

    // Set active avatar tab
    const activeTab = window._profileAvatarType || 'initial';
    document.querySelectorAll('.profile-avatar-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.tab === activeTab);
    });
    document.querySelectorAll('.profile-avatar-panel').forEach(p => p.classList.add('hidden'));
    const activePanel = document.getElementById('avatarPanel' + activeTab.charAt(0).toUpperCase() + activeTab.slice(1));
    if (activePanel) activePanel.classList.remove('hidden');

    // Pronoun custom field toggle
    const pronounsSelect = document.getElementById('profilePronouns');
    if (pronounsSelect && !pronounsSelect._profileBound) {
        pronounsSelect._profileBound = true;
        pronounsSelect.addEventListener('change', () => {
            const custom = document.getElementById('profilePronounsCustom');
            if (pronounsSelect.value === 'custom') {
                custom.classList.remove('hidden');
                custom.focus();
            } else {
                custom.classList.add('hidden');
            }
        });
    }

    // Mantra char counter
    const mantraInput = document.getElementById('profileMantra');
    if (mantraInput && !mantraInput._profileBound) {
        mantraInput._profileBound = true;
        mantraInput.addEventListener('input', () => {
            const count = document.getElementById('profileMantraCount');
            if (count) count.textContent = mantraInput.value.length;
        });
    }

    renderProfileAvatar();
}

function switchAvatarTab(tab) {
    document.querySelectorAll('.profile-avatar-tab').forEach(t => t.classList.remove('active'));
    const activeTab = document.querySelector(`.profile-avatar-tab[data-tab="${tab}"]`);
    if (activeTab) activeTab.classList.add('active');

    document.querySelectorAll('.profile-avatar-panel').forEach(p => p.classList.add('hidden'));
    const panel = document.getElementById('avatarPanel' + tab.charAt(0).toUpperCase() + tab.slice(1));
    if (panel) panel.classList.remove('hidden');

    window._profileAvatarType = tab;
    renderProfileAvatar();
}
window.switchAvatarTab = switchAvatarTab;

function selectAvatarColor(btn) {
    document.querySelectorAll('.profile-color-swatch').forEach(s => s.classList.remove('selected'));
    btn.classList.add('selected');
    window._profileAvatarColor = btn.dataset.color;
    renderProfileAvatar();
}
window.selectAvatarColor = selectAvatarColor;

function selectAvatarIcon(btn) {
    document.querySelectorAll('.profile-icon-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    window._profileAvatarIcon = btn.dataset.icon;
    window._profileAvatarType = 'icon';
    renderProfileAvatar();
}
window.selectAvatarIcon = selectAvatarIcon;

function renderProfileAvatar() {
    const preview = document.getElementById('profileAvatarPreview');
    if (!preview) return;

    const type = window._profileAvatarType || 'initial';
    preview.innerHTML = '';
    preview.style.backgroundImage = '';

    if (type === 'photo' && window._profileAvatarUrl) {
        preview.innerHTML = `<img src="${window._profileAvatarUrl}" alt="Profile photo">`;
        preview.style.background = 'transparent';
    } else if (type === 'icon' && window._profileAvatarIcon) {
        const svg = AVATAR_ICONS[window._profileAvatarIcon] || '';
        preview.innerHTML = svg;
        preview.style.background = window._profileAvatarColor || 'linear-gradient(135deg, var(--terracotta), var(--rust))';
        const svgEl = preview.querySelector('svg');
        if (svgEl) {
            svgEl.style.width = '40px';
            svgEl.style.height = '40px';
            svgEl.setAttribute('stroke', 'white');
        }
    } else {
        const user = window.getCurrentUser ? window.getCurrentUser() : null;
        const initial = (user?.displayName || user?.email || 'U').charAt(0).toUpperCase();
        preview.textContent = initial;
        preview.style.background = window._profileAvatarColor || 'linear-gradient(135deg, var(--terracotta), var(--rust))';
    }
}
window.renderProfileAvatar = renderProfileAvatar;

// Photo crop
let cropImage = null;
let cropZoom = 1;

function handleProfilePhotoSelect(input) {
    const file = input.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
        showToast('Photo must be under 2MB');
        return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
        cropImage = new Image();
        cropImage.onload = function() {
            document.getElementById('profileCropArea').classList.remove('hidden');
            document.getElementById('profileCropZoom').value = 1;
            cropZoom = 1;
            drawCropPreview();
        };
        cropImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
}
window.handleProfilePhotoSelect = handleProfilePhotoSelect;

function updateCropZoom(value) {
    cropZoom = parseFloat(value);
    drawCropPreview();
}
window.updateCropZoom = updateCropZoom;

function drawCropPreview() {
    const canvas = document.getElementById('profileCropCanvas');
    if (!canvas || !cropImage) return;
    const ctx = canvas.getContext('2d');
    const size = 200;
    ctx.clearRect(0, 0, size, size);
    const imgMin = Math.min(cropImage.width, cropImage.height);
    const sourceSize = imgMin / cropZoom;
    const sx = (cropImage.width - sourceSize) / 2;
    const sy = (cropImage.height - sourceSize) / 2;
    ctx.drawImage(cropImage, sx, sy, sourceSize, sourceSize, 0, 0, size, size);
}

async function confirmProfilePhoto() {
    const canvas = document.getElementById('profileCropCanvas');
    if (!canvas) return;
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.85));
    showToast('Uploading photo...');
    const url = await window.uploadProfilePhoto(blob);
    if (url) {
        window._profileAvatarUrl = url;
        window._profileAvatarType = 'photo';
        renderProfileAvatar();
        document.getElementById('profileCropArea').classList.add('hidden');
        showToast('Photo uploaded!');
    }
}
window.confirmProfilePhoto = confirmProfilePhoto;

function cancelProfilePhoto() {
    document.getElementById('profileCropArea').classList.add('hidden');
    document.getElementById('profilePhotoInput').value = '';
    cropImage = null;
}
window.cancelProfilePhoto = cancelProfilePhoto;

// Accessibility toggles
function setFontSize(size) {
    document.body.classList.remove('font-large', 'font-x-large');
    if (size === 'large') document.body.classList.add('font-large');
    if (size === 'x-large') document.body.classList.add('font-x-large');
    document.querySelectorAll('.profile-size-btn').forEach(b => b.classList.toggle('active', b.dataset.size === size));
    localStorage.setItem('a11y-fontSize', size);
}
window.setFontSize = setFontSize;

function toggleReducedMotion(enabled) {
    document.body.classList.toggle('reduced-motion', enabled);
    localStorage.setItem('a11y-reducedMotion', enabled);
}
window.toggleReducedMotion = toggleReducedMotion;

function toggleHighContrast(enabled) {
    document.body.classList.toggle('high-contrast', enabled);
    localStorage.setItem('a11y-highContrast', enabled);
}
window.toggleHighContrast = toggleHighContrast;

function toggleDyslexiaFont(enabled) {
    document.body.classList.toggle('dyslexia-font', enabled);
    localStorage.setItem('a11y-dyslexiaFont', enabled);
}
window.toggleDyslexiaFont = toggleDyslexiaFont;

function toggleDarkMode(enabled) {
    document.body.classList.toggle('dark-mode', enabled);
    localStorage.setItem('a11y-darkMode', enabled);
    // Update meta theme-color for mobile browser chrome
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', enabled ? '#1C1714' : '#FAF6F0');
}
window.toggleDarkMode = toggleDarkMode;

// Nav bar theme toggle — flips current mode
function toggleThemeFromNav() {
    const isDark = document.body.classList.contains('dark-mode');
    toggleDarkMode(!isDark);
    syncA11yUI();
}
window.toggleThemeFromNav = toggleThemeFromNav;

// Apply a11y prefs from localStorage instantly on page load
function applyA11yFromLocalStorage() {
    const fontSize = localStorage.getItem('a11y-fontSize');
    if (fontSize === 'large') document.body.classList.add('font-large');
    if (fontSize === 'x-large') document.body.classList.add('font-x-large');
    if (localStorage.getItem('a11y-reducedMotion') === 'true') document.body.classList.add('reduced-motion');
    if (localStorage.getItem('a11y-highContrast') === 'true') document.body.classList.add('high-contrast');
    if (localStorage.getItem('a11y-dyslexiaFont') === 'true') document.body.classList.add('dyslexia-font');
    // Dark mode: respect localStorage first, then system preference as fallback
    const savedDarkMode = localStorage.getItem('a11y-darkMode');
    if (savedDarkMode !== null) {
        if (savedDarkMode === 'true') document.body.classList.add('dark-mode');
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.classList.add('dark-mode');
    }
    // Update meta theme-color based on active mode
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta && document.body.classList.contains('dark-mode')) meta.setAttribute('content', '#1C1714');
}
applyA11yFromLocalStorage();

// Listen for system dark mode changes (only if user hasn't manually set preference)
if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (localStorage.getItem('a11y-darkMode') === null) {
            document.body.classList.toggle('dark-mode', e.matches);
            const meta = document.querySelector('meta[name="theme-color"]');
            if (meta) meta.setAttribute('content', e.matches ? '#1C1714' : '#FAF6F0');
            syncA11yUI();
        }
    });
}

function syncA11yUI() {
    const fontSize = localStorage.getItem('a11y-fontSize') || 'normal';
    document.querySelectorAll('.profile-size-btn').forEach(b => b.classList.toggle('active', b.dataset.size === fontSize));
    const rm = document.getElementById('profileReducedMotion');
    if (rm) rm.checked = localStorage.getItem('a11y-reducedMotion') === 'true';
    const hc = document.getElementById('profileHighContrast');
    if (hc) hc.checked = localStorage.getItem('a11y-highContrast') === 'true';
    const df = document.getElementById('profileDyslexiaFont');
    if (df) df.checked = localStorage.getItem('a11y-dyslexiaFont') === 'true';
    const dm = document.getElementById('profileDarkMode');
    if (dm) dm.checked = document.body.classList.contains('dark-mode');
}

// ─── What's New Panel ───────────────────────────────────────────────
const WHATS_NEW_VERSION = '2026.02.2';

function showWhatsNew() {
    const overlay = document.getElementById('whatsNewOverlay');
    const panel = document.getElementById('whatsNewPanel');
    if (!overlay || !panel) return;
    overlay.classList.add('open');
    panel.classList.add('open');
    document.body.style.overflow = 'hidden';
}
window.showWhatsNew = showWhatsNew;

function dismissWhatsNew() {
    const overlay = document.getElementById('whatsNewOverlay');
    const panel = document.getElementById('whatsNewPanel');
    if (!overlay || !panel) return;
    overlay.classList.remove('open');
    panel.classList.remove('open');
    document.body.style.overflow = '';
    localStorage.setItem('whatsNewSeen', WHATS_NEW_VERSION);
}
window.dismissWhatsNew = dismissWhatsNew;

function checkWhatsNew() {
    const seen = localStorage.getItem('whatsNewSeen');
    if (seen !== WHATS_NEW_VERSION) {
        // Small delay so the page settles after sign-in
        setTimeout(() => showWhatsNew(), 800);
    }
}
window.checkWhatsNew = checkWhatsNew;

// ========== PUBLIC PROFILES ==========

function viewUserProfile(uid) {
    if (!uid) return;
    // If not signed in, redirect to auth
    if (typeof window.getCurrentUser === 'function' && !window.getCurrentUser()) {
        showPage('auth');
        showToast('Sign in to view profiles');
        return;
    }
    // Always show public profile — even for own UID
    window._pendingPublicProfileUid = uid;
    showPage('public-profile');
}
window.viewUserProfile = viewUserProfile;

// ========== NOTIFICATION PANEL ==========

function toggleNotificationPanel() {
    const overlay = document.getElementById('notificationOverlay');
    const panel = document.getElementById('notificationPanel');
    if (!overlay || !panel) return;
    const isOpen = panel.classList.contains('open');
    if (isOpen) {
        closeNotificationPanel();
    } else {
        overlay.classList.add('open');
        panel.classList.add('open');
        document.body.style.overflow = 'hidden';
        // Load notifications when opening
        if (typeof window.loadNotifications === 'function') {
            window.loadNotifications();
        }
    }
}
window.toggleNotificationPanel = toggleNotificationPanel;

function closeNotificationPanel() {
    const overlay = document.getElementById('notificationOverlay');
    const panel = document.getElementById('notificationPanel');
    if (!overlay || !panel) return;
    overlay.classList.remove('open');
    panel.classList.remove('open');
    document.body.style.overflow = '';
}
window.closeNotificationPanel = closeNotificationPanel;

/* ============================================================
   MILESTONE CELEBRATION OVERLAY — 3-STEP EXPERIENCE
   Step 1: Congratulations + Recovery Stats
   Step 2: Safety Plan Review Prompt
   Step 3: Share to Community with Commentary
   ============================================================ */

const CELEBRATION_STEPS = ['congrats', 'safetyPlan', 'share'];
let celebrationStep = 0;
let celebrationMilestone = null;
let celebrationDays = 0;
let celebrationStats = null;
let celebrationIsAnimating = false;

async function showMilestoneCelebration(milestone, days) {
    const overlay = document.getElementById('milestoneCelebrationOverlay');
    if (!overlay) return;

    celebrationMilestone = milestone;
    celebrationDays = days;
    celebrationStep = 0;
    celebrationIsAnimating = false;

    // Gather stats while building UI
    celebrationStats = await window.gatherRecoveryStats();

    // Build overlay shell
    overlay.innerHTML = `
        <button class="celebration-close" onclick="handleCelebrationRemindLater()" title="Remind me later">&times;</button>
        <div class="celebration-progress" id="celebrationProgress"></div>
        <div class="celebration-step-wrapper" id="celebrationStepWrapper"></div>
        <div class="celebration-actions" id="celebrationActions">
            <button class="celebration-remind-btn" onclick="handleCelebrationRemindLater()">Remind Me Later</button>
            <button class="celebration-decline-btn" onclick="handleCelebrationDecline()">Decline Milestone Review</button>
        </div>
    `;

    renderCelebrationProgress();
    renderCelebrationStep(0, 'none');

    // Trigger confetti
    if (typeof triggerConfetti === 'function') triggerConfetti();

    // Show overlay
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => {
        requestAnimationFrame(() => overlay.classList.add('active'));
    });
}
window.showMilestoneCelebration = showMilestoneCelebration;

function renderCelebrationProgress() {
    const container = document.getElementById('celebrationProgress');
    if (!container) return;
    container.innerHTML = CELEBRATION_STEPS.map((step, i) => {
        let cls = 'celebration-dot dot-' + step;
        if (i === celebrationStep) cls += ' active';
        if (i < celebrationStep) cls += ' completed';
        return '<div class="' + cls + '"></div>';
    }).join('');
}

function renderCelebrationStep(index, direction) {
    const wrapper = document.getElementById('celebrationStepWrapper');
    if (!wrapper) return;

    let html = '';
    if (CELEBRATION_STEPS[index] === 'congrats') html = renderCongratsStep();
    else if (CELEBRATION_STEPS[index] === 'safetyPlan') html = renderSafetyPlanStep();
    else if (CELEBRATION_STEPS[index] === 'share') html = renderShareStep();

    let animClass = 'celebration-step';
    if (direction === 'forward') animClass += ' slide-in-right';
    else if (direction === 'back') animClass += ' slide-in-left';

    wrapper.innerHTML = '<div class="' + animClass + '" id="celebrationCurrentStep">' + html + '</div>';

    // Wire up character counter on share step
    if (CELEBRATION_STEPS[index] === 'share') {
        setTimeout(() => {
            const textarea = document.getElementById('celebrationCommentary');
            const counter = document.getElementById('celebrationCharCount');
            if (textarea && counter) {
                textarea.addEventListener('input', () => {
                    counter.textContent = textarea.value.length + '/280';
                });
                textarea.focus();
            }
        }, 100);
    }
}

function renderCongratsStep() {
    const m = celebrationMilestone;
    const stats = celebrationStats || {};

    // Build stat items — only show non-zero
    const statItems = [];
    if (stats.urgesLogged > 0) statItems.push({ icon: '\uD83C\uDF0A', label: 'Urges Surfed', value: stats.urgesLogged });
    if (stats.moodCheckins > 0) statItems.push({ icon: '\uD83D\uDE0A', label: 'Mood Check-ins', value: stats.moodCheckins });
    if (stats.gratitudeEntries > 0) statItems.push({ icon: '\uD83D\uDE4F', label: 'Gratitude Entries', value: stats.gratitudeEntries });
    if (stats.journalEntries > 0) statItems.push({ icon: '\uD83D\uDCD3', label: 'Journal Entries', value: stats.journalEntries });
    if (stats.wellnessToolsUsed > 0) statItems.push({ icon: '\uD83E\uDDD8', label: 'Wellness Exercises', value: stats.wellnessToolsUsed });

    const statsHtml = statItems.length > 0
        ? '<div class="celebration-stats-grid">' +
          statItems.map(s =>
              '<div class="celebration-stat-card">' +
              '<span class="celebration-stat-icon">' + s.icon + '</span>' +
              '<span class="celebration-stat-value">' + s.value + '</span>' +
              '<span class="celebration-stat-label">' + s.label + '</span>' +
              '</div>'
          ).join('') + '</div>'
        : '<p class="celebration-stats-empty">Your recovery journey is just beginning. Every step counts.</p>';

    return '<div class="celebration-badge-container">' +
        '<span class="celebration-milestone-icon">' + m.icon + '</span>' +
    '</div>' +
    '<h2 class="celebration-title">' + m.label + '</h2>' +
    '<p class="celebration-subtitle">' + celebrationDays + ' days in recovery. You are doing incredible work.</p>' +
    '<div class="celebration-stats-section">' +
        '<h3 class="celebration-stats-heading">Your Recovery Journey</h3>' +
        statsHtml +
    '</div>' +
    '<div class="celebration-step-nav">' +
        '<button class="celebration-next-btn" onclick="nextCelebrationStep()">Continue</button>' +
    '</div>';
}

function renderSafetyPlanStep() {
    const stats = celebrationStats || {};
    const lastUpdated = stats.safetyPlanLastUpdated;

    let lastUpdatedText = 'You haven\'t created a safety plan yet.';
    let urgency = 'create';

    if (lastUpdated) {
        const daysSinceUpdate = Math.floor((new Date() - lastUpdated) / (1000 * 60 * 60 * 24));
        const dateStr = lastUpdated.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        lastUpdatedText = 'Last updated ' + dateStr;
        urgency = daysSinceUpdate > 90 ? 'review' : 'current';
    }

    const messages = {
        create: 'A safety plan is one of the most powerful tools in your recovery. Take a few minutes to create yours.',
        review: 'It has been a while since you updated your safety plan. Milestones are a great time to check in.',
        current: 'Your safety plan is up to date. Great job keeping it current!'
    };

    const shieldSvg = '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>';

    let actionBtn = '';
    if (urgency !== 'current') {
        const label = urgency === 'create' ? 'Create My Plan' : 'Review My Plan';
        actionBtn = '<button class="celebration-action-btn" onclick="celebrationGoToSafetyPlan()">' + label + '</button>';
    }

    return '<div class="celebration-icon-wrapper">' + shieldSvg + '</div>' +
        '<h2 class="celebration-title">Safety Plan Check</h2>' +
        '<p class="celebration-safety-date">' + lastUpdatedText + '</p>' +
        '<p class="celebration-subtitle">' + messages[urgency] + '</p>' +
        '<div class="celebration-step-nav">' +
            '<button class="celebration-back-btn" onclick="prevCelebrationStep()">Back</button>' +
            actionBtn +
            '<button class="celebration-next-btn" onclick="nextCelebrationStep()">' +
                (urgency !== 'current' ? 'Skip' : 'Continue') +
            '</button>' +
        '</div>';
}

function renderShareStep() {
    const m = celebrationMilestone;

    return '<div class="celebration-badge-container small">' +
        '<span class="celebration-milestone-icon">' + m.icon + '</span>' +
    '</div>' +
    '<h2 class="celebration-title">Share Your Milestone</h2>' +
    '<p class="celebration-subtitle">Celebrate with the community. Add a personal note if you\'d like.</p>' +
    '<div class="celebration-share-form">' +
        '<textarea class="celebration-commentary" id="celebrationCommentary" ' +
            'placeholder="e.g., Grateful for every day. This community helped me get here." ' +
            'maxlength="280" rows="3"></textarea>' +
        '<span class="celebration-char-count" id="celebrationCharCount">0/280</span>' +
    '</div>' +
    '<div class="celebration-step-nav">' +
        '<button class="celebration-back-btn" onclick="prevCelebrationStep()">Back</button>' +
        '<button class="celebration-share-btn" onclick="submitCelebrationShare()">Share ' + m.icon + ' ' + m.label + '</button>' +
    '</div>';
}

// --- Navigation ---

function nextCelebrationStep() {
    if (celebrationIsAnimating || celebrationStep >= CELEBRATION_STEPS.length - 1) return;
    celebrationIsAnimating = true;
    const current = document.getElementById('celebrationCurrentStep');
    if (current) current.className = 'celebration-step slide-out-left';
    setTimeout(() => {
        celebrationStep++;
        renderCelebrationProgress();
        renderCelebrationStep(celebrationStep, 'forward');
        celebrationIsAnimating = false;
    }, 400);
}
window.nextCelebrationStep = nextCelebrationStep;

function prevCelebrationStep() {
    if (celebrationIsAnimating || celebrationStep <= 0) return;
    celebrationIsAnimating = true;
    const current = document.getElementById('celebrationCurrentStep');
    if (current) current.className = 'celebration-step slide-out-right';
    setTimeout(() => {
        celebrationStep--;
        renderCelebrationProgress();
        renderCelebrationStep(celebrationStep, 'back');
        celebrationIsAnimating = false;
    }, 400);
}
window.prevCelebrationStep = prevCelebrationStep;

// --- Action Handlers ---

function handleCelebrationRemindLater() {
    closeCelebrationOverlay();
    showToast('We\'ll celebrate next time you sign in!');
}
window.handleCelebrationRemindLater = handleCelebrationRemindLater;

async function handleCelebrationDecline() {
    if (celebrationMilestone) {
        await window.markMilestoneCelebrated(celebrationMilestone.days);
    }
    closeCelebrationOverlay();
    showToast(celebrationMilestone.icon + ' ' + celebrationMilestone.label + ' recorded');
}
window.handleCelebrationDecline = handleCelebrationDecline;

async function submitCelebrationShare() {
    const commentary = (document.getElementById('celebrationCommentary')?.value || '').trim();
    if (celebrationMilestone) {
        await window.markMilestoneCelebrated(celebrationMilestone.days);
        await window.postMilestoneToCommunity(celebrationMilestone, commentary);
    }
    closeCelebrationOverlay();
    if (typeof triggerConfetti === 'function') triggerConfetti();
    showToast(celebrationMilestone.icon + ' ' + celebrationMilestone.label + ' shared with the community!');
}
window.submitCelebrationShare = submitCelebrationShare;

function celebrationGoToSafetyPlan() {
    if (celebrationMilestone) {
        window.markMilestoneCelebrated(celebrationMilestone.days);
    }
    closeCelebrationOverlay();
    showPage('safety-plan');
}
window.celebrationGoToSafetyPlan = celebrationGoToSafetyPlan;

function closeCelebrationOverlay() {
    const overlay = document.getElementById('milestoneCelebrationOverlay');
    if (!overlay) return;
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => {
        overlay.style.display = 'none';
        overlay.innerHTML = '';
    }, 600);
}
window.closeCelebrationOverlay = closeCelebrationOverlay;

// ========== FEELINGS WHEEL ==========
const FEELINGS_DATA = {
    happy: { color: '#F2C94C', emoji: '😊', specific: ['Joyful','Content','Grateful','Proud','Hopeful','Amused','Peaceful','Excited','Optimistic','Relieved'] },
    sad: { color: '#5B8DEF', emoji: '😢', specific: ['Lonely','Heartbroken','Disappointed','Hopeless','Grief','Empty','Regretful','Melancholy','Dejected','Helpless'] },
    angry: { color: '#EB5757', emoji: '😤', specific: ['Frustrated','Bitter','Jealous','Hostile','Resentful','Irritated','Violated','Furious','Provoked','Hateful'] },
    fearful: { color: '#9B51E0', emoji: '😰', specific: ['Anxious','Insecure','Overwhelmed','Scared','Vulnerable','Panicked','Worried','Dread','Helpless','Terrified'] },
    surprised: { color: '#F2994A', emoji: '😮', specific: ['Confused','Amazed','Shocked','Dismayed','Startled','Moved','Awestruck','Speechless','Disillusioned','Perplexed'] },
    disgusted: { color: '#6FCF97', emoji: '🤢', specific: ['Contempt','Revulsion','Judgmental','Loathing','Disapproving','Repelled','Nauseated','Detestable','Horrified','Hesitant'] }
};

let _fwCallback = null;
let _fwSelectedCore = null;
let _fwSelectedSpecific = null;

function openFeelingsWheel(context) {
    _fwCallback = context;
    _fwSelectedCore = null;
    _fwSelectedSpecific = null;
    const overlay = document.getElementById('feelingsWheelOverlay');
    const coreEl = document.getElementById('wheelCore');
    const specEl = document.getElementById('wheelSpecific');
    const badge = document.getElementById('fwBadge');
    const selected = document.getElementById('fwSelected');
    const confirmBtn = document.getElementById('fwConfirmBtn');

    confirmBtn.disabled = true;
    selected.style.display = 'none';
    specEl.innerHTML = '';
    coreEl.innerHTML = '';

    Object.entries(FEELINGS_DATA).forEach(([key, data]) => {
        const btn = document.createElement('button');
        btn.className = 'wheel-core-btn';
        btn.style.setProperty('--emotion-color', data.color);
        btn.innerHTML = `<span class="wheel-core-emoji">${data.emoji}</span><span class="wheel-core-label">${key.charAt(0).toUpperCase() + key.slice(1)}</span>`;
        btn.onclick = () => selectCoreEmotion(key);
        coreEl.appendChild(btn);
    });

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}
window.openFeelingsWheel = openFeelingsWheel;

function selectCoreEmotion(core) {
    _fwSelectedCore = core;
    _fwSelectedSpecific = null;
    const data = FEELINGS_DATA[core];
    const specEl = document.getElementById('wheelSpecific');
    const confirmBtn = document.getElementById('fwConfirmBtn');
    confirmBtn.disabled = true;

    document.querySelectorAll('.wheel-core-btn').forEach(b => b.classList.remove('selected'));
    document.querySelectorAll('.wheel-core-btn').forEach(b => {
        if (b.textContent.toLowerCase().includes(core)) b.classList.add('selected');
    });

    specEl.innerHTML = '';
    data.specific.forEach(name => {
        const btn = document.createElement('button');
        btn.className = 'wheel-specific-btn';
        btn.style.setProperty('--emotion-color', data.color);
        btn.textContent = name;
        btn.onclick = () => selectSpecificEmotion(core, name);
        specEl.appendChild(btn);
    });
}

function selectSpecificEmotion(core, specific) {
    _fwSelectedSpecific = specific;
    const data = FEELINGS_DATA[core];
    document.querySelectorAll('.wheel-specific-btn').forEach(b => b.classList.remove('selected'));
    document.querySelectorAll('.wheel-specific-btn').forEach(b => {
        if (b.textContent === specific) b.classList.add('selected');
    });
    const badge = document.getElementById('fwBadge');
    const selected = document.getElementById('fwSelected');
    badge.textContent = `${data.emoji} ${specific}`;
    badge.style.setProperty('--emotion-color', data.color);
    selected.style.display = 'flex';
    document.getElementById('fwConfirmBtn').disabled = false;
}

function confirmEmotion() {
    if (!_fwSelectedCore || !_fwSelectedSpecific) return;
    const data = FEELINGS_DATA[_fwSelectedCore];
    const result = { core: _fwSelectedCore, specific: _fwSelectedSpecific, color: data.color, emoji: data.emoji };

    if (_fwCallback === 'checkin') {
        window._checkinEmotion = result;
        const badge = document.getElementById('checkinEmotionBadge');
        const row = document.getElementById('checkinEmotionDetail');
        badge.textContent = `${result.emoji} ${result.specific}`;
        badge.style.setProperty('--emotion-color', result.color);
        row.style.display = 'flex';
    } else if (_fwCallback === 'journal') {
        window._journalEmotion = result;
        const badge = document.getElementById('journalEmotionBadge');
        const row = document.getElementById('journalEmotionDetail');
        badge.textContent = `${result.emoji} ${result.specific}`;
        badge.style.setProperty('--emotion-color', result.color);
        row.style.display = 'flex';
    } else if (_fwCallback === 'urge') {
        window._urgeEmotion = result;
        const badge = document.getElementById('urgeEmotionBadge');
        const row = document.getElementById('urgeEmotionDetail');
        if (badge && row) {
            badge.textContent = `${result.emoji} ${result.specific}`;
            badge.style.setProperty('--emotion-color', result.color);
            row.style.display = 'flex';
        }
    }
    closeFeelingsWheel();
}
window.confirmEmotion = confirmEmotion;

function closeFeelingsWheel() {
    document.getElementById('feelingsWheelOverlay').classList.remove('active');
    document.body.style.overflow = '';
}
window.closeFeelingsWheel = closeFeelingsWheel;

// ========== REFRAME STUDIO (AI-Powered v3) ==========
const RS_DISTORTIONS = [
    { name: 'Catastrophizing', icon: '🌪️', desc: 'Expecting the worst possible outcome', example: 'If one thing goes wrong, everything will fall apart.', prompts: ["What's the MOST likely outcome?", "What would I tell a friend?", "Has this actually happened before?"] },
    { name: 'All-or-Nothing', icon: '⚫', desc: 'Thinking in black and white terms', example: "If I'm not perfect, I'm a total failure.", prompts: ["Is there a middle ground?", "What's partially true?", "Can two things be true at once?"] },
    { name: 'Mind Reading', icon: '🔮', desc: 'Assuming you know what others think', example: 'They must think I\'m stupid.', prompts: ["Do I have evidence for this?", "What else could they be thinking?", "Have I asked them directly?"] },
    { name: 'Fortune Telling', icon: '🎱', desc: 'Predicting things will go badly', example: "There's no point trying — it won't work out.", prompts: ["What's one positive possibility?", "How accurate have my predictions been?", "What if things go okay?"] },
    { name: 'Overgeneralization', icon: '🔁', desc: 'Using "always" or "never" thinking', example: 'This always happens to me. Nothing ever changes.', prompts: ["Is this really ALWAYS true?", "When has the opposite happened?", "Am I using extreme words?"] },
    { name: 'Magnification', icon: '🔎', desc: 'Blowing things out of proportion', example: "I made a small mistake — it's a disaster.", prompts: ["How big will this feel in a week?", "Am I zooming in on the negative?", "What's the full picture?"] },
    { name: 'Emotional Reasoning', icon: '💭', desc: 'Feeling it, so it must be true', example: 'I feel like a burden, so I must be one.', prompts: ["Feelings aren't facts — what ARE the facts?", "Would I think this on a good day?", "What does the evidence say?"] },
    { name: 'Should Statements', icon: '📋', desc: 'Rigid rules about how things should be', example: 'I should have it together by now.', prompts: ["Who made this rule?", "What if I replaced 'should' with 'could'?", "Am I being realistic?"] },
    { name: 'Personalization', icon: '🎯', desc: 'Blaming yourself for things outside your control', example: "They're upset — it must be something I did.", prompts: ["What other factors were involved?", "Is this really about me?", "Would I blame a friend for this?"] },
    { name: 'Disqualifying the Positive', icon: '🚫', desc: 'Dismissing good things that happen', example: "That compliment doesn't count — they were just being nice.", prompts: ["What good things AM I ignoring?", "Would others see this differently?", "What went right today?"] },
    { name: 'Jumping to Conclusions', icon: '⚡', desc: 'Making assumptions without evidence', example: "They didn't text back — they must be mad.", prompts: ["What evidence do I actually have?", "Am I filling in gaps with fear?", "What's the simplest explanation?"] },
    { name: 'Magical Thinking', icon: '✨', desc: 'Believing thoughts can cause events', example: 'If I worry about it enough, I can prevent it.', prompts: ["Can thoughts really cause this?", "What do I actually control?", "What's a realistic connection?"] }
];

const RS_ENCOURAGEMENTS = [
    "Your mind is getting stronger with every reframe.",
    "That's real growth — you challenged your own thinking.",
    "Recovery is rewiring your brain, one thought at a time.",
    "You just proved your thoughts don't control you.",
    "Each reframe builds a healthier thought pattern.",
    "You're learning to be your own best counselor.",
    "This is what progress looks like — well done.",
    "The more you practice, the more natural this becomes."
];

const GAME_LEVELS = [
    { level: 1, name: 'Seedling', icon: '🌱', xpRequired: 0 },
    { level: 2, name: 'Sprout', icon: '🌿', xpRequired: 100 },
    { level: 3, name: 'Growing Strong', icon: '🌳', xpRequired: 300 },
    { level: 4, name: 'Flourishing', icon: '🔥', xpRequired: 600 },
    { level: 5, name: 'Thriving', icon: '👑', xpRequired: 1000 },
    { level: 6, name: 'Radiant', icon: '💎', xpRequired: 1500 },
    { level: 7, name: 'Recovery Master', icon: '🌟', xpRequired: 2500 }
];

const GAME_BADGES = [
    // Reframe Studio badges
    { id: 'first-reframe', name: 'First Light', icon: '💡', desc: 'Completed your first reframe', check: s => s.totalReframes >= 1 },
    { id: 'five-streak', name: 'Consistent Mind', icon: '🔥', desc: '5-day reframe streak', check: s => s.currentStreak >= 5 },
    { id: 'ten-reframes', name: 'Pattern Expert', icon: '🧩', desc: '10 reframes completed', check: s => s.totalReframes >= 10 },
    { id: 'all-distortions', name: 'Full Spectrum', icon: '🌈', desc: 'Identified all 12 distortion types', check: s => s.uniqueDistortions >= 12 },
    { id: 'big-shift', name: 'Breakthrough', icon: '⚡', desc: 'Reduced distress by 7+ points', check: s => s.maxReduction >= 7 },
    { id: 'level-5', name: 'Champion', icon: '👑', desc: 'Reached Thriving level', check: s => s.level >= 5 },
    { id: 'twenty-five', name: 'Reframe Master', icon: '🏆', desc: '25 reframes completed', check: s => s.totalReframes >= 25 },
    { id: 'seven-streak', name: 'Weekly Warrior', icon: '🛡️', desc: '7-day reframe streak', check: s => s.currentStreak >= 7 },
    // Growth Lab badges
    { id: 'first-worksheet', name: 'First Step', icon: '📝', desc: 'Completed your first worksheet', check: s => s.worksheetsCompleted >= 1 },
    { id: 'all-worksheets', name: 'Deep Diver', icon: '🏊', desc: 'Completed all 5 worksheets', check: s => s.worksheetsCompleted >= 5 },
];

let _rsDraft = {};
let _rsStep = 0;
let _rsReframeIndex = 0;

// --- Worker URL (same as Mona chat) ---
const RS_WORKER_URL = typeof CHAT_WORKER_URL !== 'undefined' ? CHAT_WORKER_URL : 'https://recovery-chat.kidell-powellj.workers.dev';

function openReframeFlow() {
    _rsDraft = { thought: '', emotionBefore: null, emotionAfter: null, distortionAnswers: {}, reframes: {}, reframedThought: '', aiAnalysis: null };
    _rsStep = 0;
    _rsReframeIndex = 0;
    const overlay = document.getElementById('rsOverlay');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    renderRsStep();
}
window.openReframeFlow = openReframeFlow;

function closeReframeFlow() {
    const overlay = document.getElementById('rsOverlay');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
}
window.closeReframeFlow = closeReframeFlow;

function renderRsProgress() {
    const labels = ['Capture', 'Identify', 'Reframe', 'Complete'];
    const el = document.getElementById('rsProgress');
    el.innerHTML = labels.map((l, i) => `<div class="rs-progress-dot ${i === _rsStep ? 'active' : ''} ${i < _rsStep ? 'completed' : ''}"><span>${i + 1}</span></div>`).join('<div class="rs-progress-line"></div>');
}

function renderRsStep() {
    renderRsProgress();
    const content = document.getElementById('rsStepContent');
    switch (_rsStep) {
        case 0: renderRsCapture(content); break;
        case 1:
            if (_rsDraft.aiAnalysis) renderRsAIReveals(content);
            else renderRsLoading(content);
            break;
        case 2: renderRsReframe(content); break;
        case 3: renderRsFinale(content); break;
    }
}

function rsIntensityRow(prefix, selected) {
    return Array.from({length: 10}, (_, i) => {
        const v = i + 1;
        return `<button type="button" class="intensity-btn ${selected === v ? 'selected' : ''}" data-val="${v}" onclick="selectRsIntensity(this,'${prefix}')">${v}</button>`;
    }).join('');
}

function selectRsIntensity(btn, type) {
    btn.parentElement.querySelectorAll('.intensity-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    if (type === 'before') _rsDraft.emotionBefore = parseInt(btn.dataset.val);
    else _rsDraft.emotionAfter = parseInt(btn.dataset.val);
}
window.selectRsIntensity = selectRsIntensity;

// ===== Step 0: Capture =====
function renderRsCapture(el) {
    el.innerHTML = `
        <div class="rs-step-card">
            <h3 class="rs-step-title">What's on your mind?</h3>
            <p class="rs-step-hint">There's no wrong answer. Just write what you're thinking.</p>
            <textarea class="rs-textarea" id="rsThoughtInput" placeholder="Write the thought that's bothering you..." rows="4">${escapeHtml(_rsDraft.thought || '')}</textarea>
            <label class="rs-label">How much distress does this cause? (1 = low, 10 = high)</label>
            <div class="rs-intensity-row">${rsIntensityRow('before', _rsDraft.emotionBefore)}</div>
            <button class="btn btn-primary rs-next-btn" onclick="rsAnalyzeThought()">✨ Analyze My Thought</button>
        </div>
    `;
}

async function rsAnalyzeThought() {
    const thought = document.getElementById('rsThoughtInput').value.trim();
    if (!thought) { showToast('Please write your thought first'); return; }
    if (!_rsDraft.emotionBefore) { showToast('Please rate your distress level'); return; }
    _rsDraft.thought = thought;
    _rsStep = 1;
    renderRsProgress();
    renderRsLoading(document.getElementById('rsStepContent'));

    try {
        const response = await fetch(RS_WORKER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'analyze-thought',
                thought: thought,
                distressLevel: _rsDraft.emotionBefore
            })
        });
        const data = await response.json();
        let text = data.content?.[0]?.text;
        if (!text) throw new Error('Empty response');

        // Strip markdown code fences if the AI wrapped the JSON in them
        text = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();

        const analysis = JSON.parse(text);
        if (!analysis.distortions || !Array.isArray(analysis.distortions) || analysis.distortions.length === 0) {
            throw new Error('No distortions found');
        }
        _rsDraft.aiAnalysis = analysis;
        _rsDraft.distortionAnswers = {};
        analysis.distortions.forEach(d => {
            _rsDraft.distortionAnswers[d.name] = d.confidence === 'high' ? 'yes' : 'maybe';
        });
        renderRsStep();
    } catch (err) {
        console.error('AI analysis error:', err);
        renderRsAnalysisError(document.getElementById('rsStepContent'));
    }
}
window.rsAnalyzeThought = rsAnalyzeThought;

// ===== Loading State =====
function renderRsLoading(el) {
    el.innerHTML = `
        <div class="rs-step-card rs-loading-card">
            <div class="rs-loading-brain">
                <span class="rs-loading-icon">🧠</span>
                <div class="rs-loading-sparkles">
                    <span class="rs-sparkle">✨</span>
                    <span class="rs-sparkle">✨</span>
                    <span class="rs-sparkle">✨</span>
                </div>
            </div>
            <h3 class="rs-step-title">Analyzing your thought...</h3>
            <p class="rs-step-hint">Looking for cognitive patterns</p>
            <div class="rs-loading-bar"><div class="rs-loading-fill"></div></div>
        </div>
    `;
}

// ===== Error / Fallback =====
function renderRsAnalysisError(el) {
    el.innerHTML = `
        <div class="rs-step-card">
            <h3 class="rs-step-title">Couldn't analyze right now</h3>
            <p class="rs-step-hint">The AI analysis didn't complete. You can try again or identify patterns manually.</p>
            <button class="btn btn-primary rs-next-btn" onclick="rsAnalyzeThought()">Try Again</button>
            <button class="btn rs-next-btn rs-secondary-btn" onclick="rsStartManualMode()">Identify Manually</button>
        </div>
    `;
}

function rsStartManualMode() {
    _rsDraft.aiAnalysis = null;
    _rsDraft._manualMode = true;
    _rsDraft._manualQuizIndex = 0;
    renderRsManualIdentify(document.getElementById('rsStepContent'));
}
window.rsStartManualMode = rsStartManualMode;

// --- Manual fallback quiz (simplified from v2) ---
function renderRsManualIdentify(el) {
    const idx = _rsDraft._manualQuizIndex || 0;
    if (idx >= RS_DISTORTIONS.length) {
        const matches = RS_DISTORTIONS.filter(d => { const a = _rsDraft.distortionAnswers[d.name]; return a === 'yes' || a === 'maybe'; });
        if (matches.length === 0) {
            el.innerHTML = `<div class="rs-step-card"><h3 class="rs-step-title">No patterns selected</h3><p class="rs-step-hint">Pick at least one pattern to reframe.</p>
            <div class="rs-manual-pick">${RS_DISTORTIONS.map(d => `<button class="distortion-badge rs-pick-badge" onclick="manualPickDistortion('${d.name}', this)">${d.icon} ${d.name}</button>`).join('')}</div>
            <button class="btn btn-primary rs-next-btn" onclick="rsNextFromManual()">Continue</button></div>`;
        } else {
            _rsDraft.aiAnalysis = { distortions: matches.map(d => ({ name: d.name, confidence: _rsDraft.distortionAnswers[d.name] === 'yes' ? 'high' : 'medium', explanation: d.desc, reframingQuestions: d.prompts.slice(0, 2), suggestedReframe: '' })), suggestedReframedThought: '', affirmation: 'Great job examining your thinking!' };
            _rsStep = 2; _rsReframeIndex = 0; renderRsStep();
        }
        return;
    }
    const d = RS_DISTORTIONS[idx];
    el.innerHTML = `
        <div class="rs-step-card rs-quiz-card">
            <p class="rs-quiz-progress">${idx + 1} of ${RS_DISTORTIONS.length} patterns</p>
            <div class="rs-quiz-distortion"><span class="rs-quiz-icon">${d.icon}</span><h3 class="rs-quiz-name">${d.name}</h3><p class="rs-quiz-desc">${d.desc}</p>
            <div class="rs-quiz-example"><span class="rs-quiz-example-label">Example:</span> <em>"${d.example}"</em></div></div>
            <p class="rs-quiz-question">Does this sound like your thought?</p>
            <div class="rs-quiz-answers">
                <button class="btn rs-quiz-btn rs-quiz-yes" onclick="answerManualQuiz('yes')">Yes, this is me</button>
                <button class="btn rs-quiz-btn rs-quiz-maybe" onclick="answerManualQuiz('maybe')">Maybe</button>
                <button class="btn rs-quiz-btn rs-quiz-no" onclick="answerManualQuiz('no')">Not really</button>
            </div>
        </div>`;
}

function answerManualQuiz(answer) {
    const d = RS_DISTORTIONS[_rsDraft._manualQuizIndex || 0];
    _rsDraft.distortionAnswers[d.name] = answer;
    _rsDraft._manualQuizIndex = (_rsDraft._manualQuizIndex || 0) + 1;
    renderRsManualIdentify(document.getElementById('rsStepContent'));
    renderRsProgress();
}
window.answerManualQuiz = answerManualQuiz;

function manualPickDistortion(name, btn) {
    btn.classList.toggle('selected');
    _rsDraft.distortionAnswers[name] = btn.classList.contains('selected') ? 'yes' : 'no';
}
window.manualPickDistortion = manualPickDistortion;

function rsNextFromManual() {
    const matches = RS_DISTORTIONS.filter(d => { const a = _rsDraft.distortionAnswers[d.name]; return a === 'yes' || a === 'maybe'; });
    if (matches.length === 0) { showToast('Pick at least one pattern'); return; }
    _rsDraft.aiAnalysis = { distortions: matches.map(d => ({ name: d.name, confidence: _rsDraft.distortionAnswers[d.name] === 'yes' ? 'high' : 'medium', explanation: d.desc, reframingQuestions: d.prompts.slice(0, 2), suggestedReframe: '' })), suggestedReframedThought: '', affirmation: 'Great job examining your thinking!' };
    _rsStep = 2; _rsReframeIndex = 0; renderRsStep();
}
window.rsNextFromManual = rsNextFromManual;

// ===== Step 1: AI Reveals =====
function renderRsAIReveals(el) {
    const analysis = _rsDraft.aiAnalysis;
    let html = '<div class="rs-step-card rs-ai-reveals-card">';
    html += `<h3 class="rs-step-title">We found ${analysis.distortions.length} thinking pattern${analysis.distortions.length > 1 ? 's' : ''}</h3>`;
    html += `<p class="rs-step-hint">${escapeHtml(analysis.affirmation)}</p>`;
    html += '<div class="rs-ai-distortion-list">';

    analysis.distortions.forEach((d, i) => {
        const def = RS_DISTORTIONS.find(rd => rd.name === d.name);
        const icon = def ? def.icon : '🔍';
        const confClass = d.confidence === 'high' ? 'rs-confidence-high' : 'rs-confidence-medium';
        html += `
            <div class="rs-ai-distortion-card ${confClass}" style="animation-delay: ${i * 0.15}s" onclick="toggleDistortionExpand(this)">
                <div class="rs-ai-distortion-header">
                    <span class="rs-ai-distortion-icon">${icon}</span>
                    <div class="rs-ai-distortion-meta">
                        <span class="rs-ai-distortion-name">${escapeHtml(d.name)}</span>
                        <span class="rs-ai-confidence-pill ${confClass}">${d.confidence === 'high' ? 'Strong match' : 'Possible match'}</span>
                    </div>
                    <span class="rs-ai-expand-chevron">▾</span>
                </div>
                <div class="rs-ai-distortion-body">
                    <p class="rs-ai-explanation">${escapeHtml(d.explanation)}</p>
                </div>
            </div>`;
    });

    html += '</div>';
    html += `<button class="btn btn-primary rs-next-btn" onclick="rsNextFromAIReveals()">Let's reframe these</button>`;
    html += '</div>';
    el.innerHTML = html;
}

function toggleDistortionExpand(card) {
    card.classList.toggle('expanded');
}
window.toggleDistortionExpand = toggleDistortionExpand;

function rsNextFromAIReveals() {
    _rsStep = 2;
    _rsReframeIndex = 0;
    renderRsStep();
}
window.rsNextFromAIReveals = rsNextFromAIReveals;

// ===== Step 2: Guided Reframe (AI-powered) =====
function renderRsReframe(el) {
    const distortions = _rsDraft.aiAnalysis.distortions;
    if (_rsReframeIndex >= distortions.length) {
        _rsStep = 3;
        renderRsStep();
        return;
    }
    const d = distortions[_rsReframeIndex];
    const def = RS_DISTORTIONS.find(rd => rd.name === d.name);
    const icon = def ? def.icon : '🔍';
    const saved = _rsDraft.reframes[d.name] || {};
    const questions = d.reframingQuestions || (def ? def.prompts.slice(0, 2) : []);

    el.innerHTML = `
        <div class="rs-step-card rs-reframe-card">
            <p class="rs-reframe-progress">Reframing ${_rsReframeIndex + 1} of ${distortions.length}</p>
            <div class="rs-reframe-header">
                <span class="rs-reframe-icon">${icon}</span>
                <h3>${escapeHtml(d.name)}</h3>
            </div>
            <div class="rs-original-thought">
                <span class="rs-ot-label">Your thought:</span>
                <p>"${escapeHtml(_rsDraft.thought)}"</p>
            </div>
            <p class="rs-reframe-ask">Consider these questions:</p>
            <div class="rs-prompt-pills">
                ${questions.map(q => `<button class="rs-prompt-pill" onclick="selectReframePrompt(this, '${escapeHtml(d.name)}')">${escapeHtml(q)}</button>`).join('')}
            </div>
            ${d.suggestedReframe ? `
            <div class="rs-ai-suggestion">
                <span class="rs-ai-suggestion-label">AI suggestion:</span>
                <button class="rs-use-suggestion-btn" onclick="useAISuggestion('${escapeHtml(d.name)}')">Use as starting point</button>
            </div>
            <p class="rs-ai-suggested-text">"${escapeHtml(d.suggestedReframe)}"</p>` : ''}
            <textarea class="rs-textarea" id="rsReframeText" placeholder="Write your reframe..." rows="3">${escapeHtml(saved.text || '')}</textarea>
            <button class="btn btn-primary rs-next-btn" onclick="rsNextReframeDistortion('${escapeHtml(d.name)}')">${_rsReframeIndex < distortions.length - 1 ? 'Next Pattern' : 'Write Final Thought'}</button>
        </div>
    `;
}

function useAISuggestion(distortionName) {
    const d = _rsDraft.aiAnalysis.distortions.find(x => x.name === distortionName);
    if (d && d.suggestedReframe) {
        const ta = document.getElementById('rsReframeText');
        if (ta) { ta.value = d.suggestedReframe; ta.focus(); }
    }
}
window.useAISuggestion = useAISuggestion;

function selectReframePrompt(btn, distortionName) {
    const textarea = document.getElementById('rsReframeText');
    if (textarea && !textarea.value.trim()) {
        textarea.value = btn.textContent + ' ';
        textarea.focus();
    }
    btn.parentElement.querySelectorAll('.rs-prompt-pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    if (!_rsDraft.reframes[distortionName]) _rsDraft.reframes[distortionName] = {};
    _rsDraft.reframes[distortionName].prompt = btn.textContent;
}
window.selectReframePrompt = selectReframePrompt;

function rsNextReframeDistortion(distortionName) {
    const text = document.getElementById('rsReframeText').value.trim();
    if (!text) { showToast('Write a reframe before continuing'); return; }
    if (!_rsDraft.reframes[distortionName]) _rsDraft.reframes[distortionName] = {};
    _rsDraft.reframes[distortionName].text = text;
    _rsReframeIndex++;
    renderRsReframe(document.getElementById('rsStepContent'));
    renderRsProgress();
}
window.rsNextReframeDistortion = rsNextReframeDistortion;

// ===== Step 3: Finale (New Thought + Celebration) =====
function renderRsFinale(el) {
    const analysis = _rsDraft.aiAnalysis;
    const suggested = analysis ? analysis.suggestedReframedThought : '';
    el.innerHTML = `
        <div class="rs-step-card">
            <h3 class="rs-step-title">Your new perspective</h3>
            <div class="rs-old-thought">
                <span class="rs-ot-label">Old thought:</span>
                <p class="rs-old-text">"${escapeHtml(_rsDraft.thought)}"</p>
            </div>
            <p class="rs-step-hint">Write your balanced thought — we've started with AI's suggestion:</p>
            <textarea class="rs-textarea" id="rsNewThought" placeholder="My reframed thought..." rows="4">${escapeHtml(_rsDraft.reframedThought || suggested || '')}</textarea>
            <label class="rs-label">How much distress do you feel now? (1-10)</label>
            <div class="rs-intensity-row">${rsIntensityRow('after', _rsDraft.emotionAfter)}</div>
            <button class="btn btn-primary rs-next-btn" onclick="rsFinish()">Complete & Earn XP</button>
        </div>
    `;
}

// ===== XP Calculation =====
function calculateReframeXP(draft) {
    const breakdown = [];
    let totalXP = 25;
    breakdown.push({ label: 'Reframe completed', xp: 25 });

    const distCount = draft.aiAnalysis ? draft.aiAnalysis.distortions.length : 0;
    if (distCount > 0) {
        const distXP = distCount * 10;
        totalXP += distXP;
        breakdown.push({ label: `${distCount} pattern${distCount > 1 ? 's' : ''} reframed`, xp: distXP });
    }

    const reduction = (draft.emotionBefore || 0) - (draft.emotionAfter || 0);
    if (reduction >= 5) {
        totalXP += 25;
        breakdown.push({ label: 'Major distress reduction', xp: 25 });
    } else if (reduction >= 3) {
        totalXP += 15;
        breakdown.push({ label: 'Distress reduction', xp: 15 });
    }

    return { totalXP, breakdown };
}

function getLevelForXP(xp) {
    let current = GAME_LEVELS[0];
    let next = GAME_LEVELS[1] || GAME_LEVELS[0];
    for (let i = GAME_LEVELS.length - 1; i >= 0; i--) {
        if (xp >= GAME_LEVELS[i].xpRequired) {
            current = GAME_LEVELS[i];
            next = GAME_LEVELS[i + 1] || GAME_LEVELS[i];
            break;
        }
    }
    const progress = next.xpRequired > current.xpRequired
        ? Math.round(((xp - current.xpRequired) / (next.xpRequired - current.xpRequired)) * 100)
        : 100;
    return { current, next, progress };
}

async function awardXP(xpResult) {
    if (typeof window.getGameData !== 'function') return;
    try {
        const gameData = await window.getGameData();
        const prevXP = gameData.reframeXP || 0;
        const prevLevel = gameData.reframeLevel || 1;
        const newXP = prevXP + xpResult.totalXP;
        const levelInfo = getLevelForXP(newXP);

        xpResult.currentXP = newXP;
        xpResult.currentLevel = levelInfo.current;
        xpResult.nextLevelXP = levelInfo.next.xpRequired;
        xpResult.levelProgress = levelInfo.progress;
        xpResult.leveledUp = levelInfo.current.level > prevLevel;

        await window.saveGameData({
            reframeXP: newXP,
            reframeLevel: levelInfo.current.level,
            reframeLevelName: levelInfo.current.name
        });
    } catch (e) {
        console.error('XP award error:', e);
        const levelInfo = getLevelForXP(xpResult.totalXP);
        xpResult.currentXP = xpResult.totalXP;
        xpResult.currentLevel = levelInfo.current;
        xpResult.nextLevelXP = levelInfo.next.xpRequired;
        xpResult.levelProgress = levelInfo.progress;
        xpResult.leveledUp = false;
    }
}

// ===== Finish & Save =====
async function rsFinish() {
    const newThought = document.getElementById('rsNewThought').value.trim();
    if (!newThought) { showToast('Write your reframed thought'); return; }
    _rsDraft.reframedThought = newThought;

    const xpResult = calculateReframeXP(_rsDraft);
    const distortionNames = _rsDraft.aiAnalysis ? _rsDraft.aiAnalysis.distortions.map(d => d.name) : [];

    // Sanitize aiAnalysis for Firestore — re-serialize to strip any non-JSON-safe values
    let safeAiAnalysis = null;
    if (_rsDraft.aiAnalysis) {
        try { safeAiAnalysis = JSON.parse(JSON.stringify(_rsDraft.aiAnalysis)); } catch (e) { safeAiAnalysis = null; }
    }

    // Save to Firestore — don't let save failure block the celebration
    try {
        await window.saveThoughtEntry({
            thought: _rsDraft.thought,
            distortions: distortionNames,
            distortionAnswers: _rsDraft.distortionAnswers,
            reframes: _rsDraft.reframes,
            reframedThought: _rsDraft.reframedThought,
            emotionBefore: _rsDraft.emotionBefore,
            emotionAfter: _rsDraft.emotionAfter,
            aiAnalysis: safeAiAnalysis,
            xpEarned: xpResult.totalXP,
            version: 3
        });
    } catch (e) {
        console.error('Save error:', e);
    }

    // Award XP — isolated from save errors
    try {
        await awardXP(xpResult);
    } catch (e) {
        console.error('XP award error:', e);
    }

    // Always show celebration regardless of save/XP outcome
    renderRsCelebration(document.getElementById('rsStepContent'), xpResult);
    if (typeof launchOnboardingConfetti === 'function') launchOnboardingConfetti();
}
window.rsFinish = rsFinish;

// ===== Celebration with XP =====
function renderRsCelebration(el, xpResult) {
    const before = _rsDraft.emotionBefore || 0;
    const after = _rsDraft.emotionAfter || 0;
    const reduction = before - after;
    const pct = before > 0 ? Math.round((reduction / before) * 100) : 0;
    const analysis = _rsDraft.aiAnalysis;
    const distDefs = analysis ? analysis.distortions.map(d => {
        const def = RS_DISTORTIONS.find(rd => rd.name === d.name);
        return { name: d.name, icon: def ? def.icon : '🔍' };
    }) : [];
    const encouragement = RS_ENCOURAGEMENTS[Math.floor(Math.random() * RS_ENCOURAGEMENTS.length)];

    let html = '<div class="rs-step-card rs-celebration-card">';
    html += '<h3 class="rs-celebration-title">Well done!</h3>';

    // XP gain
    if (xpResult) {
        html += `<div class="rs-xp-gain">
            <span class="rs-xp-number">+${xpResult.totalXP} XP</span>
            <div class="rs-xp-breakdown">${xpResult.breakdown.map(b => `<span class="rs-xp-item">${b.label}: +${b.xp}</span>`).join('')}</div>
        </div>`;

        if (xpResult.currentLevel) {
            html += `<div class="rs-level-display">
                <span class="rs-level-name">${xpResult.currentLevel.icon} ${xpResult.currentLevel.name}</span>
                <div class="rs-level-bar"><div class="rs-level-fill" style="width: ${xpResult.levelProgress || 0}%"></div></div>
                <span class="rs-level-xp">${xpResult.currentXP || 0} / ${xpResult.nextLevelXP || 100} XP</span>
            </div>`;
        }

        if (xpResult.leveledUp) {
            html += `<div class="rs-level-up">🎉 Level Up! You are now a <strong>${xpResult.currentLevel.name}</strong></div>`;
        }
    }

    // Distress reduction
    if (reduction > 0) {
        html += `<div class="rs-distress-drop">
            <span class="rs-drop-number">${before}</span>
            <span class="rs-drop-arrow">→</span>
            <span class="rs-drop-number rs-drop-after">${after}</span>
            <p class="rs-drop-text">Distress reduced by ${reduction} point${reduction > 1 ? 's' : ''}${pct > 0 ? ` (${pct}%)` : ''}</p>
        </div>`;
    } else if (after > 0) {
        html += `<p class="rs-step-hint">Even without a big shift, you practiced a powerful skill. That matters.</p>`;
    }

    html += `<div class="rs-celebration-badges">${distDefs.map(d => `<span class="distortion-badge">${d.icon} ${d.name}</span>`).join('')}</div>`;
    html += `<p class="rs-encouragement">"${encouragement}"</p>`;
    html += `<button class="btn btn-primary rs-next-btn" onclick="closeReframeFlow(); loadThoughtEntries();">Save & Close</button>`;
    html += '</div>';
    el.innerHTML = html;
}

// ===== Landing page: load stats + past entries + gamification =====
async function loadThoughtEntries() {
    if (typeof window.loadThoughtEntriesFromDB !== 'function') return;
    const entries = await window.loadThoughtEntriesFromDB();

    // Stats
    const countEl = document.getElementById('rsReframeCount');
    const streakEl = document.getElementById('rsStreak');
    const xpEl = document.getElementById('rsTotalXP');
    if (countEl) countEl.textContent = entries ? entries.length : 0;

    let streak = 0;
    if (entries && entries.length > 0) {
        const today = new Date(); today.setHours(0,0,0,0);
        for (let i = 0; i < 30; i++) {
            const d = new Date(today); d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const hasEntry = entries.some(e => {
                if (!e.createdAt?.toDate) return false;
                const ed = e.createdAt.toDate(); ed.setHours(0,0,0,0);
                return ed.toISOString().split('T')[0] === dateStr;
            });
            if (hasEntry) streak++; else if (i > 0) break;
        }
    }
    if (streakEl) streakEl.textContent = streak;

    // Gamification display
    try {
        if (typeof window.getGameData === 'function') {
            const gameData = await window.getGameData();
            const xp = gameData.reframeXP || 0;
            const levelInfo = getLevelForXP(xp);
            if (xpEl) xpEl.textContent = xp;
            const badgeEl = document.getElementById('rsLevelBadge');
            if (badgeEl) {
                badgeEl.textContent = `${levelInfo.current.icon} ${levelInfo.current.name}`;
                badgeEl.parentElement.style.display = 'flex';
            }
            const levelFill = document.getElementById('rsLandingLevelFill');
            const levelXPText = document.getElementById('rsLandingLevelXP');
            const levelContainer = document.getElementById('rsLandingLevel');
            if (levelFill) levelFill.style.width = `${levelInfo.progress}%`;
            if (levelXPText) levelXPText.textContent = `${xp} / ${levelInfo.next.xpRequired} XP`;
            if (levelContainer) levelContainer.style.display = 'block';
        }
    } catch (e) { console.error('Gamification load error:', e); }

    // Past entries
    if (!entries || entries.length === 0) return;
    const section = document.getElementById('rsPastSection');
    const container = document.getElementById('rsPastEntries');
    if (!section || !container) return;
    section.style.display = 'block';
    container.innerHTML = '';

    entries.forEach(entry => {
        const card = document.createElement('div');
        card.className = 'rs-entry-card glass-card';
        const date = entry.createdAt?.toDate ? entry.createdAt.toDate().toLocaleDateString() : '';
        const before = entry.emotionBefore || 0;
        const after = entry.emotionAfter || 0;
        const drop = before - after;

        let inner = `<div class="rs-entry-header"><span class="rs-entry-date">${date}</span>`;
        if (drop > 0) inner += `<span class="rs-entry-drop">-${drop} distress</span>`;
        if (entry.xpEarned) inner += `<span class="rs-entry-xp">+${entry.xpEarned} XP</span>`;
        inner += `<button class="thought-entry-delete" onclick="deleteThoughtEntryUI('${entry.id}')">&times;</button></div>`;
        inner += `<p class="rs-entry-thought">"${escapeHtml(entry.thought)}"</p>`;
        if (entry.reframedThought) {
            inner += `<p class="rs-entry-reframed">"${escapeHtml(entry.reframedThought)}"</p>`;
        } else if (entry.reframe) {
            inner += `<p class="rs-entry-reframed">"${escapeHtml(entry.reframe)}"</p>`;
        }
        const distortionIcons = (entry.distortions || []).map(name => {
            const def = RS_DISTORTIONS.find(rd => rd.name === name);
            return `<span class="distortion-badge">${def ? def.icon : ''} ${name}</span>`;
        }).join('');
        inner += `<div class="rs-entry-badges">${distortionIcons}</div>`;
        card.innerHTML = inner;
        container.appendChild(card);
    });
}
window.loadThoughtEntries = loadThoughtEntries;

async function deleteThoughtEntryUI(entryId) {
    if (typeof window.deleteThoughtEntry === 'function') {
        await window.deleteThoughtEntry(entryId);
        showToast('Entry deleted');
        loadThoughtEntries();
    }
}
window.deleteThoughtEntryUI = deleteThoughtEntryUI;

// ========== COPING TOOLBOX ==========
const DEFAULT_COPING_SKILLS = {
    physical: ['Walk/run','Yoga/stretching','Dance','Clean/organize','Warm shower','Stress ball'],
    emotional: ['Journal feelings','Cry if needed','Affirmations','Self-compassion','Listen to music'],
    mental: ['Reframe thoughts','Positive visualization','Deep breathing','Crossword/puzzle','Read'],
    sensory: ['Scented candle','Favorite tea/snack','Soft blanket','Calming photos','Calming sounds'],
    social: ['Call/text sponsor','Attend meeting','Supportive friends','Volunteer','Recovery network']
};

let _copingToolbox = null;
let _activeCopingTab = 'physical';

async function loadCopingToolbox() {
    if (typeof window.loadCopingToolboxFromDB === 'function') {
        _copingToolbox = await window.loadCopingToolboxFromDB();
    }
    if (!_copingToolbox) {
        _copingToolbox = {};
        Object.entries(DEFAULT_COPING_SKILLS).forEach(([cat, skills]) => {
            _copingToolbox[cat] = skills.map(name => ({ name, active: false, starred: false, custom: false }));
        });
    }
    renderCopingTab(_activeCopingTab);
    renderStarredSkills();
}
window.loadCopingToolbox = loadCopingToolbox;

function switchCopingTab(tab) {
    _activeCopingTab = tab;
    document.querySelectorAll('.coping-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    renderCopingTab(tab);
}
window.switchCopingTab = switchCopingTab;

function renderCopingTab(tab) {
    const container = document.getElementById('copingCategoryContent');
    const skills = _copingToolbox[tab] || [];
    container.innerHTML = skills.map((s, i) => `
        <button class="coping-skill ${s.active ? 'active' : ''} ${s.starred ? 'starred' : ''}" onclick="toggleCopingSkill('${tab}',${i})">
            <span class="coping-skill-star" onclick="event.stopPropagation(); starCopingSkill('${tab}',${i})">★</span>
            ${escapeHtml(s.name)}
        </button>
    `).join('');
}

function toggleCopingSkill(cat, index) {
    _copingToolbox[cat][index].active = !_copingToolbox[cat][index].active;
    saveCopingState();
    renderCopingTab(_activeCopingTab);
}
window.toggleCopingSkill = toggleCopingSkill;

function starCopingSkill(cat, index) {
    _copingToolbox[cat][index].starred = !_copingToolbox[cat][index].starred;
    saveCopingState();
    renderCopingTab(_activeCopingTab);
    renderStarredSkills();
}
window.starCopingSkill = starCopingSkill;

function addCustomCopingSkill() {
    const input = document.getElementById('copingCustomInput');
    const name = input.value.trim();
    if (!name) return;
    if (!_copingToolbox[_activeCopingTab]) _copingToolbox[_activeCopingTab] = [];
    _copingToolbox[_activeCopingTab].push({ name, active: true, starred: false, custom: true });
    input.value = '';
    saveCopingState();
    renderCopingTab(_activeCopingTab);
}
window.addCustomCopingSkill = addCustomCopingSkill;

function renderStarredSkills() {
    const container = document.getElementById('copingStarredSkills');
    const quickAccess = document.getElementById('copingQuickAccess');
    const starred = [];
    Object.entries(_copingToolbox).forEach(([cat, skills]) => {
        skills.forEach(s => { if (s.starred) starred.push(s.name); });
    });
    if (starred.length === 0) { quickAccess.style.display = 'none'; return; }
    quickAccess.style.display = 'block';
    container.innerHTML = starred.map(name => `<span class="coping-skill active starred">${escapeHtml(name)}</span>`).join('');
}

function saveCopingState() {
    if (typeof window.saveCopingToolboxToDB === 'function') {
        window.saveCopingToolboxToDB(_copingToolbox);
    }
}

// Coping suggestions for urge log integration
// ========== GROWTH LAB — Guided AI-Powered Worksheets ==========
const WORKSHEETS = {
    'core-beliefs': {
        title: 'Core Beliefs Explorer',
        icon: '🧠',
        description: 'Uncover and challenge deep beliefs that shape your recovery',
        steps: [
            { type: 'intro', title: 'Core Beliefs Explorer', body: 'Core beliefs are deep assumptions we hold about ourselves — often formed early in life or reinforced by addiction. They sit beneath our everyday thoughts and quietly shape how we feel, act, and relate to others.\n\nIn this exercise, you\'ll identify beliefs that resonate with you, explore where they show up, and — with a little AI-powered guidance — start building evidence for a more balanced perspective.\n\nThere are no wrong answers. Just honest reflection.' },
            { type: 'guided-select', title: 'Which beliefs resonate with you?', hint: 'Most people in recovery identify with several of these. Select all that feel true — even if only sometimes.', options: [
                "I'm not good enough", "I'm unlovable", "I'm worthless", "I'm a failure",
                "I'm broken", "I don't belong", "I'm helpless", "I can't trust anyone",
                "I'm different from everyone", "I don't deserve happiness", "I'm weak", "I'm stupid"
            ]},
            { type: 'guided-textarea', title: 'When does this belief show up?', hint: 'Think of a recent moment when one of these beliefs felt especially loud. What was happening? How did it affect you?', placeholder: 'Describe a situation where this belief influenced your feelings or actions...', promptPills: ['A time I felt not good enough', 'A conversation that triggered shame', 'A moment I wanted to isolate', 'When I compared myself to others'] },
            { type: 'ai-analysis', title: 'Your Personalized Insight' },
            { type: 'reflection', title: 'Building Counter-Evidence', hint: 'Your AI insight suggested some questions to help you find evidence against this belief. Use them as starting points — or write freely.', textareaCount: 3, textareaPlaceholder: 'Evidence that contradicts this belief' },
            { type: 'guided-textarea', title: 'Your Action Step', hint: 'Based on what you\'ve explored, what\'s one small thing you could do this week to test this belief?', placeholder: 'One concrete action I can take this week...', promptPills: ['Ask someone I trust for honest feedback', 'Notice when the belief isn\'t true', 'Write down one thing I did well each day', 'Challenge the belief out loud when I notice it'] }
        ]
    },
    'strengths': {
        title: 'Strengths & Qualities',
        icon: '💪',
        description: 'Rediscover who you are beneath the addiction',
        steps: [
            { type: 'intro', title: 'Strengths & Qualities', body: 'Addiction can make us forget who we really are. It shrinks our identity down to our worst moments and loudest mistakes.\n\nBut you are so much more than that. This exercise helps you reconnect with your strengths — the qualities that have carried you through hard times and are active in your recovery right now.\n\nLet\'s rediscover what makes you, you.' },
            { type: 'guided-multi-textarea', title: 'What are you good at?', hint: 'These don\'t have to be grand achievements. Cooking a good meal, listening to a friend, staying calm under pressure — it all counts.', count: 3, placeholder: 'Something I\'m good at', promptPills: ['I\'m a good listener', 'I can make people laugh', 'I\'m resilient', 'I\'m creative', 'I\'m a hard worker'] },
            { type: 'guided-multi-textarea', title: 'What challenges have you overcome?', hint: 'Recovery itself is a massive achievement. What else have you pushed through? Think of moments where you surprised yourself.', count: 3, placeholder: 'A challenge I\'ve overcome', promptPills: ['Getting through my first week', 'Rebuilding a relationship', 'Going back to work/school', 'Asking for help', 'Facing a fear'] },
            { type: 'guided-multi-textarea', title: 'What do others appreciate about you?', hint: 'What have people told you they value? What do friends, family, or fellows say about you? If you\'re not sure, think about what role you play in your relationships.', count: 3, placeholder: 'Something others appreciate about me', promptPills: ['My honesty', 'My sense of humor', 'My loyalty', 'My kindness', 'My determination'] },
            { type: 'ai-analysis', title: 'Your Strength Profile' },
            { type: 'reflection', title: 'Using Your Strengths', hint: 'Your AI insight revealed strengths you might not even see in yourself. How will you put them to use this week?', textareaCount: 1, textareaPlaceholder: 'How I\'ll use my strengths in recovery this week...' }
        ]
    },
    'frustration': {
        title: 'Frustration Tolerance',
        icon: '🌊',
        description: 'Build healthier responses to life\'s frustrations',
        steps: [
            { type: 'intro', title: 'Frustration Tolerance', body: 'Frustration is one of the most common relapse triggers. When things don\'t go our way, old patterns kick in — we react instead of respond, and we reach for what used to numb the feeling.\n\nThis exercise helps you understand your frustration patterns, identify the beliefs underneath them, and build a personalized coping plan with AI-guided insight.\n\nLearning to sit with frustration without acting on it is one of the most powerful skills in recovery.' },
            { type: 'guided-select', title: 'Which frustration beliefs feel familiar?', hint: 'These are common beliefs that fuel frustration. Check all that apply — no judgment. Awareness is the first step.', options: [
                "Things should always go my way", "I can't stand being uncomfortable",
                "Life should be fair", "People should behave the way I want",
                "I shouldn't have to wait", "It's terrible when things go wrong",
                "I can't cope with this", "This will never get better"
            ]},
            { type: 'guided-textarea', title: 'Tell your frustration story', hint: 'Think of a recent time frustration got the best of you. What happened? How did you react? What did it cost you?', placeholder: 'Describe a recent frustrating situation and how you reacted...', promptPills: ['A time I lost my temper', 'When something felt deeply unfair', 'A situation I couldn\'t control', 'When someone let me down'] },
            { type: 'ai-analysis', title: 'Your Frustration Pattern' },
            { type: 'guided-select', title: 'Choose coping thoughts that resonate', hint: 'Based on your AI insight, which of these challenge thoughts feel like ones you could actually use?', options: [
                "I can handle discomfort", "This feeling is temporary",
                "I've dealt with worse before", "Getting upset won't change the situation",
                "I can choose my response", "Frustration is normal but doesn't have to control me",
                "I can problem-solve instead of reacting", "This is an opportunity to practice patience"
            ]},
            { type: 'reflection', title: 'Your Coping Plan', hint: 'Now pull it all together. What will you tell yourself — and do — next time frustration shows up?', textareaCount: 1, textareaPlaceholder: 'My plan for the next time frustration arises...' }
        ]
    },
    'values': {
        title: 'Values Clarification',
        icon: '🧭',
        description: 'Rediscover what matters and align your life with it',
        steps: [
            { type: 'intro', title: 'Values Clarification', body: 'In active addiction, our values get buried. We say family matters most, but our actions tell a different story. Recovery is about closing that gap — rediscovering what truly matters and learning to live in alignment with it.\n\nThis exercise will help you rate what\'s important to you, honestly assess how well you\'re living those values, and create a concrete plan to close the biggest gaps.\n\nGaps aren\'t failures — they\'re information. They show you where to focus next.' },
            { type: 'value-rating', title: 'How important is each value to you?', hint: 'Rate each value from 1 (not important) to 10 (extremely important). Go with your gut — there are no right answers.', values: ['Family','Career','Relationships','Health','Spirituality','Community','Growth','Fun'], ratingType: 'importance' },
            { type: 'value-rating', title: 'How aligned are you with each value right now?', hint: 'Be honest with yourself. A low number doesn\'t mean failure — it means there\'s an opportunity to grow. Rate 1 (not at all aligned) to 10 (fully living this value).', values: ['Family','Career','Relationships','Health','Spirituality','Community','Growth','Fun'], ratingType: 'alignment' },
            { type: 'value-gap', title: 'Your Values Gap Chart' },
            { type: 'ai-analysis', title: 'Your Values Insight' },
            { type: 'reflection', title: 'Your Weekly Challenge', hint: 'Your AI insight identified where the biggest gaps are and suggested a challenge. Pick one value to focus on this week.', textareaCount: 1, textareaPlaceholder: 'The value I\'ll focus on this week and what I\'ll do...' }
        ]
    },
    'treatment-attitudes': {
        title: 'Treatment Attitudes',
        icon: '📋',
        description: 'Check in with your openness and readiness for recovery',
        steps: [
            { type: 'intro', title: 'Treatment Attitudes', body: 'This isn\'t a test — it\'s a check-in with yourself about where you stand right now in your recovery journey.\n\nEvery answer reveals something valuable. Saying "False" to a statement isn\'t a failure — it\'s honesty, and honesty is the foundation of recovery.\n\nAnswer based on where you are TODAY, not where you think you should be.' },
            { type: 'true-false', title: 'Respond to each statement honestly', hint: 'Remember: there are no wrong answers. This is between you and your recovery.', statements: [
                'I am willing to try new approaches to recovery',
                'I believe I can change my life for the better',
                'I am honest with my counselor/sponsor',
                'I attend meetings or sessions regularly',
                'I am open to feedback from others',
                'I take responsibility for my actions',
                'I practice the skills I learn in treatment',
                'I reach out for help when I need it',
                'I believe recovery is possible for me',
                'I am committed to my recovery plan',
                'I can identify my triggers',
                'I have healthy coping strategies',
                'I am patient with my progress',
                'I forgive myself for past mistakes',
                'I see setbacks as learning opportunities'
            ]},
            { type: 'ai-analysis', title: 'Your Readiness Profile' },
            { type: 'reflection', title: 'Your Next Step', hint: 'Your AI insight highlighted growth areas as opportunities, not deficits. Pick one area and write a small, concrete step you can take.', textareaCount: 1, textareaPlaceholder: 'One small step I can take to strengthen my recovery this week...' }
        ]
    }
};

let _currentWorksheet = null;
let _currentWsStep = 0;
let _worksheetData = {};
let _wsAiInsight = null;
let _wsReviewMode = false;

async function loadWorkbookGrid() {
    const grid = document.getElementById('workbookGrid');
    if (!grid) return;
    let statuses = {};
    if (typeof window.loadAllWorksheetStatus === 'function') {
        statuses = await window.loadAllWorksheetStatus();
    }

    // Gamification display
    try {
        if (typeof window.getGameData === 'function') {
            const gameData = await window.getGameData();
            const xp = gameData.reframeXP || 0;
            const levelInfo = getLevelForXP(xp);
            const completedCount = Object.values(statuses).filter(s => s.completed).length;

            const wsCountEl = document.getElementById('glWorksheetCount');
            const xpEl = document.getElementById('glTotalXP');
            if (wsCountEl) wsCountEl.textContent = completedCount;
            if (xpEl) xpEl.textContent = xp;

            const badgeEl = document.getElementById('glLevelBadge');
            if (badgeEl) {
                badgeEl.textContent = `${levelInfo.current.icon} ${levelInfo.current.name}`;
                badgeEl.parentElement.style.display = 'flex';
            }
            const levelFill = document.getElementById('glLandingLevelFill');
            const levelXPText = document.getElementById('glLandingLevelXP');
            const levelContainer = document.getElementById('glLandingLevel');
            if (levelFill) levelFill.style.width = `${levelInfo.progress}%`;
            if (levelXPText) levelXPText.textContent = `${xp} / ${levelInfo.next.xpRequired} XP`;
            if (levelContainer) levelContainer.style.display = 'block';
        }
    } catch (e) { console.error('Growth Lab gamification load error:', e); }

    grid.innerHTML = Object.entries(WORKSHEETS).map(([id, ws]) => {
        const status = statuses[id];
        const completed = status && status.completed;
        const inProgress = status && !status.completed && status.currentStep > 0;
        return `<div class="worksheet-card ${completed ? 'completed' : ''} ${inProgress ? 'in-progress' : ''}" onclick="openWorksheet('${id}')">
            <span class="worksheet-icon">${ws.icon}</span>
            <h3>${ws.title}</h3>
            <p>${ws.description}</p>
            ${completed ? '<span class="worksheet-badge completed-badge">Completed ✓</span>' : inProgress ? '<span class="worksheet-badge progress-badge">In Progress</span>' : ''}
            <button class="btn btn-secondary worksheet-btn">${completed ? 'Review' : inProgress ? 'Continue' : 'Start'}</button>
        </div>`;
    }).join('');
}
window.loadWorkbookGrid = loadWorkbookGrid;

async function openWorksheet(worksheetId) {
    _currentWorksheet = worksheetId;
    _currentWsStep = 0;
    _worksheetData = {};
    _wsAiInsight = null;
    _wsReviewMode = false;

    if (typeof window.loadWorksheetData === 'function') {
        const saved = await window.loadWorksheetData(worksheetId);
        if (saved) {
            if (saved.data) _worksheetData = saved.data;
            if (saved.aiInsight) _wsAiInsight = saved.aiInsight;
            // If completed with XP already awarded → show review mode
            if (saved.completed && saved.xpAwarded) {
                _wsReviewMode = true;
                const overlay = document.getElementById('worksheetOverlay');
                overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
                renderWorksheetReview();
                return;
            }
            _currentWsStep = saved.currentStep || 0;
        }
    }

    const overlay = document.getElementById('worksheetOverlay');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    renderWorksheetStep();
}
window.openWorksheet = openWorksheet;

function closeWorksheet() {
    const overlay = document.getElementById('worksheetOverlay');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    _currentWorksheet = null;
    _wsAiInsight = null;
    _wsReviewMode = false;
    loadWorkbookGrid();
}
window.closeWorksheet = closeWorksheet;

// ===== Review Mode =====
function renderWorksheetReview() {
    const ws = WORKSHEETS[_currentWorksheet];
    if (!ws) return;
    const header = document.getElementById('worksheetHeader');
    const content = document.getElementById('worksheetStepContent');
    const nav = document.getElementById('worksheetNav');

    if (header) header.innerHTML = `<h3>${ws.icon} ${ws.title}</h3><span class="worksheet-badge completed-badge" style="display:inline-block;margin-top:4px;">Completed ✓</span>`;
    if (nav) nav.innerHTML = `
        <button class="btn btn-secondary" onclick="wsRedoWorksheet()">Redo This Worksheet</button>
        <button class="btn btn-primary" onclick="closeWorksheet()">Back to Growth Lab</button>
    `;

    let html = '<div class="ws-review-container">';

    // Walk through each step and render read-only summaries
    ws.steps.forEach((step, i) => {
        const stepKey = `step_${i}`;
        const saved = _worksheetData[stepKey] || {};

        if (step.type === 'intro' || step.type === 'ai-analysis') return; // Skip intro and AI analysis steps in review

        html += `<div class="ws-review-section">`;
        html += `<h4 class="ws-review-section-title">${step.title}</h4>`;

        switch (step.type) {
            case 'guided-select':
            case 'multi-select':
                if (saved.selected && saved.selected.length > 0) {
                    html += '<div class="ws-review-pills">';
                    saved.selected.forEach(s => { html += `<span class="ws-review-pill">${escapeHtml(s)}</span>`; });
                    html += '</div>';
                } else {
                    html += '<p class="ws-review-empty">No selections made</p>';
                }
                break;
            case 'guided-textarea':
                html += saved.text ? `<p class="ws-review-text">${escapeHtml(saved.text)}</p>` : '<p class="ws-review-empty">No response</p>';
                break;
            case 'guided-multi-textarea':
            case 'multi-textarea':
                if (saved.texts && saved.texts.some(t => t && t.trim())) {
                    html += '<ul class="ws-review-list">';
                    saved.texts.forEach(t => { if (t && t.trim()) html += `<li>${escapeHtml(t)}</li>`; });
                    html += '</ul>';
                } else {
                    html += '<p class="ws-review-empty">No responses</p>';
                }
                break;
            case 'value-rating':
                if (saved.ratings) {
                    html += '<div class="ws-review-ratings">';
                    Object.entries(saved.ratings).forEach(([val, r]) => {
                        html += `<div class="ws-review-rating-row"><span>${val}</span><span class="ws-review-rating-val">${r}/10</span></div>`;
                    });
                    html += '</div>';
                }
                break;
            case 'value-gap':
                html += renderValueGapChart();
                break;
            case 'true-false':
                if (saved.answers) {
                    const trueCount = Object.values(saved.answers).filter(v => v === true).length;
                    const total = step.statements.length;
                    const pct = Math.round((trueCount / total) * 100);
                    html += `<p class="ws-review-score"><strong>${trueCount}/${total} (${pct}%)</strong></p>`;
                    html += '<div class="ws-review-tf">';
                    step.statements.forEach((stmt, si) => {
                        const a = saved.answers[si];
                        html += `<div class="ws-review-tf-row ${a ? 'true' : 'false'}"><span class="ws-review-tf-icon">${a ? '✓' : '✗'}</span><span>${escapeHtml(stmt)}</span></div>`;
                    });
                    html += '</div>';
                }
                break;
            case 'reflection':
                if (saved.text) {
                    html += `<p class="ws-review-text">${escapeHtml(saved.text)}</p>`;
                } else if (saved.texts && saved.texts.some(t => t && t.trim())) {
                    html += '<ul class="ws-review-list">';
                    saved.texts.forEach(t => { if (t && t.trim()) html += `<li>${escapeHtml(t)}</li>`; });
                    html += '</ul>';
                } else {
                    html += '<p class="ws-review-empty">No reflection written</p>';
                }
                break;
        }

        html += '</div>';
    });

    // Show AI insight if saved
    if (_wsAiInsight) {
        html += '<div class="ws-review-section ws-review-ai">';
        html += '<h4 class="ws-review-section-title">AI Insight</h4>';
        html += renderWsAIInsightContent(_currentWorksheet, _wsAiInsight);
        html += '</div>';
    }

    html += '</div>';
    content.innerHTML = html;
}

function wsRedoWorksheet() {
    const worksheetId = _currentWorksheet;
    _worksheetData = {};
    _wsAiInsight = null;
    _wsReviewMode = false;
    _currentWsStep = 0;
    // Save cleared state (keep completed flag but reset data)
    if (typeof window.saveWorksheetData === 'function') {
        window.saveWorksheetData(worksheetId, {
            data: {},
            currentStep: 0,
            completed: false,
            xpAwarded: false
        });
    }
    renderWorksheetStep();
}
window.wsRedoWorksheet = wsRedoWorksheet;

// ===== Main Step Renderer =====
function renderWorksheetStep() {
    const ws = WORKSHEETS[_currentWorksheet];
    if (!ws) return;
    const step = ws.steps[_currentWsStep];
    const header = document.getElementById('worksheetHeader');
    const content = document.getElementById('worksheetStepContent');
    const nav = document.getElementById('worksheetNav');
    const totalSteps = ws.steps.length;

    // Progress bar
    const progressPct = Math.round(((_currentWsStep) / (totalSteps - 1)) * 100);
    header.innerHTML = `
        <h3>${ws.icon} ${ws.title}</h3>
        <div class="ws-progress-bar"><div class="ws-progress-fill" style="width:${progressPct}%"></div></div>
        <p class="worksheet-progress">Step ${_currentWsStep + 1} of ${totalSteps}</p>
    `;

    const stepKey = `step_${_currentWsStep}`;
    const saved = _worksheetData[stepKey] || {};

    // Render based on step type
    switch (step.type) {
        case 'intro':
            renderWsIntro(content, step);
            break;
        case 'guided-select':
            renderWsGuidedSelect(content, step, stepKey, saved);
            break;
        case 'guided-textarea':
            renderWsGuidedTextarea(content, step, stepKey, saved);
            break;
        case 'guided-multi-textarea':
            renderWsGuidedMultiTextarea(content, step, stepKey, saved);
            break;
        case 'ai-analysis':
            renderWsAIStep(content, step);
            break;
        case 'reflection':
            renderWsReflection(content, step, stepKey, saved);
            break;
        case 'value-rating':
            renderWsValueRating(content, step, stepKey, saved);
            break;
        case 'value-gap':
            renderWsValueGap(content, step);
            break;
        case 'true-false':
            renderWsTrueFalse(content, step, stepKey, saved);
            break;
        default:
            content.innerHTML = `<p>Unknown step type: ${step.type}</p>`;
    }

    // Nav buttons — intro has its own "Let's Begin" button; ai-analysis has no nav
    if (step.type === 'intro' || step.type === 'ai-analysis') {
        nav.innerHTML = '';
    } else {
        const isFirst = _currentWsStep === 0;
        const isLast = _currentWsStep === totalSteps - 1;
        nav.innerHTML = `
            <button class="btn btn-secondary" ${isFirst ? 'disabled' : ''} onclick="prevWorksheetStep()">Back</button>
            ${isLast ? '<button class="btn btn-primary" onclick="finishWorksheet()">Complete</button>' : '<button class="btn btn-primary" onclick="nextWorksheetStep()">Next</button>'}
        `;
    }
}

// ===== Intro Step =====
function renderWsIntro(el, step) {
    const paragraphs = step.body.split('\n\n').map(p => `<p>${escapeHtml(p)}</p>`).join('');
    el.innerHTML = `
        <div class="rs-step-card ws-intro-card">
            <h3 class="rs-step-title">${step.title}</h3>
            <div class="ws-intro-body">${paragraphs}</div>
            <button class="btn btn-primary rs-next-btn" onclick="nextWorksheetStep()">Let's Begin</button>
        </div>
    `;
}

// ===== Guided Select =====
function renderWsGuidedSelect(el, step, stepKey, saved) {
    let html = `<div class="rs-step-card">`;
    html += `<h3 class="rs-step-title">${step.title}</h3>`;
    if (step.hint) html += `<p class="rs-step-hint">${step.hint}</p>`;
    html += '<div class="worksheet-options">';
    step.options.forEach(opt => {
        const checked = (saved.selected || []).includes(opt);
        html += `<button class="worksheet-option ${checked ? 'selected' : ''}" onclick="toggleWsOption(this, '${stepKey}')">${escapeHtml(opt)}</button>`;
    });
    html += '</div></div>';
    el.innerHTML = html;
}

// ===== Guided Textarea =====
function renderWsGuidedTextarea(el, step, stepKey, saved) {
    let html = `<div class="rs-step-card">`;
    html += `<h3 class="rs-step-title">${step.title}</h3>`;
    if (step.hint) html += `<p class="rs-step-hint">${step.hint}</p>`;
    if (step.promptPills && step.promptPills.length > 0) {
        html += `<div class="rs-prompt-pills">`;
        step.promptPills.forEach(pill => {
            html += `<button class="rs-prompt-pill" onclick="selectWsPromptPill(this, '${stepKey}')">${escapeHtml(pill)}</button>`;
        });
        html += `</div>`;
    }
    html += `<textarea class="worksheet-textarea" id="wsTextarea_${stepKey}" placeholder="${step.placeholder || ''}" oninput="saveWsText('${stepKey}', this.value)">${saved.text || ''}</textarea>`;
    html += '</div>';
    el.innerHTML = html;
}

// ===== Guided Multi-Textarea =====
function renderWsGuidedMultiTextarea(el, step, stepKey, saved) {
    let html = `<div class="rs-step-card">`;
    html += `<h3 class="rs-step-title">${step.title}</h3>`;
    if (step.hint) html += `<p class="rs-step-hint">${step.hint}</p>`;
    if (step.promptPills && step.promptPills.length > 0) {
        html += `<div class="rs-prompt-pills">`;
        step.promptPills.forEach(pill => {
            html += `<button class="rs-prompt-pill" onclick="selectWsPromptPill(this, '${stepKey}')">${escapeHtml(pill)}</button>`;
        });
        html += `</div>`;
    }
    html += '<div class="worksheet-multi-inputs">';
    for (let i = 0; i < step.count; i++) {
        html += `<input type="text" class="worksheet-text-input" placeholder="${step.placeholder} ${i + 1}" value="${escapeHtml((saved.texts || [])[i] || '')}" oninput="saveWsMultiText('${stepKey}', ${i}, this.value)">`;
    }
    html += '</div></div>';
    el.innerHTML = html;
}

// ===== AI Analysis Step =====
function renderWsAIStep(content, step) {
    // If we already have an insight, show it
    if (_wsAiInsight) {
        renderWsAIInsight(content, step);
        return;
    }
    // Otherwise trigger the AI call
    renderWsAILoading(content);
    wsRequestAIAnalysis();
}

function renderWsAILoading(el) {
    el.innerHTML = `
        <div class="rs-step-card rs-loading-card">
            <div class="rs-loading-brain">
                <span class="rs-loading-icon">🧠</span>
                <div class="rs-loading-sparkles">
                    <span class="rs-sparkle">✨</span>
                    <span class="rs-sparkle">✨</span>
                    <span class="rs-sparkle">✨</span>
                </div>
            </div>
            <h3 class="rs-step-title">Analyzing your responses...</h3>
            <p class="rs-step-hint">Creating personalized insight just for you</p>
            <div class="rs-loading-bar"><div class="rs-loading-fill"></div></div>
        </div>
    `;
}

async function wsRequestAIAnalysis() {
    try {
        const payload = buildWsAIPayload(_currentWorksheet);
        const response = await fetch(RS_WORKER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'worksheet-guide',
                worksheetType: _currentWorksheet,
                responses: payload
            })
        });
        const data = await response.json();
        let text = data.content?.[0]?.text;
        if (!text) throw new Error('Empty AI response');

        // Strip markdown code fences
        text = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
        const insight = JSON.parse(text);
        _wsAiInsight = insight;

        // Save AI insight to Firestore
        try {
            if (typeof window.saveWorksheetData === 'function') {
                await window.saveWorksheetData(_currentWorksheet, {
                    data: _worksheetData,
                    currentStep: _currentWsStep,
                    completed: false,
                    aiInsight: JSON.parse(JSON.stringify(_wsAiInsight))
                });
            }
        } catch (e) { console.error('AI insight save error:', e); }

        const content = document.getElementById('worksheetStepContent');
        const ws = WORKSHEETS[_currentWorksheet];
        const step = ws.steps[_currentWsStep];
        renderWsAIInsight(content, step);
    } catch (err) {
        console.error('Worksheet AI analysis error:', err);
        renderWsAIError(document.getElementById('worksheetStepContent'));
    }
}

function buildWsAIPayload(worksheetId) {
    const payload = {};
    switch (worksheetId) {
        case 'core-beliefs':
            payload.selectedBeliefs = (_worksheetData['step_1'] || {}).selected || [];
            payload.situation = (_worksheetData['step_2'] || {}).text || '';
            break;
        case 'strengths':
            payload.strengths = (_worksheetData['step_1'] || {}).texts || [];
            payload.challenges = (_worksheetData['step_2'] || {}).texts || [];
            payload.appreciation = (_worksheetData['step_3'] || {}).texts || [];
            break;
        case 'frustration':
            payload.frustrationBeliefs = (_worksheetData['step_1'] || {}).selected || [];
            payload.frustrationStory = (_worksheetData['step_2'] || {}).text || '';
            break;
        case 'values': {
            const importRatings = (_worksheetData['step_1'] || {}).ratings || {};
            const alignRatings = (_worksheetData['step_2'] || {}).ratings || {};
            payload.importance = importRatings;
            payload.alignment = alignRatings;
            payload.gaps = {};
            Object.keys(importRatings).forEach(v => {
                payload.gaps[v] = Math.abs((importRatings[v] || 5) - (alignRatings[v] || 5));
            });
            break;
        }
        case 'treatment-attitudes': {
            const tfData = (_worksheetData['step_1'] || {}).answers || {};
            const ws = WORKSHEETS['treatment-attitudes'];
            const statements = ws.steps[1].statements;
            payload.responses = {};
            statements.forEach((stmt, i) => {
                payload.responses[stmt] = tfData[i] === true ? 'True' : tfData[i] === false ? 'False' : 'Unanswered';
            });
            const trueCount = Object.values(tfData).filter(v => v === true).length;
            payload.score = `${trueCount}/${statements.length}`;
            break;
        }
    }
    return payload;
}

function renderWsAIInsight(el, step) {
    let html = `<div class="rs-step-card ws-insight-card">`;
    html += `<h3 class="rs-step-title">${step.title}</h3>`;
    html += renderWsAIInsightContent(_currentWorksheet, _wsAiInsight);
    html += `<button class="btn btn-primary rs-next-btn" onclick="nextWorksheetStep()">Continue</button>`;
    html += '</div>';
    el.innerHTML = html;
}

function renderWsAIInsightContent(worksheetId, insight) {
    if (!insight) return '<p>No AI insight available.</p>';
    let html = '';

    switch (worksheetId) {
        case 'core-beliefs':
            if (insight.theme) html += `<div class="ws-insight-badge">${escapeHtml(insight.theme)}</div>`;
            if (insight.insight) html += `<p class="ws-insight-text">${escapeHtml(insight.insight)}</p>`;
            if (insight.suggestedReframe) html += `<div class="ws-insight-reframe"><strong>A gentler truth:</strong> ${escapeHtml(insight.suggestedReframe)}</div>`;
            if (insight.affirmation) html += `<p class="ws-insight-affirmation">${escapeHtml(insight.affirmation)}</p>`;
            if (insight.actionStep) html += `<div class="ws-insight-action"><strong>This week:</strong> ${escapeHtml(insight.actionStep)}</div>`;
            break;
        case 'strengths':
            if (insight.strengthProfile) html += `<p class="ws-insight-text">${escapeHtml(insight.strengthProfile)}</p>`;
            if (insight.topThemes && insight.topThemes.length > 0) {
                html += '<div class="ws-insight-themes">';
                insight.topThemes.forEach(t => { html += `<span class="ws-insight-theme-pill">${escapeHtml(t)}</span>`; });
                html += '</div>';
            }
            if (insight.connections) html += `<p class="ws-insight-text">${escapeHtml(insight.connections)}</p>`;
            if (insight.hiddenStrength) html += `<div class="ws-hidden-strength"><strong>A strength you might not see:</strong> ${escapeHtml(insight.hiddenStrength)}</div>`;
            if (insight.affirmation) html += `<p class="ws-insight-affirmation">${escapeHtml(insight.affirmation)}</p>`;
            if (insight.actionStep) html += `<div class="ws-insight-action"><strong>This week:</strong> ${escapeHtml(insight.actionStep)}</div>`;
            break;
        case 'frustration':
            if (insight.pattern) html += `<div class="ws-insight-badge">${escapeHtml(insight.pattern)}</div>`;
            if (insight.triggerInsight) html += `<p class="ws-insight-text">${escapeHtml(insight.triggerInsight)}</p>`;
            if (insight.copingSuggestions && insight.copingSuggestions.length > 0) {
                html += '<div class="ws-insight-coping"><strong>Coping strategies for you:</strong><ul>';
                insight.copingSuggestions.forEach(s => { html += `<li>${escapeHtml(s)}</li>`; });
                html += '</ul></div>';
            }
            if (insight.reframedNarrative) html += `<div class="ws-insight-reframe"><strong>Another way to see it:</strong> ${escapeHtml(insight.reframedNarrative)}</div>`;
            if (insight.affirmation) html += `<p class="ws-insight-affirmation">${escapeHtml(insight.affirmation)}</p>`;
            if (insight.actionStep) html += `<div class="ws-insight-action"><strong>This week:</strong> ${escapeHtml(insight.actionStep)}</div>`;
            break;
        case 'values':
            if (insight.valueProfile) html += `<p class="ws-insight-text">${escapeHtml(insight.valueProfile)}</p>`;
            if (insight.biggestGaps && insight.biggestGaps.length > 0) {
                html += '<div class="ws-insight-gaps"><strong>Biggest gaps:</strong>';
                insight.biggestGaps.forEach(g => {
                    html += `<div class="ws-insight-gap-item"><span class="ws-insight-gap-value">${escapeHtml(g.value)}</span> <span class="ws-insight-gap-num">Gap: ${g.gap}</span><p>${escapeHtml(g.insight)}</p></div>`;
                });
                html += '</div>';
            }
            if (insight.alignmentWins && insight.alignmentWins.length > 0) {
                html += '<div class="ws-insight-wins"><strong>Where you\'re aligned:</strong><ul>';
                insight.alignmentWins.forEach(w => { html += `<li>${escapeHtml(w)}</li>`; });
                html += '</ul></div>';
            }
            if (insight.connectionToRecovery) html += `<p class="ws-insight-text">${escapeHtml(insight.connectionToRecovery)}</p>`;
            if (insight.weeklyChallenge) html += `<div class="ws-insight-action"><strong>Your weekly challenge:</strong> ${escapeHtml(insight.weeklyChallenge)}</div>`;
            if (insight.affirmation) html += `<p class="ws-insight-affirmation">${escapeHtml(insight.affirmation)}</p>`;
            break;
        case 'treatment-attitudes':
            if (insight.overallReadiness) {
                const badgeClass = insight.overallReadiness === 'high' ? 'high' : insight.overallReadiness === 'moderate' ? 'moderate' : 'developing';
                html += `<div class="ws-readiness-badge ws-readiness-${badgeClass}">${insight.overallReadiness.charAt(0).toUpperCase() + insight.overallReadiness.slice(1)} Readiness</div>`;
            }
            if (insight.scoreInterpretation) html += `<p class="ws-insight-text">${escapeHtml(insight.scoreInterpretation)}</p>`;
            if (insight.strengths && insight.strengths.length > 0) {
                html += '<div class="ws-insight-wins"><strong>Your strengths:</strong><ul>';
                insight.strengths.forEach(s => { html += `<li>${escapeHtml(s)}</li>`; });
                html += '</ul></div>';
            }
            if (insight.growthAreas && insight.growthAreas.length > 0) {
                html += '<div class="ws-insight-growth"><strong>Areas to explore:</strong><ul>';
                insight.growthAreas.forEach(g => { html += `<li>${escapeHtml(g)}</li>`; });
                html += '</ul></div>';
            }
            if (insight.encouragement) html += `<p class="ws-insight-affirmation">${escapeHtml(insight.encouragement)}</p>`;
            if (insight.nextStep) html += `<div class="ws-insight-action"><strong>Your next step:</strong> ${escapeHtml(insight.nextStep)}</div>`;
            break;
    }

    return html;
}

function renderWsAIError(el) {
    el.innerHTML = `
        <div class="rs-step-card">
            <h3 class="rs-step-title">Couldn't generate insight right now</h3>
            <p class="rs-step-hint">The AI analysis didn't complete. You can try again or continue without it — your responses are still saved.</p>
            <button class="btn btn-primary rs-next-btn" onclick="wsRetryAI()">Try Again</button>
            <button class="btn rs-next-btn rs-secondary-btn" onclick="wsSkipAI()">Continue Without AI</button>
        </div>
    `;
}

function wsRetryAI() {
    const content = document.getElementById('worksheetStepContent');
    renderWsAILoading(content);
    wsRequestAIAnalysis();
}
window.wsRetryAI = wsRetryAI;

function wsSkipAI() {
    _wsAiInsight = null;
    nextWorksheetStep();
}
window.wsSkipAI = wsSkipAI;

// ===== Reflection Step =====
function renderWsReflection(el, step, stepKey, saved) {
    let html = `<div class="rs-step-card">`;
    html += `<h3 class="rs-step-title">${step.title}</h3>`;
    if (step.hint) html += `<p class="rs-step-hint">${step.hint}</p>`;

    // Show AI-generated prompt pills if available
    const aiPrompts = getAIReflectionPrompts(_currentWorksheet, _wsAiInsight);
    if (aiPrompts.length > 0) {
        html += `<div class="rs-prompt-pills">`;
        aiPrompts.forEach(pill => {
            html += `<button class="rs-prompt-pill" onclick="selectWsPromptPill(this, '${stepKey}')">${escapeHtml(pill)}</button>`;
        });
        html += `</div>`;
    }

    // Show AI suggestion card if available
    const aiSuggestion = getAISuggestion(_currentWorksheet, _wsAiInsight);
    if (aiSuggestion) {
        html += `<div class="ws-ai-suggestion">
            <p class="ws-ai-suggestion-label">AI suggestion:</p>
            <p class="ws-ai-suggestion-text">${escapeHtml(aiSuggestion)}</p>
            <button class="btn btn-secondary ws-use-suggestion-btn" onclick="useWsAISuggestion('${stepKey}')">Use as starting point</button>
        </div>`;
    }

    if (step.textareaCount && step.textareaCount > 1) {
        html += '<div class="worksheet-multi-inputs">';
        for (let i = 0; i < step.textareaCount; i++) {
            html += `<textarea class="worksheet-textarea ws-reflection-textarea" id="wsReflection_${stepKey}_${i}" placeholder="${step.textareaPlaceholder || ''} ${i + 1}" oninput="saveWsReflectionMulti('${stepKey}', ${i}, this.value)">${(saved.texts || [])[i] || ''}</textarea>`;
        }
        html += '</div>';
    } else {
        html += `<textarea class="worksheet-textarea ws-reflection-textarea" id="wsReflection_${stepKey}" placeholder="${step.textareaPlaceholder || ''}" oninput="saveWsText('${stepKey}', this.value)">${saved.text || ''}</textarea>`;
    }

    html += '</div>';
    el.innerHTML = html;
}

function getAIReflectionPrompts(worksheetId, insight) {
    if (!insight) return [];
    switch (worksheetId) {
        case 'core-beliefs': return insight.counterEvidencePrompts || [];
        case 'strengths': return [];
        case 'frustration': return insight.copingSuggestions || [];
        case 'values': return insight.weeklyChallenge ? [insight.weeklyChallenge] : [];
        case 'treatment-attitudes': return insight.nextStep ? [insight.nextStep] : [];
        default: return [];
    }
}

function getAISuggestion(worksheetId, insight) {
    if (!insight) return null;
    switch (worksheetId) {
        case 'core-beliefs': return insight.suggestedReframe || null;
        case 'strengths': return insight.actionStep || null;
        case 'frustration': return insight.reframedNarrative || null;
        case 'values': return insight.weeklyChallenge || null;
        case 'treatment-attitudes': return insight.nextStep || null;
        default: return null;
    }
}

// ===== Value Rating =====
function renderWsValueRating(el, step, stepKey, saved) {
    let html = `<div class="rs-step-card">`;
    html += `<h3 class="rs-step-title">${step.title}</h3>`;
    if (step.hint) html += `<p class="rs-step-hint">${step.hint}</p>`;
    html += '<div class="worksheet-value-ratings">';
    step.values.forEach(val => {
        const rating = (saved.ratings || {})[val] || 5;
        html += `<div class="value-rating-row">
            <span class="value-rating-label">${val}</span>
            <input type="range" min="1" max="10" value="${rating}" class="value-slider" onchange="saveWsRating('${stepKey}','${val}',this.value)">
            <span class="value-rating-num">${rating}</span>
        </div>`;
    });
    html += '</div></div>';
    el.innerHTML = html;

    // Attach range slider live update
    el.querySelectorAll('.value-slider').forEach(slider => {
        slider.addEventListener('input', function() {
            this.nextElementSibling.textContent = this.value;
        });
    });
}

// ===== Value Gap Chart =====
function renderWsValueGap(el, step) {
    let html = `<div class="rs-step-card">`;
    html += `<h3 class="rs-step-title">${step.title}</h3>`;
    html += `<p class="rs-step-hint">Values with a gap of 3+ are highlighted. These aren't failures — they're where you have the most room to grow.</p>`;
    html += renderValueGapChart();
    html += '</div>';
    el.innerHTML = html;
}

function renderValueGapChart() {
    const importStep = WORKSHEETS['values'].steps.findIndex(s => s.ratingType === 'importance');
    const alignStep = WORKSHEETS['values'].steps.findIndex(s => s.ratingType === 'alignment');
    const importanceData = (_worksheetData[`step_${importStep}`] || {}).ratings || {};
    const alignmentData = (_worksheetData[`step_${alignStep}`] || {}).ratings || {};
    const values = WORKSHEETS['values'].steps[importStep].values;
    let html = '<div class="gap-chart">';
    values.forEach(val => {
        const imp = importanceData[val] || 5;
        const align = alignmentData[val] || 5;
        const gap = Math.abs(imp - align);
        html += `<div class="gap-chart-row">
            <span class="gap-chart-label">${val}</span>
            <div class="gap-chart-bars">
                <div class="gap-bar importance" style="width:${imp * 10}%"><span>${imp}</span></div>
                <div class="gap-bar alignment" style="width:${align * 10}%"><span>${align}</span></div>
            </div>
            ${gap >= 3 ? '<span class="gap-alert">Gap: ' + gap + '</span>' : ''}
        </div>`;
    });
    html += '<div class="gap-legend"><span class="gap-legend-item importance">Importance</span><span class="gap-legend-item alignment">Alignment</span></div>';
    html += '</div>';
    return html;
}

// ===== True/False =====
function renderWsTrueFalse(el, step, stepKey, saved) {
    let html = `<div class="rs-step-card">`;
    html += `<h3 class="rs-step-title">${step.title}</h3>`;
    if (step.hint) html += `<p class="rs-step-hint">${step.hint}</p>`;
    html += '<div class="worksheet-tf-list">';
    step.statements.forEach((stmt, i) => {
        const answer = (saved.answers || {})[i];
        html += `<div class="tf-statement">
            <p>${escapeHtml(stmt)}</p>
            <div class="tf-buttons">
                <button class="tf-btn ${answer === true ? 'selected true' : ''}" onclick="saveWsTF('${stepKey}',${i},true)">True</button>
                <button class="tf-btn ${answer === false ? 'selected false' : ''}" onclick="saveWsTF('${stepKey}',${i},false)">False</button>
            </div>
        </div>`;
    });
    html += '</div>';

    // Show score if all answered
    const answers = saved.answers || {};
    const answered = Object.keys(answers).length;
    if (answered === step.statements.length) {
        const trueCount = Object.values(answers).filter(v => v === true).length;
        const pct = Math.round((trueCount / step.statements.length) * 100);
        html += `<div class="tf-score"><strong>Score: ${trueCount}/${step.statements.length} (${pct}%)</strong><p>${pct >= 80 ? 'Strong treatment engagement!' : pct >= 60 ? 'Good foundation — keep building!' : 'This is where you are today. Honesty is the first step to growth.'}</p></div>`;
    }
    html += '</div>';
    el.innerHTML = html;
}

// ===== Data Save Handlers =====
function toggleWsOption(btn, stepKey) {
    btn.classList.toggle('selected');
    const selected = Array.from(btn.parentElement.querySelectorAll('.selected')).map(b => b.textContent);
    if (!_worksheetData[stepKey]) _worksheetData[stepKey] = {};
    _worksheetData[stepKey].selected = selected;
    autoSaveWorksheet();
}
window.toggleWsOption = toggleWsOption;

function saveWsText(stepKey, value) {
    if (!_worksheetData[stepKey]) _worksheetData[stepKey] = {};
    _worksheetData[stepKey].text = value;
    autoSaveWorksheet();
}
window.saveWsText = saveWsText;

function saveWsMultiText(stepKey, index, value) {
    if (!_worksheetData[stepKey]) _worksheetData[stepKey] = {};
    if (!_worksheetData[stepKey].texts) _worksheetData[stepKey].texts = [];
    _worksheetData[stepKey].texts[index] = value;
    autoSaveWorksheet();
}
window.saveWsMultiText = saveWsMultiText;

function saveWsReflectionMulti(stepKey, index, value) {
    if (!_worksheetData[stepKey]) _worksheetData[stepKey] = {};
    if (!_worksheetData[stepKey].texts) _worksheetData[stepKey].texts = [];
    _worksheetData[stepKey].texts[index] = value;
    autoSaveWorksheet();
}
window.saveWsReflectionMulti = saveWsReflectionMulti;

function saveWsRating(stepKey, valueName, rating) {
    if (!_worksheetData[stepKey]) _worksheetData[stepKey] = {};
    if (!_worksheetData[stepKey].ratings) _worksheetData[stepKey].ratings = {};
    _worksheetData[stepKey].ratings[valueName] = parseInt(rating);
    autoSaveWorksheet();
}
window.saveWsRating = saveWsRating;

function saveWsTF(stepKey, index, answer) {
    if (!_worksheetData[stepKey]) _worksheetData[stepKey] = {};
    if (!_worksheetData[stepKey].answers) _worksheetData[stepKey].answers = {};
    _worksheetData[stepKey].answers[index] = answer;
    autoSaveWorksheet();
    renderWorksheetStep(); // Re-render to update selection + score
}
window.saveWsTF = saveWsTF;

// ===== Prompt Pill + AI Suggestion Handlers =====
function selectWsPromptPill(btn, stepKey) {
    btn.parentElement.querySelectorAll('.rs-prompt-pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    // Find the first empty textarea on the page and insert the pill text
    const textareas = document.querySelectorAll(`[id^="wsTextarea_${stepKey}"], [id^="wsReflection_${stepKey}"]`);
    const target = Array.from(textareas).find(ta => !ta.value.trim()) || textareas[0];
    if (target) {
        target.value = btn.textContent;
        target.focus();
        // Trigger save
        const match = target.id.match(/wsReflection_(.+?)_(\d+)$/);
        if (match) {
            saveWsReflectionMulti(match[1], parseInt(match[2]), target.value);
        } else {
            saveWsText(stepKey, target.value);
        }
    }
}
window.selectWsPromptPill = selectWsPromptPill;

function useWsAISuggestion(stepKey) {
    const textarea = document.querySelector(`[id^="wsReflection_${stepKey}"], [id^="wsTextarea_${stepKey}"]`);
    const suggestion = getAISuggestion(_currentWorksheet, _wsAiInsight);
    if (textarea && suggestion) {
        textarea.value = suggestion;
        textarea.focus();
        saveWsText(stepKey, textarea.value);
    }
}
window.useWsAISuggestion = useWsAISuggestion;

// ===== Navigation =====
function nextWorksheetStep() {
    const ws = WORKSHEETS[_currentWorksheet];
    if (_currentWsStep < ws.steps.length - 1) {
        _currentWsStep++;
        autoSaveWorksheet();
        renderWorksheetStep();
        // Scroll to top of overlay
        const inner = document.querySelector('.worksheet-overlay-inner');
        if (inner) inner.scrollTop = 0;
    }
}
window.nextWorksheetStep = nextWorksheetStep;

function prevWorksheetStep() {
    if (_currentWsStep > 0) {
        _currentWsStep--;
        renderWorksheetStep();
        const inner = document.querySelector('.worksheet-overlay-inner');
        if (inner) inner.scrollTop = 0;
    }
}
window.prevWorksheetStep = prevWorksheetStep;

async function autoSaveWorksheet() {
    if (typeof window.saveWorksheetData === 'function') {
        const saveData = {
            data: _worksheetData,
            currentStep: _currentWsStep,
            completed: false
        };
        if (_wsAiInsight) saveData.aiInsight = JSON.parse(JSON.stringify(_wsAiInsight));
        await window.saveWorksheetData(_currentWorksheet, saveData);
    }
}

// ===== Growth Lab XP Calculation =====
function calculateWorksheetXP(worksheetId) {
    const breakdown = [];
    let totalXP = 30;
    breakdown.push({ label: 'Worksheet completed', xp: 30 });

    const ws = WORKSHEETS[worksheetId];
    if (!ws) return { totalXP, breakdown };

    // Thoroughness bonus — check guided input steps for meaningful data
    let thoroughSteps = 0;
    let totalInputSteps = 0;
    ws.steps.forEach((step, i) => {
        if (step.type === 'intro' || step.type === 'ai-analysis' || step.type === 'value-gap') return;
        totalInputSteps++;
        const stepData = _worksheetData[`step_${i}`];
        if (!stepData) return;
        let filled = false;
        if ((step.type === 'guided-select' || step.type === 'multi-select') && stepData.selected && stepData.selected.length > 0) filled = true;
        if ((step.type === 'guided-textarea' || step.type === 'reflection') && stepData.text && stepData.text.trim().length >= 5) filled = true;
        if ((step.type === 'guided-multi-textarea' || step.type === 'multi-textarea') && stepData.texts && stepData.texts.filter(t => t && t.trim().length >= 3).length >= 2) filled = true;
        if (step.type === 'value-rating' && stepData.ratings && Object.keys(stepData.ratings).length >= 5) filled = true;
        if (step.type === 'true-false' && stepData.answers && Object.keys(stepData.answers).length === step.statements.length) filled = true;
        if (filled) thoroughSteps++;
    });
    if (totalInputSteps > 0 && thoroughSteps >= totalInputSteps * 0.8) {
        totalXP += 10;
        breakdown.push({ label: 'Thoroughness bonus', xp: 10 });
    }

    // AI engagement bonus
    if (_wsAiInsight) {
        totalXP += 10;
        breakdown.push({ label: 'AI insight received', xp: 10 });
    }

    // Reflection bonus — check last reflection/action step
    const lastReflectionIdx = ws.steps.map((s, i) => s.type === 'reflection' ? i : -1).filter(i => i >= 0).pop();
    if (lastReflectionIdx !== undefined) {
        const refData = _worksheetData[`step_${lastReflectionIdx}`];
        if (refData && ((refData.text && refData.text.trim().length >= 10) || (refData.texts && refData.texts.some(t => t && t.trim().length >= 10)))) {
            totalXP += 10;
            breakdown.push({ label: 'Reflection written', xp: 10 });
        }
    }

    return { totalXP, breakdown };
}

async function finishWorksheet() {
    // Check for duplicate XP
    let alreadyAwarded = false;
    try {
        if (typeof window.loadWorksheetData === 'function') {
            const existing = await window.loadWorksheetData(_currentWorksheet);
            if (existing && existing.xpAwarded) alreadyAwarded = true;
        }
    } catch (e) { console.error('XP check error:', e); }

    const xpResult = alreadyAwarded ? { totalXP: 0, breakdown: [{ label: 'Already completed (no duplicate XP)', xp: 0 }] } : calculateWorksheetXP(_currentWorksheet);

    // Save worksheet data — don't let save failure block celebration
    try {
        if (typeof window.saveWorksheetData === 'function') {
            const savePayload = {
                data: _worksheetData,
                currentStep: _currentWsStep,
                completed: true,
                completedAt: new Date().toISOString(),
                xpAwarded: true,
                version: 2
            };
            if (_wsAiInsight) savePayload.aiInsight = JSON.parse(JSON.stringify(_wsAiInsight));
            await window.saveWorksheetData(_currentWorksheet, savePayload);
        }
    } catch (e) { console.error('Worksheet save error:', e); }

    // Check for all-worksheets bonus
    if (!alreadyAwarded) {
        try {
            if (typeof window.loadAllWorksheetStatus === 'function') {
                const statuses = await window.loadAllWorksheetStatus();
                const completedCount = Object.values(statuses).filter(s => s.completed).length;
                const totalCompleted = statuses[_currentWorksheet]?.completed ? completedCount : completedCount + 1;
                if (totalCompleted >= Object.keys(WORKSHEETS).length) {
                    const gameData = await window.getGameData();
                    const alreadyBonused = gameData.growthLabStats?.allWorksheetsBonus;
                    if (!alreadyBonused) {
                        xpResult.totalXP += 50;
                        xpResult.breakdown.push({ label: 'All worksheets completed!', xp: 50 });
                    }
                }
                await window.saveGameData({ growthLabStats: { worksheetsCompleted: totalCompleted, allWorksheetsBonus: totalCompleted >= Object.keys(WORKSHEETS).length } });
            }
        } catch (e) { console.error('Worksheet stats error:', e); }

        // Award XP — isolated from save errors
        try {
            await awardXP(xpResult);
        } catch (e) { console.error('XP award error:', e); }
    }

    // Show celebration in worksheet overlay
    renderWorksheetCelebration(xpResult);
    if (typeof launchOnboardingConfetti === 'function') launchOnboardingConfetti();
}
window.finishWorksheet = finishWorksheet;

function renderWorksheetCelebration(xpResult) {
    const ws = WORKSHEETS[_currentWorksheet];
    const content = document.getElementById('worksheetStepContent');
    const nav = document.getElementById('worksheetNav');
    const header = document.getElementById('worksheetHeader');
    if (!content) return;

    if (header) header.innerHTML = `<h2>${ws ? ws.icon : '🎉'} ${ws ? ws.title : 'Worksheet'}</h2>`;
    if (nav) nav.innerHTML = '';

    let html = '<div class="rs-step-card rs-celebration-card">';
    html += '<h3 class="rs-celebration-title">Well done!</h3>';

    // XP gain
    if (xpResult && xpResult.totalXP > 0) {
        html += `<div class="rs-xp-gain">
            <span class="rs-xp-number">+${xpResult.totalXP} XP</span>
            <div class="rs-xp-breakdown">${xpResult.breakdown.map(b => `<span class="rs-xp-item">${b.label}: +${b.xp}</span>`).join('')}</div>
        </div>`;

        if (xpResult.currentLevel) {
            html += `<div class="rs-level-display">
                <span class="rs-level-name">${xpResult.currentLevel.icon} ${xpResult.currentLevel.name}</span>
                <div class="rs-level-bar"><div class="rs-level-fill" style="width: ${xpResult.levelProgress || 0}%"></div></div>
                <span class="rs-level-xp">${xpResult.currentXP || 0} / ${xpResult.nextLevelXP || 100} XP</span>
            </div>`;
        }

        if (xpResult.leveledUp) {
            html += `<div class="rs-level-up">🎉 Level Up! You are now <strong>${xpResult.currentLevel.name}</strong></div>`;
        }
    } else if (xpResult && xpResult.totalXP === 0) {
        html += '<p class="rs-step-hint">You\'ve already earned XP for this worksheet. Great job revisiting it!</p>';
    }

    html += `<p class="rs-encouragement">Every worksheet strengthens your recovery foundation.</p>`;
    html += `<button class="btn btn-primary rs-next-btn" onclick="closeWorksheet(); loadWorkbookGrid();">Continue</button>`;
    html += '</div>';
    content.innerHTML = html;
}

window.getCopingSuggestions = function(triggerType) {
    if (!_copingToolbox) return [];
    const mapping = {
        'Stress': ['physical','mental'],
        'Social': ['social','emotional'],
        'Emotional': ['emotional','sensory'],
        'Boredom': ['mental','physical'],
        'HALT': ['physical','sensory'],
        'Environmental': ['sensory','mental'],
        'Celebratory': ['social','emotional']
    };
    const cats = mapping[triggerType] || ['physical','emotional'];
    const suggestions = [];
    cats.forEach(cat => {
        const skills = (_copingToolbox[cat] || []).filter(s => s.starred || s.active);
        skills.forEach(s => { if (suggestions.length < 3) suggestions.push(s.name); });
    });
    return suggestions;
};
