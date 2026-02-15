import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    onAuthStateChanged,
    signOut,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    collection,
    addDoc,
    query,
    orderBy,
    getDocs,
    deleteDoc,
    serverTimestamp,
    limit
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
    getStorage,
    ref as storageRef,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyCPpKot45iQ98d-ttTjNN-eK3yCrB3N4so",
    authDomain: "one-day-at-a-time-1aa24.firebaseapp.com",
    projectId: "one-day-at-a-time-1aa24",
    storageBucket: "one-day-at-a-time-1aa24.firebasestorage.app",
    messagingSenderId: "175811323890",
    appId: "1:175811323890:web:a25bd2f4352ae67a8bad6b",
    measurementId: "G-DL2TB10RC3"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

let currentUser = null;

// Make currentUser accessible globally
window.getCurrentUser = () => currentUser;

// Utility: escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
window.escapeHtml = escapeHtml;

onAuthStateChanged(auth, (user) => {
    currentUser = user;
    updateUIForAuthState(user);
    if (user) {
        loadUserData();
    }
});

function updateUIForAuthState(user) {
    // Unified nav elements
    const avatarWrapper = document.getElementById('avatarDropdownWrapper');
    const signInBtn = document.getElementById('signInBtn');
    // Content sections
    const cleanTimeSection = document.getElementById('cleanTimeSection');
    const cleanTimePrompt = document.getElementById('cleanTimePrompt');
    const gratitudeFormSection = document.getElementById('gratitudeFormSection');
    const gratitudeSignInPrompt = document.getElementById('gratitudeSignInPrompt');
    const pastEntriesSection = document.getElementById('pastEntriesSection');
    const journalFormSection = document.getElementById('journalFormSection');
    const journalSignInPrompt = document.getElementById('journalSignInPrompt');
    const journalEntriesSection = document.getElementById('journalEntriesSection');
    const welcomeUser = document.getElementById('welcomeUser');
    // Community wall elements
    const wallPostForm = document.getElementById('wallPostForm');
    const wallSignInPrompt = document.getElementById('wallSignInPrompt');
    // Urge log elements
    const urgeFormSection = document.getElementById('urgeFormSection');
    const urgeSignInPrompt = document.getElementById('urgeSignInPrompt');
    const urgeEntriesSection = document.getElementById('urgeEntriesSection');
    const urgeSummary = document.getElementById('urgeSummary');
    // Safety plan elements
    const rppContent = document.getElementById('rppContent');
    const rppSignInPrompt = document.getElementById('rppSignInPrompt');

    if (user) {
        // Show signed-in UI
        avatarWrapper.style.display = 'block';
        signInBtn.style.display = 'none';

        // Set avatar initial and dropdown info
        const initial = (user.displayName || user.email || 'U').charAt(0).toUpperCase();
        document.getElementById('avatarTrigger').textContent = initial;
        document.getElementById('avatarDropdownName').textContent = user.displayName || 'Recovery Friend';
        document.getElementById('avatarDropdownEmail').textContent = user.email || '';

        // Welcome message
        welcomeUser.textContent = `Welcome back, ${user.displayName || 'friend'}!`;

        // Show logged-in content
        cleanTimeSection.style.display = 'block';
        cleanTimePrompt.style.display = 'none';
        gratitudeFormSection.style.display = 'block';
        gratitudeSignInPrompt.style.display = 'none';
        pastEntriesSection.style.display = 'block';
        journalFormSection.style.display = 'block';
        journalSignInPrompt.style.display = 'none';
        journalEntriesSection.style.display = 'block';
        if (wallPostForm) wallPostForm.style.display = 'block';
        if (wallSignInPrompt) wallSignInPrompt.style.display = 'none';
        if (urgeFormSection) urgeFormSection.style.display = 'block';
        if (urgeSignInPrompt) urgeSignInPrompt.style.display = 'none';
        if (urgeEntriesSection) urgeEntriesSection.style.display = 'block';
        if (urgeSummary) urgeSummary.style.display = 'flex';
        if (rppContent) rppContent.style.display = 'block';
        if (rppSignInPrompt) rppSignInPrompt.style.display = 'none';

        // Navigate to appropriate page
        const hash = window.location.hash;
        if (hash.startsWith('#shared?data=')) {
            handleSharedView();
        } else if (hash === '#auth') {
            showPage('home');
        }
    } else {
        // Show signed-out UI
        avatarWrapper.style.display = 'none';
        signInBtn.style.display = 'block';

        // Clear welcome message
        welcomeUser.textContent = '';

        // Show signed-out content
        cleanTimeSection.style.display = 'none';
        cleanTimePrompt.style.display = 'block';
        gratitudeFormSection.style.display = 'none';
        gratitudeSignInPrompt.style.display = 'block';
        pastEntriesSection.style.display = 'none';
        journalFormSection.style.display = 'none';
        journalSignInPrompt.style.display = 'block';
        journalEntriesSection.style.display = 'none';
        if (wallPostForm) wallPostForm.style.display = 'none';
        if (wallSignInPrompt) wallSignInPrompt.style.display = 'block';
        if (urgeFormSection) urgeFormSection.style.display = 'none';
        if (urgeSignInPrompt) urgeSignInPrompt.style.display = 'block';
        if (urgeEntriesSection) urgeEntriesSection.style.display = 'none';
        if (urgeSummary) urgeSummary.style.display = 'none';
        if (rppContent) rppContent.style.display = 'none';
        if (rppSignInPrompt) rppSignInPrompt.style.display = 'block';

        // Handle shared view (allow without auth)
        const hash = window.location.hash;
        if (hash.startsWith('#shared?data=')) {
            handleSharedView();
        }
    }
}

window.signUpWithEmail = async function(e) {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    
    try {
        hideAuthError();
        
        // Execute reCAPTCHA Enterprise verification
        const recaptchaToken = await new Promise((resolve, reject) => {
            grecaptcha.enterprise.ready(async () => {
                try {
                    const token = await grecaptcha.enterprise.execute(
                        '6LfUIVksAAAAAKznNk7dviglWBcLxX_s054Kuw5M', 
                        { action: 'signup' }
                    );
                    resolve(token);
                } catch (err) {
                    reject(err);
                }
            });
        });
        
        if (!recaptchaToken) {
            showAuthError('Security verification failed. Please try again.');
            return;
        }
        
        // Proceed with account creation
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        showToast('Account created! Welcome! 🎉');
        showPage('home');
    } catch (error) {
        if (error.message?.includes('reCAPTCHA') || error.message?.includes('grecaptcha')) {
            showAuthError('Security verification failed. Please refresh and try again.');
        } else {
            showAuthError(getErrorMessage(error.code));
        }
    }
}

window.signInWithEmail = async function(e) {
    e.preventDefault();
    const email = document.getElementById('signinEmail').value;
    const password = document.getElementById('signinPassword').value;
    
    try {
        hideAuthError();
        await signInWithEmailAndPassword(auth, email, password);
        showToast('Welcome back! 🙏');
        showPage('home');
    } catch (error) {
        showAuthError(getErrorMessage(error.code));
    }
}

window.signInWithGoogle = async function() {
    try {
        hideAuthError();
        await signInWithPopup(auth, googleProvider);
        showToast('Welcome! 🙏');
        showPage('home');
    } catch (error) {
        console.error('Google sign-in error:', error.code, error.message);
        showAuthError(getErrorMessage(error.code));
    }
}

window.signOutUser = async function() {
    try {
        await signOut(auth);
        showToast('Signed out. Take care! 💚');
        showPage('home');
    } catch (error) {
        showToast('Error signing out');
    }
}

async function loadUserData() {
    if (!currentUser) return;
    await loadCleanDate();
    await loadGratitudeEntries();
    await loadJournalEntries();
    await loadUrgeEntries();
    await loadSafetyPlan();
    await loadCheckinWidget();
    await loadProfileData();
}

async function loadCleanDate() {
    if (!currentUser) return;
    try {
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().cleanDate) {
            updateCleanTimeDisplay(docSnap.data().cleanDate);
            updateStreakDisplay(docSnap.data().cleanDate);
        } else {
            document.getElementById('cleanTimeDisplay').textContent = 'Set your date →';
        }
    } catch (error) {
        console.error('Error loading clean date:', error);
    }
}

window.saveCleanDate = async function() {
    if (!currentUser) {
        showToast('Please sign in first');
        showPage('auth');
        return;
    }
    const dateInput = document.getElementById('cleanDateInput').value;
    if (!dateInput) {
        showToast('Please select a date');
        return;
    }
    try {
        await setDoc(doc(db, 'users', currentUser.uid), { cleanDate: dateInput }, { merge: true });
        updateCleanTimeDisplay(dateInput);
        updateStreakDisplay(dateInput);
        document.getElementById('cleanDateSetup').classList.remove('show');
        showToast('Sobriety date saved! 🎉');
    } catch (error) {
        showToast('Error saving clean date');
        console.error(error);
    }
}

function updateCleanTimeDisplay(cleanDate) {
    document.getElementById('cleanTimeDisplay').textContent = calculateCleanTime(cleanDate);
}

function calculateCleanTime(cleanDate) {
    const now = new Date();
    const clean = new Date(cleanDate);

    // Use actual calendar math instead of dividing by 30
    let years = now.getFullYear() - clean.getFullYear();
    let months = now.getMonth() - clean.getMonth();
    let days = now.getDate() - clean.getDate();

    // Borrow from months if days are negative
    if (days < 0) {
        months--;
        // Days in the previous month
        const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += prevMonth.getDate();
    }

    // Borrow from years if months are negative
    if (months < 0) {
        years--;
        months += 12;
    }

    if (years > 0) return `${years}y ${months}m ${days}d`;
    if (months > 0) return `${months}m ${days}d`;

    // Total days for short durations
    const totalDays = Math.floor((now - clean) / (1000 * 60 * 60 * 24));
    return `${totalDays} days`;
}

window.toggleCleanDateSetup = function() {
    if (!currentUser) {
        showToast('Please sign in first');
        showPage('auth');
        return;
    }
    document.getElementById('cleanDateSetup').classList.toggle('show');
}

async function loadGratitudeEntries() {
    if (!currentUser) return;
    const container = document.getElementById('entriesGrid');
    
    try {
        const q = query(collection(db, 'users', currentUser.uid, 'gratitude'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            container.innerHTML = '<p style="color: var(--sage-dark); text-align: center; padding: 2rem;">No entries yet. Start by writing what you\'re grateful for today!</p>';
            return;
        }
        
        let html = '';
        querySnapshot.forEach((doc) => {
            const entry = doc.data();
            const date = entry.createdAt?.toDate() || new Date();
            const dateStr = date.toISOString();
            // Store items as escaped JSON for the share function
            const itemsJson = JSON.stringify(entry.items).replace(/'/g, "\\'");
            html += `
                <div class="entry-card">
                    <div class="entry-date">${date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    <ul class="entry-list">${entry.items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
                    <div class="entry-actions">
                        <button class="share-entry-btn" onclick="shareGratitudeEntry('${doc.id}', '${dateStr}')">Share</button>
                        <button class="delete-entry-btn" onclick="deleteGratitudeEntry('${doc.id}')">Delete</button>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    } catch (error) {
        console.error('Error loading gratitude entries:', error);
        container.innerHTML = '<p style="color: var(--terracotta); text-align: center; padding: 2rem;">Error loading entries</p>';
    }
}

window.saveGratitudeEntry = async function(items) {
    if (!currentUser) {
        showToast('Please sign in first');
        showPage('auth');
        return null;
    }
    try {
        // Ensure user document exists first
        const userDocRef = doc(db, 'users', currentUser.uid);
        await setDoc(userDocRef, { lastUpdated: serverTimestamp() }, { merge: true });
        
        // Now add the gratitude entry
        const docRef = await addDoc(collection(db, 'users', currentUser.uid, 'gratitude'), {
            items: items,
            createdAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error('Error saving gratitude:', error);
        throw error;
    }
}

window.deleteGratitudeEntry = async function(entryId) {
    if (!currentUser) return;
    if (confirm('Are you sure you want to delete this entry?')) {
        try {
            await deleteDoc(doc(db, 'users', currentUser.uid, 'gratitude', entryId));
            showToast('Entry deleted');
            loadGratitudeEntries();
        } catch (error) {
            showToast('Error deleting entry');
            console.error(error);
        }
    }
}

window.shareGratitudeEntry = async function(entryId, dateStr) {
    if (!currentUser) return;
    try {
        // Fetch the entry from user's gratitude collection
        const entryRef = doc(db, 'users', currentUser.uid, 'gratitude', entryId);
        const entrySnap = await getDoc(entryRef);
        
        if (!entrySnap.exists()) {
            showToast('Entry not found');
            return;
        }
        
        const entry = entrySnap.data();
        
        // Save to public shared collection
        const sharedRef = await addDoc(collection(db, 'shared'), {
            items: entry.items,
            date: dateStr,
            sharedBy: currentUser.uid,
            sharedAt: serverTimestamp()
        });
        
        // Create short share URL
        const shareUrl = `${window.location.origin}${window.location.pathname}#shared?id=${sharedRef.id}`;
        navigator.clipboard.writeText(shareUrl).then(() => showToast('Share link copied! 📋'));
    } catch (error) {
        showToast('Error creating share link');
        console.error(error);
    }
}

window.createSharedGratitude = async function(items) {
    if (!currentUser) return null;
    try {
        const sharedRef = await addDoc(collection(db, 'shared'), {
            items: items,
            date: new Date().toISOString(),
            sharedBy: currentUser.uid,
            sharedAt: serverTimestamp()
        });
        return sharedRef.id;
    } catch (error) {
        console.error('Error creating shared gratitude:', error);
        throw error;
    }
}

async function loadJournalEntries() {
    if (!currentUser) return;
    const container = document.getElementById('journalEntriesContainer');
    
    try {
        const q = query(collection(db, 'users', currentUser.uid, 'journal'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            container.innerHTML = '<p style="color: var(--sage-dark); text-align: center; padding: 2rem;">No journal entries yet. Start writing!</p>';
            return;
        }
        
        let html = '';
        querySnapshot.forEach((doc) => {
            const entry = doc.data();
            const date = entry.createdAt?.toDate() || new Date();
            html += `
                <div class="journal-entry-card">
                    <div class="journal-entry-header">
                        <div>
                            <h4 class="journal-entry-title">${escapeHtml(entry.title || 'Untitled')}</h4>
                            <div class="journal-entry-date">${date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                        </div>
                        <span class="journal-entry-mood">${entry.mood || ''}</span>
                    </div>
                    <p class="journal-entry-content">${escapeHtml(entry.content)}</p>
                    <div class="entry-actions">
                        <button class="delete-entry-btn" onclick="deleteJournalEntry('${doc.id}')">Delete</button>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    } catch (error) {
        console.error('Error loading journal entries:', error);
        container.innerHTML = '<p style="color: var(--terracotta); text-align: center; padding: 2rem;">Error loading entries</p>';
    }
}

window.saveJournalEntry = async function(title, content, mood) {
    if (!currentUser) {
        showToast('Please sign in first');
        showPage('auth');
        return null;
    }
    try {
        // Ensure user document exists first
        const userDocRef = doc(db, 'users', currentUser.uid);
        await setDoc(userDocRef, { lastUpdated: serverTimestamp() }, { merge: true });
        
        // Now add the journal entry
        const docRef = await addDoc(collection(db, 'users', currentUser.uid, 'journal'), {
            title: title,
            content: content,
            mood: mood,
            createdAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error('Error saving journal:', error);
        throw error;
    }
}

window.deleteJournalEntry = async function(entryId) {
    if (!currentUser) return;
    if (confirm('Are you sure you want to delete this journal entry?')) {
        try {
            await deleteDoc(doc(db, 'users', currentUser.uid, 'journal', entryId));
            showToast('Journal entry deleted');
            loadJournalEntries();
        } catch (error) {
            showToast('Error deleting entry');
            console.error(error);
        }
    }
}

// ========== URGE LOG ==========
window.saveUrgeEntry = async function(intensity, trigger, triggerNote, situation, copedHow, nextTime) {
    if (!currentUser) {
        showToast('Please sign in first');
        showPage('auth');
        return null;
    }
    try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await setDoc(userDocRef, { lastUpdated: serverTimestamp() }, { merge: true });

        const entryData = {
            intensity: intensity,
            trigger: trigger || '',
            createdAt: serverTimestamp()
        };
        if (triggerNote) entryData.triggerNote = triggerNote;
        if (situation) entryData.situation = situation;
        if (copedHow) entryData.copedHow = copedHow;
        if (nextTime) entryData.nextTime = nextTime;

        const docRef = await addDoc(collection(db, 'users', currentUser.uid, 'urges'), entryData);
        return docRef.id;
    } catch (error) {
        console.error('Error saving urge entry:', error);
        throw error;
    }
}

async function loadUrgeEntries() {
    if (!currentUser) return;
    const container = document.getElementById('urgeEntriesContainer');

    try {
        const q = query(collection(db, 'users', currentUser.uid, 'urges'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);

        // Compute summary stats
        let totalCount = 0;
        let intensitySum = 0;
        const triggerCounts = {};

        querySnapshot.forEach(() => totalCount++);

        if (querySnapshot.empty) {
            container.innerHTML = '<p style="color: var(--sage-dark); text-align: center; padding: 2rem;">No urges logged yet. Every wave you ride is a victory.</p>';
            document.getElementById('urgeTotalCount').textContent = '0';
            document.getElementById('urgeAvgIntensity').textContent = '\u2014';
            document.getElementById('urgeTopTrigger').textContent = '\u2014';
            return;
        }

        let html = '';
        querySnapshot.forEach((docSnap) => {
            const entry = docSnap.data();
            const date = entry.createdAt?.toDate() || new Date();
            intensitySum += entry.intensity;
            if (entry.trigger) {
                triggerCounts[entry.trigger] = (triggerCounts[entry.trigger] || 0) + 1;
            }

            // Color tier for badge
            let tier = 'low';
            if (entry.intensity >= 4 && entry.intensity <= 6) tier = 'med';
            else if (entry.intensity >= 7 && entry.intensity <= 8) tier = 'high';
            else if (entry.intensity >= 9) tier = 'max';

            // Build detail row if any optional fields exist
            let detailHtml = '';
            if (entry.triggerNote || entry.situation || entry.copedHow || entry.nextTime) {
                detailHtml = '<div class="urge-entry-details">';
                if (entry.triggerNote) detailHtml += `<p><strong>Trigger detail:</strong> ${escapeHtml(entry.triggerNote)}</p>`;
                if (entry.situation) detailHtml += `<p><strong>Situation:</strong> ${escapeHtml(entry.situation)}</p>`;
                if (entry.copedHow) detailHtml += `<p><strong>How I coped:</strong> ${escapeHtml(entry.copedHow)}</p>`;
                if (entry.nextTime) detailHtml += `<p><strong>Next time:</strong> ${escapeHtml(entry.nextTime)}</p>`;
                detailHtml += '</div>';
            }

            html += `
                <div class="urge-entry-card">
                    <div class="urge-entry-header">
                        <div class="urge-intensity-badge ${tier}">${entry.intensity}</div>
                        <div class="urge-entry-meta">
                            <span class="urge-entry-date">${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                            ${entry.trigger ? `<span class="urge-entry-trigger">${escapeHtml(entry.trigger)}</span>` : ''}
                        </div>
                        <button class="delete-entry-btn" onclick="deleteUrgeEntry('${docSnap.id}')">Delete</button>
                    </div>
                    ${detailHtml}
                </div>
            `;
        });
        container.innerHTML = html;

        // Update summary banner
        document.getElementById('urgeTotalCount').textContent = totalCount;
        document.getElementById('urgeAvgIntensity').textContent = (intensitySum / totalCount).toFixed(1);

        // Find top trigger
        let topTrigger = '\u2014';
        let maxCount = 0;
        for (const [trigger, count] of Object.entries(triggerCounts)) {
            if (count > maxCount) {
                maxCount = count;
                topTrigger = trigger;
            }
        }
        document.getElementById('urgeTopTrigger').textContent = topTrigger;

    } catch (error) {
        console.error('Error loading urge entries:', error);
        container.innerHTML = '<p style="color: var(--terracotta); text-align: center; padding: 2rem;">Error loading entries</p>';
    }
}
window.loadUrgeEntries = loadUrgeEntries;

window.deleteUrgeEntry = async function(entryId) {
    if (!currentUser) return;
    if (confirm('Are you sure you want to delete this urge entry?')) {
        try {
            await deleteDoc(doc(db, 'users', currentUser.uid, 'urges', entryId));
            showToast('Urge entry deleted');
            loadUrgeEntries();
        } catch (error) {
            showToast('Error deleting entry');
            console.error(error);
        }
    }
}

function getErrorMessage(code) {
    switch (code) {
        case 'auth/email-already-in-use': return 'This email is already registered. Try signing in.';
        case 'auth/invalid-email': return 'Please enter a valid email address.';
        case 'auth/weak-password': return 'Password should be at least 6 characters.';
        case 'auth/user-not-found': return 'No account found with this email.';
        case 'auth/wrong-password': return 'Incorrect password. Please try again.';
        case 'auth/invalid-credential': return 'Invalid email or password.';
        case 'auth/popup-closed-by-user': return 'Sign-in popup was closed. Please try again.';
        case 'auth/unauthorized-domain': return 'This domain is not authorized for sign-in. Please contact support.';
        case 'auth/popup-blocked': return 'Sign-in popup was blocked. Please allow popups for this site.';
        case 'auth/cancelled-popup-request': return 'Sign-in was cancelled. Please try again.';
        case 'auth/network-request-failed': return 'Network error. Please check your connection and try again.';
        default: return 'An error occurred. Please try again.';
    }
}

function showAuthError(message) {
    const errorEl = document.getElementById('authError');
    errorEl.textContent = message;
    errorEl.classList.add('show');
}

function hideAuthError() {
    document.getElementById('authError').classList.remove('show');
}

// Function to load shared gratitude by ID (needs Firestore access)
window.loadSharedGratitude = async function(shareId) {
    try {
        const sharedRef = doc(db, 'shared', shareId);
        const sharedSnap = await getDoc(sharedRef);
        
        if (!sharedSnap.exists()) {
            return null;
        }
        
        return sharedSnap.data();
    } catch (error) {
        console.error('Error loading shared gratitude:', error);
        throw error;
    }
}

window.loadGratitudeEntries = loadGratitudeEntries;
window.loadJournalEntries = loadJournalEntries;

// ========== STREAK & MILESTONE SYSTEM ==========
const MILESTONES = [
    { days: 1, icon: '🌱', label: '1 Day' },
    { days: 7, icon: '🌿', label: '1 Week' },
    { days: 30, icon: '🌳', label: '30 Days' },
    { days: 60, icon: '🔥', label: '60 Days' },
    { days: 90, icon: '💎', label: '90 Days' },
    { days: 180, icon: '🌟', label: '6 Months' },
    { days: 365, icon: '👑', label: '1 Year' },
    { days: 730, icon: '🏆', label: '2 Years' },
    { days: 1825, icon: '🎖️', label: '5 Years' },
];

function updateStreakDisplay(cleanDate) {
    const container = document.getElementById('streakContainer');
    if (!cleanDate) { container.style.display = 'none'; return; }
    container.style.display = 'block';
    const days = Math.floor((new Date() - new Date(cleanDate)) / (1000*60*60*24));
    document.getElementById('streakDays').textContent = days;
    const badgesContainer = document.getElementById('streakBadges');
    badgesContainer.innerHTML = '';
    MILESTONES.forEach(m => {
        const earned = days >= m.days;
        const badge = document.createElement('div');
        badge.className = `milestone-badge ${earned ? 'earned' : 'unearned'}`;
        badge.innerHTML = `<span>${m.icon}</span><span class="badge-label">${m.label}</span>`;
        badgesContainer.appendChild(badge);
    });
    checkAndCelebrateMilestone(days);
}
window.updateStreakDisplay = updateStreakDisplay;

async function checkAndCelebrateMilestone(days) {
    if (!currentUser) return;
    const milestone = MILESTONES.find(m => m.days === days);
    if (!milestone) return;
    try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        const lastCelebrated = userDoc.data()?.lastCelebratedMilestone || 0;
        if (days > lastCelebrated) {
            await setDoc(doc(db, 'users', currentUser.uid), { lastCelebratedMilestone: days }, { merge: true });
            triggerConfetti();
            showToast(`Milestone reached: ${milestone.label}! ${milestone.icon}`);
        }
    } catch (e) { console.error('Milestone check error:', e); }
}

function triggerConfetti() {
    const canvas = document.createElement('canvas');
    canvas.className = 'confetti-canvas';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = [];
    const colors = ['#C67B5C','#8FA68A','#D4A853','#A65D45','#E8A889','#6B8B66'];
    for (let i = 0; i < 150; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            w: Math.random() * 10 + 5,
            h: Math.random() * 6 + 3,
            color: colors[Math.floor(Math.random() * colors.length)],
            vx: (Math.random() - 0.5) * 4,
            vy: Math.random() * 3 + 2,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 10,
        });
    }
    let frame = 0;
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.x += p.vx; p.y += p.vy; p.rotation += p.rotationSpeed; p.vy += 0.05;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation * Math.PI / 180);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
            ctx.restore();
        });
        frame++;
        if (frame < 180) requestAnimationFrame(animate);
        else canvas.remove();
    }
    animate();
}
window.triggerConfetti = triggerConfetti;

// ========== DAILY CHECK-IN ==========
let selectedCheckinMood = null;

window.selectCheckinMood = function(btn) {
    document.querySelectorAll('.checkin-mood-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedCheckinMood = { mood: btn.dataset.mood, emoji: btn.dataset.emoji };
    document.getElementById('checkinSubmitBtn').disabled = false;
};

window.submitCheckin = async function() {
    if (!currentUser || !selectedCheckinMood) return;
    const note = document.getElementById('checkinNote').value.trim();
    const today = new Date().toISOString().split('T')[0];
    try {
        await setDoc(doc(db, 'users', currentUser.uid, 'checkins', today), {
            mood: selectedCheckinMood.mood,
            emoji: selectedCheckinMood.emoji,
            note: note,
            date: today,
            createdAt: serverTimestamp()
        });
        showToast('Check-in saved! ' + selectedCheckinMood.emoji);
        showCheckinComplete(selectedCheckinMood.emoji);
        loadMoodTimeline();
    } catch (error) {
        console.error('Error saving check-in:', error);
        showToast('Error saving check-in');
    }
};

function showCheckinComplete(emoji) {
    document.getElementById('checkinForm').style.display = 'none';
    document.getElementById('checkinAlready').style.display = 'block';
    document.getElementById('checkinTodayMood').textContent = emoji;
}

async function loadCheckinWidget() {
    if (!currentUser) return;
    const widget = document.getElementById('checkinWidget');
    widget.style.display = 'block';
    const today = new Date().toISOString().split('T')[0];
    try {
        const todayDoc = await getDoc(doc(db, 'users', currentUser.uid, 'checkins', today));
        if (todayDoc.exists()) {
            showCheckinComplete(todayDoc.data().emoji);
        } else {
            document.getElementById('checkinForm').style.display = 'block';
            document.getElementById('checkinAlready').style.display = 'none';
        }
    } catch (e) { console.error('Error loading check-in:', e); }
    loadMoodTimeline();
}
window.loadCheckinWidget = loadCheckinWidget;

async function loadMoodTimeline() {
    if (!currentUser) return;
    const container = document.getElementById('moodTimeline');
    container.innerHTML = '';
    const days = [];
    for (let i = 13; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(d.toISOString().split('T')[0]);
    }
    try {
        const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
        for (const dateStr of days) {
            const checkinDoc = await getDoc(doc(db, 'users', currentUser.uid, 'checkins', dateStr));
            const d = new Date(dateStr + 'T00:00:00');
            const isToday = dateStr === new Date().toISOString().split('T')[0];
            const dayEl = document.createElement('div');
            dayEl.className = 'mood-day';
            dayEl.innerHTML = `
                <div class="mood-day-emoji ${isToday ? 'today' : ''}">${checkinDoc.exists() ? checkinDoc.data().emoji : '·'}</div>
                <span class="mood-day-label">${dayNames[d.getDay()]}</span>
            `;
            container.appendChild(dayEl);
        }
    } catch (e) { console.error('Error loading mood timeline:', e); }
}

// ========== COMMUNITY WALL ==========
async function loadCommunityWall() {
    const feedContainer = document.getElementById('wallFeed');
    try {
        const q = query(collection(db, 'communityWall'), orderBy('createdAt', 'desc'), limit(50));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            feedContainer.innerHTML = '<p style="color: var(--sage-dark); text-align: center; padding: 2rem; column-span: all;">Be the first to share a word of encouragement!</p>';
            return;
        }
        let html = '';
        snapshot.forEach(d => {
            const data = d.data();
            const date = data.createdAt?.toDate();
            const timeAgo = date ? getTimeAgo(date) : '';
            html += `
                <div class="wall-message">
                    <p class="wall-message-text">${escapeHtml(data.message)}</p>
                    <div class="wall-message-footer">
                        <span>${timeAgo}</span>
                        <span class="wall-message-mood">${data.mood || ''}</span>
                    </div>
                </div>
            `;
        });
        feedContainer.innerHTML = html;
    } catch (error) {
        console.error('Error loading community wall:', error);
        feedContainer.innerHTML = '<p style="color: var(--terracotta); text-align: center;">Error loading messages</p>';
    }
}
window.loadCommunityWall = loadCommunityWall;

window.submitWallPost = async function() {
    if (!currentUser) { showPage('auth'); return; }
    const input = document.getElementById('wallPostInput');
    const message = input.value.trim();
    if (!message || message.length > 280) return;
    try {
        await addDoc(collection(db, 'communityWall'), {
            message: message,
            mood: window._selectedWallMood || '',
            createdAt: serverTimestamp()
        });
        input.value = '';
        document.querySelectorAll('.wall-mood-btn').forEach(b => b.classList.remove('selected'));
        window._selectedWallMood = '';
        document.getElementById('wallCharCount').textContent = '0/280';
        showToast('Message shared! Thank you for the encouragement 💚');
        loadCommunityWall();
    } catch (error) {
        console.error('Error posting to wall:', error);
        showToast('Error sharing message');
    }
};

function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return minutes + 'm ago';
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return hours + 'h ago';
    const d = Math.floor(hours / 24);
    if (d < 7) return d + 'd ago';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
window.getTimeAgo = getTimeAgo;

// ========== SAFETY PLAN ==========
const RPP_SECTIONS = ['warningSigns', 'triggers', 'copingStrategies', 'supportNetwork', 'safePlaces', 'emergencySteps', 'reasonsToStay'];
let rppData = {};
let rppEditDrafts = {};

// Bridge so app.js can read/write rppData across module boundary
Object.defineProperty(window, 'rppData', {
    get() { return rppData; },
    set(val) { rppData = val; }
});

async function loadSafetyPlan() {
    if (!currentUser) return;
    try {
        const planRef = doc(db, 'users', currentUser.uid, 'safetyPlan', 'main');
        const planSnap = await getDoc(planRef);
        if (planSnap.exists()) {
            rppData = planSnap.data();
            renderAllRppSections();
            if (rppData.lastUpdated) {
                const date = rppData.lastUpdated.toDate();
                document.getElementById('rppLastUpdated').textContent =
                    'Last updated ' + date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
            }
        } else {
            rppData = {};
            renderAllRppSections();
            document.getElementById('rppLastUpdated').textContent = '';
        }
        // Update view state (intro vs completed plan)
        if (typeof window.updateSafetyPlanViewState === 'function') {
            window.updateSafetyPlanViewState();
        }
    } catch (error) {
        console.error('Error loading safety plan:', error);
    }
}
window.loadSafetyPlan = loadSafetyPlan;

function renderAllRppSections() {
    RPP_SECTIONS.forEach(key => renderRppSection(key));
}

function renderRppSection(sectionKey) {
    const display = document.getElementById('rppDisplay_' + sectionKey);
    if (!display) return;
    const items = rppData[sectionKey] || [];

    if (items.length === 0) {
        display.innerHTML = '<p class="rpp-empty-prompt">' + getEmptyPrompt(sectionKey) + '</p>';
        return;
    }

    let html = '';
    if (sectionKey === 'supportNetwork') {
        html = '<ul class="rpp-display-list rpp-contact-list">';
        items.forEach(contact => {
            html += `<li class="rpp-contact-item">
                <span class="rpp-contact-name">${escapeHtml(contact.name)}</span>
                ${contact.phone ? `<a href="tel:${escapeHtml(contact.phone)}" class="rpp-contact-phone">${escapeHtml(contact.phone)}</a>` : ''}
            </li>`;
        });
        html += '</ul>';
    } else if (sectionKey === 'emergencySteps') {
        html = '<ol class="rpp-display-list rpp-numbered-list">';
        items.forEach(item => {
            html += `<li>${escapeHtml(item)}</li>`;
        });
        html += '</ol>';
    } else {
        html = '<ul class="rpp-display-list">';
        items.forEach(item => {
            html += `<li>${escapeHtml(item)}</li>`;
        });
        html += '</ul>';
    }
    display.innerHTML = html;
}

function getEmptyPrompt(sectionKey) {
    const prompts = {
        warningSigns: 'What are your personal red flags? Things like isolating from friends, skipping meetings, romanticizing past use, or neglecting self-care.',
        triggers: 'What triggers you? Old neighborhoods, certain people, paydays, loneliness, anger, celebrations \u2014 knowing your triggers is power.',
        copingStrategies: 'What helps you get through? Call your sponsor, go to a meeting, exercise, breathe, pray, take a walk, play the tape forward.',
        supportNetwork: 'Who can you call? Your sponsor, therapist, trusted friends, family members. Add their name and phone number so they\'re one tap away.',
        safePlaces: 'Where can you go? Your home group meeting hall, a trusted friend\'s house, the gym, a place of worship \u2014 somewhere you feel grounded.',
        emergencySteps: 'What do you do first? Step 1: Call your sponsor. Step 2: Get to a meeting. Step 3: Use the wellness toolkit. Write your plan so you don\'t have to think \u2014 just follow the steps.',
        reasonsToStay: 'What keeps you going? Your children, your health, your goals, the life you\'re building. Write them down so you can read them when it\'s hard to remember.',
    };
    return prompts[sectionKey] || '';
}

window.toggleRppEdit = function(sectionKey) {
    const displayEl = document.getElementById('rppDisplay_' + sectionKey);
    const editEl = document.getElementById('rppEdit_' + sectionKey);
    const isEditing = editEl.style.display !== 'none';

    if (isEditing) {
        cancelRppEdit(sectionKey);
    } else {
        displayEl.style.display = 'none';
        editEl.style.display = 'block';
        populateRppEditList(sectionKey);
        const input = document.getElementById('rppInput_' + sectionKey) ||
                      document.getElementById('rppInput_' + sectionKey + '_name');
        if (input) input.focus();
    }
};

window.cancelRppEdit = function(sectionKey) {
    document.getElementById('rppDisplay_' + sectionKey).style.display = 'block';
    document.getElementById('rppEdit_' + sectionKey).style.display = 'none';
    rppEditDrafts[sectionKey] = null;
};
function cancelRppEdit(sectionKey) { window.cancelRppEdit(sectionKey); }

function populateRppEditList(sectionKey) {
    const items = rppData[sectionKey] ? JSON.parse(JSON.stringify(rppData[sectionKey])) : [];
    rppEditDrafts[sectionKey] = items;
    renderRppEditList(sectionKey);
}

function renderRppEditList(sectionKey) {
    const container = document.getElementById('rppEditList_' + sectionKey);
    const items = rppEditDrafts[sectionKey] || [];

    if (items.length === 0) {
        container.innerHTML = '<p class="rpp-edit-empty">No items yet. Add one below.</p>';
        return;
    }

    let html = '';
    if (sectionKey === 'supportNetwork') {
        items.forEach((contact, i) => {
            html += `<div class="rpp-edit-item rpp-edit-contact">
                <span class="rpp-edit-item-text">${escapeHtml(contact.name)}${contact.phone ? ' \u2014 ' + escapeHtml(contact.phone) : ''}</span>
                <button class="rpp-remove-btn" onclick="removeRppItem('${sectionKey}', ${i})" title="Remove">&times;</button>
            </div>`;
        });
    } else if (sectionKey === 'emergencySteps') {
        items.forEach((item, i) => {
            html += `<div class="rpp-edit-item rpp-edit-step">
                <span class="rpp-step-number">${i + 1}</span>
                <span class="rpp-edit-item-text">${escapeHtml(item)}</span>
                <div class="rpp-reorder-btns">
                    ${i > 0 ? `<button class="rpp-move-btn" onclick="moveRppItem('${sectionKey}', ${i}, -1)" title="Move up">&uarr;</button>` : ''}
                    ${i < items.length - 1 ? `<button class="rpp-move-btn" onclick="moveRppItem('${sectionKey}', ${i}, 1)" title="Move down">&darr;</button>` : ''}
                </div>
                <button class="rpp-remove-btn" onclick="removeRppItem('${sectionKey}', ${i})" title="Remove">&times;</button>
            </div>`;
        });
    } else {
        items.forEach((item, i) => {
            html += `<div class="rpp-edit-item">
                <span class="rpp-edit-item-text">${escapeHtml(item)}</span>
                <button class="rpp-remove-btn" onclick="removeRppItem('${sectionKey}', ${i})" title="Remove">&times;</button>
            </div>`;
        });
    }
    container.innerHTML = html;
}

window.addRppItem = function(sectionKey) {
    const input = document.getElementById('rppInput_' + sectionKey);
    const value = input.value.trim();
    if (!value) return;
    if (!rppEditDrafts[sectionKey]) rppEditDrafts[sectionKey] = [];
    rppEditDrafts[sectionKey].push(value);
    input.value = '';
    renderRppEditList(sectionKey);
    input.focus();
};

window.addRppContact = function() {
    const nameInput = document.getElementById('rppInput_supportNetwork_name');
    const phoneInput = document.getElementById('rppInput_supportNetwork_phone');
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    if (!name) return;
    if (!rppEditDrafts.supportNetwork) rppEditDrafts.supportNetwork = [];
    rppEditDrafts.supportNetwork.push({ name, phone: phone || '' });
    nameInput.value = '';
    phoneInput.value = '';
    renderRppEditList('supportNetwork');
    nameInput.focus();
};

window.removeRppItem = function(sectionKey, index) {
    if (!rppEditDrafts[sectionKey]) return;
    rppEditDrafts[sectionKey].splice(index, 1);
    renderRppEditList(sectionKey);
};

window.moveRppItem = function(sectionKey, index, direction) {
    const items = rppEditDrafts[sectionKey];
    if (!items) return;
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= items.length) return;
    [items[index], items[newIndex]] = [items[newIndex], items[index]];
    renderRppEditList(sectionKey);
};

window.saveRppSection = async function(sectionKey) {
    if (!currentUser) {
        showToast('Please sign in first');
        showPage('auth');
        return;
    }
    const items = rppEditDrafts[sectionKey] || [];
    try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await setDoc(userDocRef, { lastUpdated: serverTimestamp() }, { merge: true });

        const planRef = doc(db, 'users', currentUser.uid, 'safetyPlan', 'main');
        const updateData = {
            [sectionKey]: items,
            lastUpdated: serverTimestamp()
        };
        await setDoc(planRef, updateData, { merge: true });

        rppData[sectionKey] = items;

        document.getElementById('rppLastUpdated').textContent =
            'Last updated ' + new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

        document.getElementById('rppDisplay_' + sectionKey).style.display = 'block';
        document.getElementById('rppEdit_' + sectionKey).style.display = 'none';
        renderRppSection(sectionKey);

        showToast('Safety plan updated \uD83D\uDEE1\uFE0F');
    } catch (error) {
        console.error('Error saving safety plan section:', error);
        showToast('Error saving \u2014 please try again');
    }
};

// Handle Enter key on RPP add inputs
document.addEventListener('keydown', function(e) {
    if (e.key !== 'Enter') return;
    const target = e.target;
    if (!target.classList.contains('rpp-add-input')) return;
    e.preventDefault();
    const id = target.id;
    if (id === 'rppInput_supportNetwork_name' || id === 'rppInput_supportNetwork_phone') {
        window.addRppContact();
    } else {
        const sectionKey = id.replace('rppInput_', '');
        window.addRppItem(sectionKey);
    }
});

// Save entire safety plan at once (from guided journey)
async function saveSafetyPlanFull(data) {
    if (!currentUser) return;
    try {
        const planRef = doc(db, 'users', currentUser.uid, 'safetyPlan', 'main');
        const saveObj = { lastUpdated: serverTimestamp() };
        RPP_SECTIONS.forEach(key => {
            saveObj[key] = data[key] || [];
        });
        await setDoc(planRef, saveObj, { merge: true });

        // Reload to update cache and re-render sections
        await loadSafetyPlan();
        showToast('Safety plan saved \uD83D\uDEE1\uFE0F');
    } catch (error) {
        console.error('Error saving full safety plan:', error);
        showToast('Error saving \u2014 please try again');
    }
}
window.saveSafetyPlanFull = saveSafetyPlanFull;

// ========== MY PROFILE ==========

async function loadProfileData() {
    if (!currentUser) return;
    try {
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) return;
        const data = docSnap.data();

        // Populate personal info fields
        const nameInput = document.getElementById('profilePreferredName');
        if (nameInput) nameInput.value = data.preferredName || '';

        const pronounsSelect = document.getElementById('profilePronouns');
        const pronounsCustom = document.getElementById('profilePronounsCustom');
        if (pronounsSelect) {
            const val = data.pronouns || '';
            if (['', 'he/him', 'she/her', 'they/them'].includes(val)) {
                pronounsSelect.value = val;
                if (pronounsCustom) pronounsCustom.classList.add('hidden');
            } else {
                pronounsSelect.value = 'custom';
                if (pronounsCustom) {
                    pronounsCustom.classList.remove('hidden');
                    pronounsCustom.value = val;
                }
            }
        }

        const fellowshipSelect = document.getElementById('profileFellowship');
        if (fellowshipSelect) fellowshipSelect.value = data.fellowship || '';

        const mantraInput = document.getElementById('profileMantra');
        if (mantraInput) {
            mantraInput.value = data.mantra || '';
            const countEl = document.getElementById('profileMantraCount');
            if (countEl) countEl.textContent = (data.mantra || '').length;
        }

        // Avatar state
        window._profileAvatarType = data.avatarType || 'initial';
        window._profileAvatarColor = data.avatarColor || '';
        window._profileAvatarIcon = data.avatarIcon || '';
        window._profileAvatarUrl = data.avatarUrl || '';

        if (typeof window.renderProfileAvatar === 'function') {
            window.renderProfileAvatar();
        }

        // Community toggles
        const opts = data.communityOptIn || {};
        const pm = document.getElementById('profilePublicMilestones');
        if (pm) pm.checked = opts.publicMilestones || false;
        const op = document.getElementById('profileOpenToPartner');
        if (op) op.checked = opts.openToPartner || false;
        const sg = document.getElementById('profileSharedGratitude');
        if (sg) sg.checked = opts.sharedGratitudeFeed || false;

        // Update nav avatar
        updateNavAvatar(data);
    } catch (error) {
        console.error('Error loading profile data:', error);
    }
}
window.loadProfileData = loadProfileData;

async function saveProfile() {
    if (!currentUser) {
        showToast('Please sign in first');
        showPage('auth');
        return;
    }

    const saveBtn = document.getElementById('profileSaveBtn');
    const statusEl = document.getElementById('profileSaveStatus');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';

    try {
        let pronouns = document.getElementById('profilePronouns').value;
        if (pronouns === 'custom') {
            pronouns = (document.getElementById('profilePronounsCustom').value || '').trim();
        }

        const profileData = {
            preferredName: (document.getElementById('profilePreferredName').value || '').trim(),
            pronouns: pronouns,
            fellowship: document.getElementById('profileFellowship').value || '',
            mantra: (document.getElementById('profileMantra').value || '').trim().substring(0, 200),
            avatarType: window._profileAvatarType || 'initial',
            avatarColor: window._profileAvatarColor || '',
            avatarIcon: window._profileAvatarIcon || '',
            avatarUrl: window._profileAvatarUrl || '',
            communityOptIn: {
                publicMilestones: document.getElementById('profilePublicMilestones')?.checked || false,
                openToPartner: document.getElementById('profileOpenToPartner')?.checked || false,
                sharedGratitudeFeed: document.getElementById('profileSharedGratitude')?.checked || false,
            },
            lastProfileUpdate: serverTimestamp()
        };

        await setDoc(doc(db, 'users', currentUser.uid), profileData, { merge: true });

        updateNavAvatar(profileData);

        const welcomeEl = document.getElementById('welcomeUser');
        if (welcomeEl) {
            welcomeEl.textContent = `Welcome back, ${profileData.preferredName || currentUser.displayName || 'friend'}!`;
        }

        statusEl.textContent = 'Profile saved!';
        showToast('Profile updated!');
        setTimeout(() => { statusEl.textContent = ''; }, 3000);
    } catch (error) {
        console.error('Error saving profile:', error);
        showToast('Error saving profile');
        statusEl.textContent = '';
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Changes';
    }
}
window.saveProfile = saveProfile;

async function uploadProfilePhoto(blob) {
    if (!currentUser) return null;
    if (blob.size > 2 * 1024 * 1024) {
        showToast('Photo must be under 2MB');
        return null;
    }
    try {
        const photoRef = storageRef(storage, `avatars/${currentUser.uid}/profile.jpg`);
        await uploadBytes(photoRef, blob, { contentType: 'image/jpeg' });
        const url = await getDownloadURL(photoRef);
        return url;
    } catch (error) {
        console.error('Error uploading photo:', error);
        showToast('Error uploading photo');
        return null;
    }
}
window.uploadProfilePhoto = uploadProfilePhoto;

function updateNavAvatar(data) {
    const trigger = document.getElementById('avatarTrigger');
    if (!trigger) return;

    trigger.textContent = '';
    trigger.style.backgroundImage = '';
    trigger.style.backgroundSize = '';
    trigger.style.backgroundPosition = '';
    trigger.innerHTML = '';

    const type = data.avatarType || 'initial';

    if (type === 'photo' && data.avatarUrl) {
        trigger.style.backgroundImage = `url(${data.avatarUrl})`;
        trigger.style.backgroundSize = 'cover';
        trigger.style.backgroundPosition = 'center';
    } else if (type === 'icon' && data.avatarIcon && window.AVATAR_ICONS) {
        const iconSvg = window.AVATAR_ICONS[data.avatarIcon] || '';
        if (iconSvg) {
            trigger.innerHTML = iconSvg;
            const svgEl = trigger.querySelector('svg');
            if (svgEl) {
                svgEl.style.width = '20px';
                svgEl.style.height = '20px';
                svgEl.setAttribute('stroke', 'white');
            }
        }
        trigger.style.background = data.avatarColor || 'linear-gradient(135deg, var(--terracotta), var(--rust))';
    } else {
        const initial = (data.preferredName || currentUser?.displayName || currentUser?.email || 'U').charAt(0).toUpperCase();
        trigger.textContent = initial;
        if (data.avatarColor) {
            trigger.style.background = data.avatarColor;
        }
    }

    const nameEl = document.getElementById('avatarDropdownName');
    if (nameEl) {
        nameEl.textContent = data.preferredName || currentUser?.displayName || 'Recovery Friend';
    }
}
window.updateNavAvatar = updateNavAvatar;
