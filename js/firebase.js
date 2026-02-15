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
    limit,
    updateDoc,
    increment,
    where,
    arrayUnion,
    arrayRemove
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
    const myJourneyDropdown = document.getElementById('myJourneyDropdown');
    // Home page sections
    const homeGuestShowcase = document.getElementById('homeGuestShowcase');
    const homeAuthContent = document.getElementById('homeAuthContent');
    const cleanTimeSection = document.getElementById('cleanTimeSection');
    const heroCta = document.getElementById('heroCta');
    const welcomeUser = document.getElementById('welcomeUser');
    // Content sections (auth-gated pages)
    const gratitudeFormSection = document.getElementById('gratitudeFormSection');
    const pastEntriesSection = document.getElementById('pastEntriesSection');
    const journalFormSection = document.getElementById('journalFormSection');
    const journalEntriesSection = document.getElementById('journalEntriesSection');
    // Community wall elements
    const wallPostForm = document.getElementById('wallPostForm');
    const wallSignInPrompt = document.getElementById('wallSignInPrompt');
    // Urge log elements
    const urgeFormSection = document.getElementById('urgeFormSection');
    const urgeEntriesSection = document.getElementById('urgeEntriesSection');
    const urgeSummary = document.getElementById('urgeSummary');
    // Safety plan elements
    const rppContent = document.getElementById('rppContent');

    if (user) {
        // Show signed-in UI
        avatarWrapper.style.display = 'block';
        signInBtn.style.display = 'none';
        if (myJourneyDropdown) myJourneyDropdown.style.display = '';

        // Set avatar initial and dropdown info
        const initial = (user.displayName || user.email || 'U').charAt(0).toUpperCase();
        document.getElementById('avatarTrigger').textContent = initial;
        document.getElementById('avatarDropdownName').textContent = user.displayName || 'Recovery Friend';
        document.getElementById('avatarDropdownEmail').textContent = user.email || '';

        // Welcome message — prefer stored preferred name, fall back to displayName
        const preferredName = localStorage.getItem('preferredName') || user.displayName || 'friend';
        welcomeUser.textContent = `Welcome back, ${preferredName}!`;

        // Home page: show auth content, hide guest showcase
        if (homeAuthContent) homeAuthContent.style.display = 'block';
        if (homeGuestShowcase) homeGuestShowcase.style.display = 'none';
        if (heroCta) heroCta.style.display = '';
        cleanTimeSection.style.display = 'block';

        // Show logged-in content on auth-gated pages
        gratitudeFormSection.style.display = 'block';
        pastEntriesSection.style.display = 'block';
        journalFormSection.style.display = 'block';
        journalEntriesSection.style.display = 'block';
        if (wallPostForm) wallPostForm.style.display = 'block';
        if (wallSignInPrompt) wallSignInPrompt.style.display = 'none';
        const medallionInviteForm = document.getElementById('medallionInviteForm');
        const medallionSignInPrompt = document.getElementById('medallionSignInPrompt');
        if (medallionInviteForm) medallionInviteForm.style.display = 'block';
        if (medallionSignInPrompt) medallionSignInPrompt.style.display = 'none';
        if (urgeFormSection) urgeFormSection.style.display = 'block';
        if (urgeEntriesSection) urgeEntriesSection.style.display = 'block';
        if (urgeSummary) urgeSummary.style.display = 'flex';
        if (rppContent) rppContent.style.display = 'block';

        // Navigate to appropriate page
        const hash = window.location.hash;
        if (hash.startsWith('#shared?data=')) {
            handleSharedView();
        } else if (hash === '#auth') {
            showPage('home');
        }

        // Check for What's New panel
        if (window.checkWhatsNew) window.checkWhatsNew();
    } else {
        // Show signed-out UI
        avatarWrapper.style.display = 'none';
        signInBtn.style.display = 'block';
        if (myJourneyDropdown) myJourneyDropdown.style.display = 'none';

        // Clear welcome message
        welcomeUser.textContent = '';

        // Home page: show guest showcase, hide auth content
        if (homeAuthContent) homeAuthContent.style.display = 'none';
        if (homeGuestShowcase) homeGuestShowcase.style.display = 'block';
        if (heroCta) heroCta.style.display = 'none';
        cleanTimeSection.style.display = 'none';

        // Hide logged-in content on auth-gated pages
        gratitudeFormSection.style.display = 'none';
        pastEntriesSection.style.display = 'none';
        journalFormSection.style.display = 'none';
        journalEntriesSection.style.display = 'none';
        if (wallPostForm) wallPostForm.style.display = 'none';
        if (wallSignInPrompt) wallSignInPrompt.style.display = 'block';
        const medallionInviteFormOut = document.getElementById('medallionInviteForm');
        const medallionSignInPromptOut = document.getElementById('medallionSignInPrompt');
        if (medallionInviteFormOut) medallionInviteFormOut.style.display = 'none';
        if (medallionSignInPromptOut) medallionSignInPromptOut.style.display = 'block';
        if (urgeFormSection) urgeFormSection.style.display = 'none';
        if (urgeEntriesSection) urgeEntriesSection.style.display = 'none';
        if (urgeSummary) urgeSummary.style.display = 'none';
        if (rppContent) rppContent.style.display = 'none';

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
        localStorage.removeItem('preferredName');
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
window.MILESTONES = MILESTONES;

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
            postMilestoneToCommunity(milestone);
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

// ========== COMMUNITY HUB ==========

// Shared avatar renderer for community cards
function renderCommunityAvatar(data) {
    const type = data.avatarType || 'initial';
    if (type === 'photo' && data.avatarUrl) {
        return `<div class="community-avatar" style="background-image: url(${data.avatarUrl}); background-size: cover; background-position: center;"></div>`;
    } else if (type === 'icon' && data.avatarIcon && window.AVATAR_ICONS) {
        const iconSvg = window.AVATAR_ICONS[data.avatarIcon] || '';
        return `<div class="community-avatar" style="background: ${data.avatarColor || 'linear-gradient(135deg, var(--terracotta), var(--rust))'}">${iconSvg}</div>`;
    } else {
        const initial = (data.preferredName || 'A').charAt(0).toUpperCase();
        return `<div class="community-avatar" style="background: ${data.avatarColor || 'linear-gradient(135deg, var(--terracotta), var(--rust))'}">${initial}</div>`;
    }
}
window.renderCommunityAvatar = renderCommunityAvatar;

function renderSponsorBadges(data) {
    let badges = '';
    if (data.lookingForSponsor) {
        badges += '<span class="sponsor-badge looking">Seeking Sponsor</span>';
    }
    if (data.openToSponsoring) {
        badges += '<span class="sponsor-badge offering">Open to Sponsor</span>';
    }
    return badges;
}
window.renderSponsorBadges = renderSponsorBadges;

// --- Milestone Celebrations ---

async function postMilestoneToCommunity(milestone) {
    if (!currentUser) return;
    try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        const userData = userDoc.data() || {};
        const opts = userData.communityOptIn || {};
        if (!opts.publicMilestones) return;

        // Deduplicate: check if this milestone was already posted
        const existingQuery = query(
            collection(db, 'milestones'),
            where('uid', '==', currentUser.uid),
            where('milestoneDays', '==', milestone.days)
        );
        const existing = await getDocs(existingQuery);
        if (!existing.empty) return;

        await addDoc(collection(db, 'milestones'), {
            uid: currentUser.uid,
            preferredName: userData.preferredName || currentUser.displayName || '',
            avatarType: userData.avatarType || 'initial',
            avatarColor: userData.avatarColor || '',
            avatarIcon: userData.avatarIcon || '',
            avatarUrl: userData.avatarUrl || '',
            fellowship: userData.fellowship || '',
            lookingForSponsor: opts.lookingForSponsor || false,
            openToSponsoring: opts.openToSponsoring || false,
            milestoneLabel: milestone.label,
            milestoneIcon: milestone.icon,
            milestoneDays: milestone.days,
            createdAt: serverTimestamp(),
            celebrations: 0
        });
    } catch (error) {
        console.error('Error posting milestone to community:', error);
    }
}
window.postMilestoneToCommunity = postMilestoneToCommunity;

window._celebratedMilestones = new Set();

async function loadMilestoneFeed() {
    const feedContainer = document.getElementById('milestoneFeed');
    if (!feedContainer) return;
    try {
        const q = query(collection(db, 'milestones'), orderBy('createdAt', 'desc'), limit(50));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            feedContainer.innerHTML = '<p class="community-empty">No milestone celebrations yet. When community members reach milestones, they\'ll appear here!</p>';
            return;
        }
        let html = '';
        snapshot.forEach(d => {
            const data = d.data();
            const date = data.createdAt?.toDate();
            const timeAgo = date ? getTimeAgo(date) : '';
            const displayName = data.preferredName || 'Anonymous';
            const avatar = renderCommunityAvatar(data);
            const fellowshipBadge = data.fellowship ? `<span class="community-fellowship-badge">${escapeHtml(data.fellowship)}</span>` : '';
            const sponsorBadges = renderSponsorBadges(data);
            const isCelebrated = window._celebratedMilestones.has(d.id);

            html += `
                <div class="milestone-card">
                    <div class="milestone-card-header">
                        ${avatar}
                        <div class="milestone-card-info">
                            <span class="milestone-card-name">${escapeHtml(displayName)}</span>
                            <span class="milestone-card-time">${timeAgo}</span>
                        </div>
                        ${fellowshipBadge}
                        ${sponsorBadges}
                    </div>
                    <div class="milestone-card-achievement">
                        <span class="milestone-card-icon">${data.milestoneIcon}</span>
                        <span class="milestone-card-label">${escapeHtml(data.milestoneLabel)}</span>
                    </div>
                    <div class="milestone-card-footer">
                        <button class="celebrate-btn ${isCelebrated ? 'celebrated' : ''}" onclick="celebrateMilestone('${d.id}')" ${isCelebrated ? 'disabled' : ''}>
                            🎉 <span class="celebrate-count">${data.celebrations || 0}</span>
                        </button>
                    </div>
                </div>
            `;
        });
        feedContainer.innerHTML = html;
    } catch (error) {
        console.error('Error loading milestones:', error);
        feedContainer.innerHTML = '<p class="community-error">Error loading milestones</p>';
    }
}
window.loadMilestoneFeed = loadMilestoneFeed;

async function celebrateMilestone(milestoneId) {
    if (!currentUser) { showPage('auth'); return; }
    if (window._celebratedMilestones.has(milestoneId)) return;

    try {
        await updateDoc(doc(db, 'milestones', milestoneId), {
            celebrations: increment(1)
        });
        window._celebratedMilestones.add(milestoneId);

        // Optimistic UI update
        const btn = document.querySelector(`[onclick="celebrateMilestone('${milestoneId}')"]`);
        if (btn) {
            btn.classList.add('celebrated');
            btn.disabled = true;
            const countEl = btn.querySelector('.celebrate-count');
            if (countEl) countEl.textContent = parseInt(countEl.textContent) + 1;
        }
    } catch (error) {
        console.error('Error celebrating milestone:', error);
    }
}
window.celebrateMilestone = celebrateMilestone;

// --- Medallion Invites ---

async function submitMedallionInvite() {
    if (!currentUser) { showPage('auth'); return; }

    const eventName = document.getElementById('medallionEventName')?.value.trim();
    const eventDate = document.getElementById('medallionEventDate')?.value;
    const location = document.getElementById('medallionLocation')?.value.trim();
    const description = document.getElementById('medallionDescription')?.value.trim();
    const milestoneSelect = document.getElementById('medallionMilestone');
    const milestoneValue = milestoneSelect?.value;

    if (!eventName || !eventDate || !location) {
        showToast('Please fill in event name, date, and location');
        return;
    }

    try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        const userData = userDoc.data() || {};
        const opts = userData.communityOptIn || {};
        const milestone = MILESTONES.find(m => String(m.days) === milestoneValue);

        await addDoc(collection(db, 'medallionInvites'), {
            uid: currentUser.uid,
            preferredName: userData.preferredName || currentUser.displayName || '',
            avatarType: userData.avatarType || 'initial',
            avatarColor: userData.avatarColor || '',
            avatarIcon: userData.avatarIcon || '',
            avatarUrl: userData.avatarUrl || '',
            fellowship: userData.fellowship || '',
            lookingForSponsor: opts.lookingForSponsor || false,
            openToSponsoring: opts.openToSponsoring || false,
            eventName: eventName,
            eventDate: eventDate,
            eventLocation: location,
            description: description || '',
            milestoneLabel: milestone?.label || '',
            milestoneIcon: milestone?.icon || '',
            createdAt: serverTimestamp(),
            rsvpCount: 0,
            rsvps: []
        });

        // Clear form
        document.getElementById('medallionEventName').value = '';
        document.getElementById('medallionEventDate').value = '';
        document.getElementById('medallionLocation').value = '';
        document.getElementById('medallionDescription').value = '';
        if (milestoneSelect) milestoneSelect.value = '';

        showToast('Medallion invite posted! 🎖️');
        loadMedallionFeed();
    } catch (error) {
        console.error('Error posting medallion invite:', error);
        showToast('Error posting invite');
    }
}
window.submitMedallionInvite = submitMedallionInvite;

async function loadMedallionFeed() {
    const feedContainer = document.getElementById('medallionFeed');
    if (!feedContainer) return;
    try {
        const q = query(collection(db, 'medallionInvites'), orderBy('createdAt', 'desc'), limit(30));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            feedContainer.innerHTML = '<p class="community-empty">No medallion celebrations yet. Share yours!</p>';
            return;
        }
        let html = '';
        snapshot.forEach(d => {
            const data = d.data();
            const date = data.createdAt?.toDate();
            const timeAgo = date ? getTimeAgo(date) : '';
            const displayName = data.preferredName || 'Anonymous';
            const avatar = renderCommunityAvatar(data);
            const fellowshipBadge = data.fellowship ? `<span class="community-fellowship-badge">${escapeHtml(data.fellowship)}</span>` : '';
            const sponsorBadges = renderSponsorBadges(data);
            const hasRsvpd = data.rsvps?.includes(currentUser?.uid);
            const eventDateFormatted = data.eventDate ? new Date(data.eventDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '';
            const isPast = data.eventDate ? new Date(data.eventDate) < new Date() : false;

            html += `
                <div class="medallion-card ${isPast ? 'past-event' : ''}">
                    <div class="medallion-card-header">
                        ${avatar}
                        <div class="medallion-card-info">
                            <span class="medallion-card-name">${escapeHtml(displayName)}</span>
                            <span class="medallion-card-posted">${timeAgo}</span>
                        </div>
                        ${fellowshipBadge}
                        ${sponsorBadges}
                    </div>
                    ${data.milestoneIcon ? `<div class="medallion-card-milestone"><span>${data.milestoneIcon}</span> ${escapeHtml(data.milestoneLabel)}</div>` : ''}
                    <h4 class="medallion-card-title">${escapeHtml(data.eventName)}</h4>
                    <div class="medallion-card-details">
                        <div class="medallion-detail"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> ${eventDateFormatted}</div>
                        <div class="medallion-detail"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> ${escapeHtml(data.eventLocation)}</div>
                    </div>
                    ${data.description ? `<p class="medallion-card-desc">${escapeHtml(data.description)}</p>` : ''}
                    <div class="medallion-card-footer">
                        <button class="rsvp-btn ${hasRsvpd ? 'rsvpd' : ''}" onclick="toggleRsvp('${d.id}')" ${isPast ? 'disabled' : ''}>
                            ${hasRsvpd ? '✓ Going' : "I'll Be There"} <span class="rsvp-count">(${data.rsvpCount || 0})</span>
                        </button>
                    </div>
                </div>
            `;
        });
        feedContainer.innerHTML = html;
    } catch (error) {
        console.error('Error loading medallion feed:', error);
        feedContainer.innerHTML = '<p class="community-error">Error loading invites</p>';
    }
}
window.loadMedallionFeed = loadMedallionFeed;

async function toggleRsvp(inviteId) {
    if (!currentUser) { showPage('auth'); return; }
    try {
        const inviteRef = doc(db, 'medallionInvites', inviteId);
        const inviteDoc = await getDoc(inviteRef);
        const data = inviteDoc.data();
        const hasRsvpd = data.rsvps?.includes(currentUser.uid);

        if (hasRsvpd) {
            await updateDoc(inviteRef, {
                rsvps: arrayRemove(currentUser.uid),
                rsvpCount: increment(-1)
            });
        } else {
            await updateDoc(inviteRef, {
                rsvps: arrayUnion(currentUser.uid),
                rsvpCount: increment(1)
            });
        }
        loadMedallionFeed();
    } catch (error) {
        console.error('Error toggling RSVP:', error);
    }
}
window.toggleRsvp = toggleRsvp;

// --- Shared Gratitude Feed ---

async function loadSharedGratitudeFeed() {
    const feedContainer = document.getElementById('sharedGratitudeFeed');
    if (!feedContainer) return;
    try {
        const q = query(collection(db, 'shared'), orderBy('sharedAt', 'desc'), limit(30));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            feedContainer.innerHTML = '<p class="community-empty">No shared gratitude yet. Share yours from the Gratitude page!</p>';
            return;
        }
        let html = '';
        for (const d of snapshot.docs) {
            const data = d.data();
            const date = data.sharedAt?.toDate();
            const timeAgo = date ? getTimeAgo(date) : '';

            let displayName = 'A grateful person';
            let avatarHtml = '<div class="community-avatar community-avatar-default">🙏</div>';
            if (data.sharedBy) {
                try {
                    const userDoc = await getDoc(doc(db, 'users', data.sharedBy));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        const opts = userData.communityOptIn || {};
                        if (!opts.sharedGratitudeFeed) continue;
                        displayName = userData.preferredName || 'A grateful person';
                        avatarHtml = renderCommunityAvatar(userData);
                    }
                } catch (e) { /* fall back to default */ }
            }

            const items = (data.items || []).map(item => `<li>${escapeHtml(item)}</li>`).join('');

            html += `
                <div class="gratitude-feed-card">
                    <div class="gratitude-feed-card-header">
                        ${avatarHtml}
                        <div class="gratitude-feed-card-info">
                            <span class="gratitude-feed-card-name">${escapeHtml(displayName)}</span>
                            <span class="gratitude-feed-card-time">${timeAgo}</span>
                        </div>
                    </div>
                    <ul class="gratitude-feed-card-items">${items}</ul>
                </div>
            `;
        }
        feedContainer.innerHTML = html || '<p class="community-empty">No shared gratitude lists are public yet.</p>';
    } catch (error) {
        console.error('Error loading shared gratitude feed:', error);
        feedContainer.innerHTML = '<p class="community-error">Error loading gratitude feed</p>';
    }
}
window.loadSharedGratitudeFeed = loadSharedGratitudeFeed;

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
        const lfs = document.getElementById('profileLookingForSponsor');
        if (lfs) lfs.checked = opts.lookingForSponsor || false;
        const ots = document.getElementById('profileOpenToSponsoring');
        if (ots) ots.checked = opts.openToSponsoring || false;

        // Cache preferred name and update welcome message
        if (data.preferredName) {
            localStorage.setItem('preferredName', data.preferredName);
            const welcomeEl = document.getElementById('welcomeUser');
            if (welcomeEl) welcomeEl.textContent = `Welcome back, ${data.preferredName}!`;
        }

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
                lookingForSponsor: document.getElementById('profileLookingForSponsor')?.checked || false,
                openToSponsoring: document.getElementById('profileOpenToSponsoring')?.checked || false,
            },
            lastProfileUpdate: serverTimestamp()
        };

        await setDoc(doc(db, 'users', currentUser.uid), profileData, { merge: true });

        // Cache preferred name for instant welcome message on next load
        if (profileData.preferredName) {
            localStorage.setItem('preferredName', profileData.preferredName);
        } else {
            localStorage.removeItem('preferredName');
        }

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
