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

// ========== THOUGHT LOG ==========
let _thoughtEmotionBefore = null;
let _thoughtEmotionAfter = null;

function selectThoughtIntensity(btn, type) {
    const row = btn.parentElement;
    row.querySelectorAll('.intensity-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    if (type === 'before') _thoughtEmotionBefore = parseInt(btn.dataset.val);
    else _thoughtEmotionAfter = parseInt(btn.dataset.val);
}
window.selectThoughtIntensity = selectThoughtIntensity;

function toggleDistortion(btn) {
    btn.classList.toggle('selected');
}
window.toggleDistortion = toggleDistortion;

async function submitThoughtEntry() {
    const thought = document.getElementById('thoughtInput').value.trim();
    const reframe = document.getElementById('reframeInput').value.trim();
    const distortions = Array.from(document.querySelectorAll('.distortion-card.selected')).map(b => b.dataset.distortion);

    if (!thought) { showToast('Please enter a thought'); return; }
    if (distortions.length === 0) { showToast('Select at least one distortion'); return; }

    try {
        await window.saveThoughtEntry(thought, distortions, reframe, _thoughtEmotionBefore, _thoughtEmotionAfter);
        showToast('Thought entry saved!');
        document.getElementById('thoughtInput').value = '';
        document.getElementById('reframeInput').value = '';
        document.querySelectorAll('.distortion-card.selected').forEach(b => b.classList.remove('selected'));
        document.querySelectorAll('#emotionBeforeRow .intensity-btn, #emotionAfterRow .intensity-btn').forEach(b => b.classList.remove('selected'));
        _thoughtEmotionBefore = null;
        _thoughtEmotionAfter = null;
        loadThoughtEntries();
    } catch (e) {
        showToast('Error saving entry');
    }
}
window.submitThoughtEntry = submitThoughtEntry;

async function loadThoughtEntries() {
    if (typeof window.loadThoughtEntriesFromDB !== 'function') return;
    const entries = await window.loadThoughtEntriesFromDB();
    if (!entries || entries.length === 0) return;

    const section = document.getElementById('thoughtEntriesSection');
    const container = document.getElementById('thoughtEntriesContainer');
    section.style.display = 'block';
    container.innerHTML = '';

    // Insights
    const distortionCounts = {};
    entries.forEach(e => {
        (e.distortions || []).forEach(d => { distortionCounts[d] = (distortionCounts[d] || 0) + 1; });
    });
    const sorted = Object.entries(distortionCounts).sort((a, b) => b[1] - a[1]);
    if (sorted.length > 0) {
        const insights = document.getElementById('thoughtInsights');
        const content = document.getElementById('thoughtInsightsContent');
        insights.style.display = 'block';
        content.innerHTML = sorted.slice(0, 5).map(([name, count]) => {
            const max = sorted[0][1];
            const pct = Math.round((count / max) * 100);
            return `<div class="insight-bar-row"><span class="insight-bar-label">${name}</span><div class="insight-bar"><div class="insight-bar-fill" style="width:${pct}%"></div></div><span class="insight-bar-count">${count}</span></div>`;
        }).join('');
    }

    entries.forEach(entry => {
        const card = document.createElement('div');
        card.className = 'thought-entry-card glass-card';
        const date = entry.createdAt?.toDate ? entry.createdAt.toDate().toLocaleDateString() : '';
        card.innerHTML = `
            <div class="thought-entry-header">
                <span class="thought-entry-date">${date}</span>
                <button class="thought-entry-delete" onclick="deleteThoughtEntryUI('${entry.id}')">&times;</button>
            </div>
            <p class="thought-entry-thought">"${escapeHtml(entry.thought)}"</p>
            <div class="thought-entry-distortions">${(entry.distortions || []).map(d => `<span class="distortion-badge">${d}</span>`).join('')}</div>
            ${entry.reframe ? `<p class="thought-entry-reframe"><strong>Reframe:</strong> ${escapeHtml(entry.reframe)}</p>` : ''}
            ${entry.emotionBefore && entry.emotionAfter ? `<p class="thought-entry-intensity">Intensity: ${entry.emotionBefore} → ${entry.emotionAfter}</p>` : ''}
        `;
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
// ========== RECOVERY WORKBOOK ==========
const WORKSHEETS = {
    'core-beliefs': {
        title: 'Core Beliefs Explorer',
        icon: '🧠',
        description: 'Identify and challenge negative core beliefs',
        steps: [
            { type: 'multi-select', title: 'Select beliefs that resonate with you', options: [
                "I'm not good enough", "I'm unlovable", "I'm worthless", "I'm a failure",
                "I'm broken", "I don't belong", "I'm helpless", "I can't trust anyone",
                "I'm different from everyone", "I don't deserve happiness", "I'm weak", "I'm stupid"
            ]},
            { type: 'textarea', title: 'Describe a situation where this belief showed up', placeholder: 'What happened? How did the belief influence your actions or feelings?' },
            { type: 'multi-textarea', title: 'List 3 pieces of evidence that contradict this belief', count: 3, placeholder: 'Evidence #' }
        ]
    },
    'strengths': {
        title: 'Strengths & Qualities',
        icon: '💪',
        description: 'Discover and celebrate your strengths',
        steps: [
            { type: 'multi-textarea', title: 'Things I\'m good at', count: 3, placeholder: 'Strength' },
            { type: 'multi-textarea', title: 'Challenges I\'ve overcome', count: 3, placeholder: 'Challenge' },
            { type: 'multi-textarea', title: 'Compliments I\'ve received', count: 3, placeholder: 'Compliment' },
            { type: 'multi-textarea', title: 'What makes me unique', count: 3, placeholder: 'Quality' },
            { type: 'multi-textarea', title: 'How I\'ve helped others', count: 3, placeholder: 'Example' },
            { type: 'multi-textarea', title: 'What I value most', count: 3, placeholder: 'Value' }
        ]
    },
    'frustration': {
        title: 'Frustration Tolerance',
        icon: '🌊',
        description: 'Build healthier responses to frustration',
        steps: [
            { type: 'multi-select', title: 'Check beliefs that contribute to your frustration', options: [
                "Things should always go my way", "I can't stand being uncomfortable",
                "Life should be fair", "People should behave the way I want",
                "I shouldn't have to wait", "It's terrible when things go wrong",
                "I can't cope with this", "This will never get better"
            ]},
            { type: 'textarea', title: 'Write your frustration story', placeholder: 'Describe a recent frustrating situation and how you reacted...' },
            { type: 'multi-select', title: 'Select challenge thoughts that help', options: [
                "I can handle discomfort", "This feeling is temporary",
                "I've dealt with worse before", "Getting upset won't change the situation",
                "I can choose my response", "Frustration is normal but doesn't have to control me",
                "I can problem-solve instead of reacting", "This is an opportunity to practice patience"
            ]},
            { type: 'textarea', title: 'Write your chosen coping thoughts', placeholder: 'What will you tell yourself next time frustration arises?' }
        ]
    },
    'values': {
        title: 'Values Clarification',
        icon: '🧭',
        description: 'Understand what matters most and close the gap',
        steps: [
            { type: 'value-rating', title: 'Rate the importance of each value (1-10)', values: ['Family','Career','Relationships','Health','Spirituality','Community','Growth','Fun'], ratingType: 'importance' },
            { type: 'value-rating', title: 'Rate your current alignment (1-10)', values: ['Family','Career','Relationships','Health','Spirituality','Community','Growth','Fun'], ratingType: 'alignment' },
            { type: 'value-gap', title: 'Your values gap chart' },
            { type: 'textarea', title: 'Choose one value to focus on this week', placeholder: 'Which value has the biggest gap? What one small action can you take this week?' }
        ]
    },
    'treatment-attitudes': {
        title: 'Treatment Attitudes',
        icon: '📋',
        description: 'Check your readiness and openness to treatment',
        steps: [
            { type: 'true-false', title: 'Respond to each statement', statements: [
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
            ]}
        ]
    }
};

let _currentWorksheet = null;
let _currentWsStep = 0;
let _worksheetData = {};

async function loadWorkbookGrid() {
    const grid = document.getElementById('workbookGrid');
    if (!grid) return;
    let statuses = {};
    if (typeof window.loadAllWorksheetStatus === 'function') {
        statuses = await window.loadAllWorksheetStatus();
    }
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

    if (typeof window.loadWorksheetData === 'function') {
        const saved = await window.loadWorksheetData(worksheetId);
        if (saved && saved.data) {
            _worksheetData = saved.data;
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
    loadWorkbookGrid();
}
window.closeWorksheet = closeWorksheet;

function renderWorksheetStep() {
    const ws = WORKSHEETS[_currentWorksheet];
    if (!ws) return;
    const step = ws.steps[_currentWsStep];
    const header = document.getElementById('worksheetHeader');
    const content = document.getElementById('worksheetStepContent');
    const nav = document.getElementById('worksheetNav');
    const totalSteps = ws.steps.length;

    header.innerHTML = `<h3>${ws.icon} ${ws.title}</h3><p class="worksheet-progress">Step ${_currentWsStep + 1} of ${totalSteps}</p>`;

    let html = `<h4 class="worksheet-step-title">${step.title}</h4>`;
    const stepKey = `step_${_currentWsStep}`;
    const saved = _worksheetData[stepKey] || {};

    switch (step.type) {
        case 'multi-select':
            html += '<div class="worksheet-options">';
            step.options.forEach((opt, i) => {
                const checked = (saved.selected || []).includes(opt);
                html += `<button class="worksheet-option ${checked ? 'selected' : ''}" onclick="toggleWsOption(this, '${stepKey}')">${opt}</button>`;
            });
            html += '</div>';
            break;
        case 'textarea':
            html += `<textarea class="worksheet-textarea" id="wsTextarea" placeholder="${step.placeholder || ''}" onchange="saveWsText('${stepKey}', this.value)">${saved.text || ''}</textarea>`;
            break;
        case 'multi-textarea':
            html += '<div class="worksheet-multi-inputs">';
            for (let i = 0; i < step.count; i++) {
                html += `<input type="text" class="worksheet-text-input" placeholder="${step.placeholder} ${i+1}" value="${(saved.texts || [])[i] || ''}" onchange="saveWsMultiText('${stepKey}', ${i}, this.value)">`;
            }
            html += '</div>';
            break;
        case 'value-rating':
            html += '<div class="worksheet-value-ratings">';
            step.values.forEach(val => {
                const rating = (saved.ratings || {})[val] || 5;
                html += `<div class="value-rating-row">
                    <span class="value-rating-label">${val}</span>
                    <input type="range" min="1" max="10" value="${rating}" class="value-slider" onchange="saveWsRating('${stepKey}','${val}',this.value)">
                    <span class="value-rating-num">${rating}</span>
                </div>`;
            });
            html += '</div>';
            break;
        case 'value-gap':
            html += renderValueGapChart();
            break;
        case 'true-false':
            html += '<div class="worksheet-tf-list">';
            step.statements.forEach((stmt, i) => {
                const answer = (saved.answers || {})[i];
                html += `<div class="tf-statement">
                    <p>${stmt}</p>
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
                html += `<div class="tf-score"><strong>Score: ${trueCount}/${step.statements.length} (${pct}%)</strong><p>${pct >= 80 ? 'Strong treatment engagement!' : pct >= 60 ? 'Good foundation — keep building!' : 'Consider discussing openness to change with your support system.'}</p></div>`;
            }
            break;
    }

    content.innerHTML = html;

    // Nav buttons
    const isFirst = _currentWsStep === 0;
    const isLast = _currentWsStep === totalSteps - 1;
    nav.innerHTML = `
        <button class="btn btn-secondary" ${isFirst ? 'disabled' : ''} onclick="prevWorksheetStep()">Back</button>
        ${isLast ? '<button class="btn btn-primary" onclick="finishWorksheet()">Complete</button>' : '<button class="btn btn-primary" onclick="nextWorksheetStep()">Next</button>'}
    `;

    // Attach range slider live update
    content.querySelectorAll('.value-slider').forEach(slider => {
        slider.addEventListener('input', function() {
            this.nextElementSibling.textContent = this.value;
        });
    });
}

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

function renderValueGapChart() {
    const importanceData = (_worksheetData['step_0'] || {}).ratings || {};
    const alignmentData = (_worksheetData['step_1'] || {}).ratings || {};
    const values = WORKSHEETS['values'].steps[0].values;
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

function nextWorksheetStep() {
    const ws = WORKSHEETS[_currentWorksheet];
    if (_currentWsStep < ws.steps.length - 1) {
        _currentWsStep++;
        autoSaveWorksheet();
        renderWorksheetStep();
    }
}
window.nextWorksheetStep = nextWorksheetStep;

function prevWorksheetStep() {
    if (_currentWsStep > 0) {
        _currentWsStep--;
        renderWorksheetStep();
    }
}
window.prevWorksheetStep = prevWorksheetStep;

async function autoSaveWorksheet() {
    if (typeof window.saveWorksheetData === 'function') {
        await window.saveWorksheetData(_currentWorksheet, {
            data: _worksheetData,
            currentStep: _currentWsStep,
            completed: false
        });
    }
}

async function finishWorksheet() {
    if (typeof window.saveWorksheetData === 'function') {
        await window.saveWorksheetData(_currentWorksheet, {
            data: _worksheetData,
            currentStep: _currentWsStep,
            completed: true,
            completedAt: new Date().toISOString()
        });
    }
    showToast('Worksheet completed! Great work! 🎉');
    closeWorksheet();
}
window.finishWorksheet = finishWorksheet;

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
