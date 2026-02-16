// Parent mapping for dropdown nav highlighting
const NAV_PARENT_MAP = {
    'jft': true,
    'daily-reflections': true,
    'thought-for-the-day': true,
    'gratitude': true,
    'journal': true,
    'urges': true,
    'safety-plan': true,
    'events': true,
    'community': true,
};

// Pages that require authentication — guests are redirected to auth
const AUTH_GATED_PAGES = new Set(['gratitude', 'journal', 'urges', 'safety-plan', 'profile', 'public-profile']);

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

    if (pageId !== 'shared') window.location.hash = pageId;
    window.scrollTo(0, 0);

    // Page-specific callbacks
    if (pageId === 'community') {
        // Ensure sidebar is open when landing on community page
        const sidebar = document.getElementById('communitySidebar');
        if (sidebar) sidebar.classList.add('open');
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
let _activeCommunityTab = 'milestones';

function toggleCommunityDrawer() {
    const sidebar = document.getElementById('communitySidebar');
    if (!sidebar) return;
    sidebar.classList.toggle('open');
}
window.toggleCommunityDrawer = toggleCommunityDrawer;

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
        'gratitude': 'communityTabGratitude'
    };

    const target = document.getElementById(tabMap[tabName]);
    if (target) target.classList.add('active');

    // On mobile, close sidebar after selecting a tab
    if (window.innerWidth < 768) {
        const sidebar = document.getElementById('communitySidebar');
        if (sidebar) sidebar.classList.remove('open');
    }

    // Lazy-load data for selected tab
    if (tabName === 'milestones' && window.loadMilestoneFeed) {
        window.loadMilestoneFeed();
    } else if (tabName === 'support' && window.loadCommunityWall) {
        window.loadCommunityWall();
    } else if (tabName === 'medallion' && window.loadMedallionFeed) {
        window.loadMedallionFeed();
    } else if (tabName === 'gratitude' && window.loadSharedGratitudeFeed) {
        window.loadSharedGratitudeFeed();
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
        // Save to user's gratitude collection
        await window.saveGratitudeEntry(items);
        
        // Also save to shared collection for short link
        const sharedRef = await window.createSharedGratitude(items);
        const shareUrl = `${window.location.origin}${window.location.pathname}#shared?id=${sharedRef}`;
        document.getElementById('shareLink').value = shareUrl;
        document.getElementById('shareSection').style.display = 'block';
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

// Handle hash changes
window.addEventListener('hashchange', () => {
    const hash = window.location.hash;
    if (hash.startsWith('#shared?id=') || hash.startsWith('#shared?data=')) {
        handleSharedView();
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
    const walkthroughBtn = document.getElementById('rppWalkthroughAgain');
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
        if (walkthroughBtn) walkthroughBtn.style.display = 'flex';
        if (lastUpdated) lastUpdated.style.display = '';
    } else {
        // Show intro card (first-time user)
        if (introCard) introCard.style.display = '';
        if (sectionsWrapper) sectionsWrapper.style.display = 'none';
        if (walkthroughBtn) walkthroughBtn.style.display = 'none';
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
    // If own UID, go to profile settings
    const me = window.getCurrentUser();
    if (me && me.uid === uid) {
        showPage('profile');
        return;
    }
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
