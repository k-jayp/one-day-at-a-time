import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    onAuthStateChanged,
    signOut,
    updateProfile,
    sendPasswordResetEmail
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

onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    updateUIForAuthState(user);
    if (user) {
        await loadUserData();
        // Check if new signup — launch onboarding
        if (window._isNewSignup) {
            window._isNewSignup = false;
            if (typeof window.startOnboarding === 'function') {
                setTimeout(() => window.startOnboarding(), 300);
            }
        } else {
            // Returning user — check if onboarding was never completed
            try {
                const userDocSnap = await getDoc(doc(db, 'users', user.uid));
                if (!userDocSnap.exists() || !userDocSnap.data()?.onboardingComplete) {
                    if (typeof window.showOnboardingNudge === 'function') {
                        window.showOnboardingNudge();
                    }
                }
            } catch (e) {
                // Silently ignore — nudge is non-critical
            }
        }
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

        // Show notification bell and start polling
        const notifBell = document.getElementById('notificationBell');
        if (notifBell) notifBell.style.display = 'flex';
        startNotificationPolling();

        // Show partners tab in community sidebar
        const partnersTab = document.getElementById('partnersTabBtn');
        if (partnersTab) partnersTab.style.display = '';
    } else {
        // Show signed-out UI
        avatarWrapper.style.display = 'none';
        signInBtn.style.display = 'block';
        if (myJourneyDropdown) myJourneyDropdown.style.display = 'none';

        // Hide notification bell, partners tab, and stop polling
        const partnersTab = document.getElementById('partnersTabBtn');
        if (partnersTab) partnersTab.style.display = 'none';
        const notifBell = document.getElementById('notificationBell');
        if (notifBell) notifBell.style.display = 'none';
        const notifBadge = document.getElementById('notificationBadge');
        if (notifBadge) notifBadge.style.display = 'none';
        stopNotificationPolling();

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
        window._isNewSignup = true;
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
        const result = await signInWithPopup(auth, googleProvider);
        // Check if this is a brand-new user (no Firestore doc yet)
        const userDocSnap = await getDoc(doc(db, 'users', result.user.uid));
        if (!userDocSnap.exists()) {
            window._isNewSignup = true;
        } else {
            showToast('Welcome back! 🙏');
        }
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

// ─── Onboarding Save ─────────────────────────────────────────────
window.saveOnboardingData = async function(data) {
    if (!currentUser) return;
    const profileData = {
        preferredName: data.preferredName || '',
        fellowship: data.fellowship || '',
        avatarType: data.avatarType || 'initial',
        avatarColor: data.avatarColor || 'linear-gradient(135deg, #2D5A3D, #1E4D2E)',
        avatarIcon: data.avatarIcon || '',
        communityOptIn: {
            publicMilestones: !!data.publicMilestones,
            openToPartner: !!data.openToPartner,
            sharedGratitudeFeed: !!data.sharedGratitude
        },
        onboardingComplete: true,
        lastProfileUpdate: serverTimestamp()
    };
    if (data.cleanDate && !data.skipDate) {
        profileData.cleanDate = data.cleanDate;
    }
    await setDoc(doc(db, 'users', currentUser.uid), profileData, { merge: true });

    // Update localStorage for welcome message
    if (data.preferredName) {
        localStorage.setItem('preferredName', data.preferredName);
    }

    // Update nav avatar immediately
    if (typeof window.updateNavAvatar === 'function') {
        window.updateNavAvatar(profileData);
    }

    // Update welcome message
    const welcomeEl = document.getElementById('welcomeUser');
    if (welcomeEl && data.preferredName) {
        welcomeEl.textContent = `Welcome, ${data.preferredName}!`;
    }

    // Reload home page data
    await loadUserData();

    showToast('Profile set up! Welcome to We Do Recover! 🎉');
};

window.resetPasswordFromSignIn = async function() {
    const email = document.getElementById('signinEmail').value.trim();
    if (!email) {
        showAuthError('Please enter your email address first, then click "Forgot password?"');
        return;
    }
    try {
        hideAuthError();
        await sendPasswordResetEmail(auth, email);
        showToast('Password reset email sent! Check your inbox.');
    } catch (error) {
        showAuthError(getErrorMessage(error.code));
    }
}

window.resetPasswordFromProfile = async function() {
    if (!currentUser || !currentUser.email) {
        showToast('No email address found for your account');
        return;
    }
    const btn = document.getElementById('profileResetPasswordBtn');
    const statusEl = document.getElementById('profileResetStatus');
    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Sending...';
    }
    try {
        await sendPasswordResetEmail(auth, currentUser.email);
        showToast('Password reset email sent! Check your inbox.');
        if (statusEl) statusEl.textContent = 'Reset email sent to ' + currentUser.email;
    } catch (error) {
        showToast('Error sending reset email. Please try again.');
        if (statusEl) statusEl.textContent = '';
        console.error('Password reset error:', error);
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = 'Send Password Reset Email';
        }
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
    // Parse as local time to avoid UTC timezone shift (e.g. "2026-01-15" → Jan 15 local, not Jan 14)
    const parts = cleanDate.split('-');
    const clean = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));

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

    // Build display string, omitting zero parts
    const parts2 = [];
    if (years > 0) parts2.push(`${years} ${years === 1 ? 'year' : 'years'}`);
    if (months > 0) parts2.push(`${months} ${months === 1 ? 'month' : 'months'}`);
    if (days > 0) parts2.push(`${days} ${days === 1 ? 'day' : 'days'}`);

    if (parts2.length > 0) return parts2.join(' ');

    // Total days for short durations (less than a month)
    const totalDays = Math.floor((now - clean) / (1000 * 60 * 60 * 24));
    return totalDays === 0 ? 'Today!' : `${totalDays} days`;
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

        // Also create the shared entry linked to this source entry
        // This replaces the separate createSharedGratitude call
        await addDoc(collection(db, 'shared'), {
            items: items,
            date: new Date().toISOString().split('T')[0],
            sharedBy: currentUser.uid,
            sharedAt: serverTimestamp(),
            sourceEntryId: docRef.id
        });

        return docRef.id;
    } catch (error) {
        console.error('Error saving gratitude:', error);
        throw error;
    }
}

window.deleteGratitudeEntry = async function(entryId) {
    if (!currentUser) return;
    if (confirm('Are you sure you want to delete this entry? It will also be removed from the community feed.')) {
        try {
            // Delete from personal collection
            await deleteDoc(doc(db, 'users', currentUser.uid, 'gratitude', entryId));

            // Also delete any matching entries from the shared collection
            try {
                const sharedQuery = query(
                    collection(db, 'shared'),
                    where('sharedBy', '==', currentUser.uid),
                    where('sourceEntryId', '==', entryId)
                );
                const sharedSnap = await getDocs(sharedQuery);
                const deletePromises = [];
                sharedSnap.forEach(d => deletePromises.push(deleteDoc(d.ref)));
                await Promise.all(deletePromises);
            } catch (e) {
                console.error('Error cleaning shared entries:', e);
            }

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
        // Check if this entry is already shared
        const existingQuery = query(
            collection(db, 'shared'),
            where('sharedBy', '==', currentUser.uid),
            where('sourceEntryId', '==', entryId)
        );
        const existingSnap = await getDocs(existingQuery);

        if (!existingSnap.empty) {
            // Already shared — just copy the existing link
            const existingId = existingSnap.docs[0].id;
            const shareUrl = `${window.location.origin}${window.location.pathname}#shared?id=${existingId}`;
            navigator.clipboard.writeText(shareUrl).then(() => showToast('Share link copied! 📋'));
            return;
        }

        // Fetch the entry from user's gratitude collection
        const entryRef = doc(db, 'users', currentUser.uid, 'gratitude', entryId);
        const entrySnap = await getDoc(entryRef);

        if (!entrySnap.exists()) {
            showToast('Entry not found');
            return;
        }

        const entry = entrySnap.data();

        // Save to public shared collection with source link
        const sharedRef = await addDoc(collection(db, 'shared'), {
            items: entry.items,
            date: dateStr.split('T')[0],
            sharedBy: currentUser.uid,
            sharedAt: serverTimestamp(),
            sourceEntryId: entryId
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
            date: new Date().toISOString().split('T')[0],
            sharedBy: currentUser.uid,
            sharedAt: serverTimestamp()
        });
        return sharedRef.id;
    } catch (error) {
        console.error('Error creating shared gratitude:', error);
        throw error;
    }
}

// Helper to find a shared entry by its source gratitude entry ID
window.getSharedEntryBySource = async function(sourceEntryId) {
    if (!currentUser) return null;
    try {
        const q = query(
            collection(db, 'shared'),
            where('sharedBy', '==', currentUser.uid),
            where('sourceEntryId', '==', sourceEntryId)
        );
        const snap = await getDocs(q);
        if (!snap.empty) return snap.docs[0].id;
        return null;
    } catch (e) {
        console.error('Error finding shared entry:', e);
        return null;
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
        case 'auth/too-many-requests': return 'Too many requests. Please wait a few minutes and try again.';
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
    { days: 1095, icon: '💪', label: '3 Years' },
    { days: 1460, icon: '🌈', label: '4 Years' },
    { days: 1825, icon: '🎖️', label: '5 Years' },
    { days: 2190, icon: '✨', label: '6 Years' },
    { days: 2555, icon: '🕊️', label: '7 Years' },
    { days: 2920, icon: '🔱', label: '8 Years' },
    { days: 3285, icon: '🌠', label: '9 Years' },
    { days: 3650, icon: '⭐', label: '10 Years' },
];
window.MILESTONES = MILESTONES;

function updateStreakDisplay(cleanDate) {
    const container = document.getElementById('streakContainer');
    if (!cleanDate) { container.style.display = 'none'; return; }
    container.style.display = 'block';
    // Parse as local time to avoid UTC timezone shift
    const p = cleanDate.split('-');
    const cleanLocal = new Date(parseInt(p[0]), parseInt(p[1]) - 1, parseInt(p[2]));
    const days = Math.floor((new Date() - cleanLocal) / (1000*60*60*24));
    document.getElementById('streakDays').textContent = days;
    const badgesContainer = document.getElementById('streakBadges');
    badgesContainer.innerHTML = '';

    // Show all earned badges + next 3 upcoming milestones
    const earned = MILESTONES.filter(m => days >= m.days);
    const upcoming = MILESTONES.filter(m => days < m.days).slice(0, 3);
    const visible = [...earned, ...upcoming];

    visible.forEach(m => {
        const isEarned = days >= m.days;
        const badge = document.createElement('div');
        badge.className = `milestone-badge ${isEarned ? 'earned' : 'unearned'}`;
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

// Backfill: post any earned milestones that are missing from the community collection
async function backfillMilestones() {
    if (!currentUser) return;
    try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        const userData = userDoc.data() || {};
        const opts = userData.communityOptIn || {};
        if (!opts.publicMilestones) return;

        const cleanDate = userData.cleanDate;
        if (!cleanDate) return;
        const p = cleanDate.split('-');
        const cleanLocal = new Date(parseInt(p[0]), parseInt(p[1]) - 1, parseInt(p[2]));
        const days = Math.floor((new Date() - cleanLocal) / (1000*60*60*24));

        // Find all milestones user has earned
        const earned = MILESTONES.filter(m => days >= m.days);
        if (earned.length === 0) return;

        // Check which ones are already posted
        const postedQuery = query(
            collection(db, 'milestones'),
            where('uid', '==', currentUser.uid)
        );
        const postedSnap = await getDocs(postedQuery);
        const postedDays = new Set();
        postedSnap.forEach(d => postedDays.add(d.data().milestoneDays));

        // Post any missing ones
        for (const milestone of earned) {
            if (postedDays.has(milestone.days)) continue;
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
        }
    } catch (error) {
        console.error('Error backfilling milestones:', error);
    }
}

window._celebratedMilestones = new Set();

async function loadMilestoneFeed() {
    // Backfill any missing milestones before loading the feed
    await backfillMilestones();
    const feedContainer = document.getElementById('milestoneFeed');
    if (!feedContainer) return;
    try {
        const q = query(collection(db, 'milestones'), orderBy('createdAt', 'desc'), limit(50));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            feedContainer.innerHTML = '<p class="community-empty">No milestone celebrations yet. When community members reach milestones, they\'ll appear here!</p>';
            return;
        }

        // Fetch live user data so names, fellowship, badges are always current
        const userCache = {};
        const entries = [];
        for (const d of snapshot.docs) {
            const data = d.data();
            if (!data.uid) continue;

            if (!(data.uid in userCache)) {
                try {
                    const userDoc = await getDoc(doc(db, 'users', data.uid));
                    userCache[data.uid] = userDoc.exists() ? userDoc.data() : null;
                } catch (e) {
                    userCache[data.uid] = null;
                }
            }
            const userData = userCache[data.uid];

            // Calculate actual milestone date from clean date + milestoneDays
            let milestoneDate = null;
            const cleanDate = userData?.cleanDate;
            if (cleanDate && data.milestoneDays != null) {
                const cp = cleanDate.split('-');
                const cleanLocal = new Date(parseInt(cp[0]), parseInt(cp[1]) - 1, parseInt(cp[2]));
                milestoneDate = new Date(cleanLocal.getTime() + data.milestoneDays * 86400000);
            }

            entries.push({ docId: d.id, data, userData, milestoneDate });
        }

        // Sort by actual milestone date, most recent first
        entries.sort((a, b) => {
            const da = a.milestoneDate?.getTime() || 0;
            const db2 = b.milestoneDate?.getTime() || 0;
            return db2 - da;
        });

        let html = '';
        for (const entry of entries) {
            const { docId, data, userData, milestoneDate } = entry;

            // Use live profile data, fall back to denormalized data
            const displayName = userData?.preferredName || data.preferredName || 'Anonymous';
            const avatarSource = userData || data;
            const fellowship = userData?.fellowship || data.fellowship || '';
            const sponsorSource = userData ? {
                lookingForSponsor: userData.communityOptIn?.lookingForSponsor || false,
                openToSponsoring: userData.communityOptIn?.openToSponsoring || false,
            } : data;

            // Show actual milestone date (e.g. "Jan 15, 2026") or fall back to relative time
            let dateDisplay = '';
            if (milestoneDate) {
                dateDisplay = milestoneDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            } else {
                const created = data.createdAt?.toDate();
                dateDisplay = created ? getTimeAgo(created) : '';
            }

            const avatar = renderCommunityAvatar(avatarSource);
            const fellowshipBadge = fellowship ? `<span class="community-fellowship-badge">${escapeHtml(fellowship)}</span>` : '';
            const sponsorBadges = renderSponsorBadges(sponsorSource);
            const isCelebrated = window._celebratedMilestones.has(docId);

            html += `
                <div class="milestone-card">
                    <div class="milestone-card-header">
                        <a class="community-profile-link" onclick="viewUserProfile('${data.uid}')">
                            ${avatar}
                        </a>
                        <div class="milestone-card-info">
                            <a class="community-profile-link" onclick="viewUserProfile('${data.uid}')">
                                <span class="milestone-card-name">${escapeHtml(displayName)}</span>
                            </a>
                            <span class="milestone-card-time">${dateDisplay}</span>
                        </div>
                        ${fellowshipBadge}
                        ${sponsorBadges}
                    </div>
                    <div class="milestone-card-achievement">
                        <span class="milestone-card-icon">${data.milestoneIcon}</span>
                        <span class="milestone-card-label">${escapeHtml(data.milestoneLabel)}</span>
                    </div>
                    <div class="milestone-card-footer">
                        <button class="celebrate-btn ${isCelebrated ? 'celebrated' : ''}" onclick="celebrateMilestone('${docId}')" ${isCelebrated ? 'disabled' : ''}>
                            🎉 <span class="celebrate-count">${data.celebrations || 0}</span>
                        </button>
                    </div>
                </div>
            `;
        }
        feedContainer.innerHTML = html;
    } catch (error) {
        console.error('Error loading milestones:', error);
        if (error.code === 'permission-denied' || error.code === 'failed-precondition') {
            feedContainer.innerHTML = '<p class="community-empty">Milestone celebrations are being set up. Check back soon!</p>';
        } else {
            feedContainer.innerHTML = '<p class="community-error">Unable to load milestones right now.</p>';
        }
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

        // Send notification to the milestone author
        try {
            const milestoneDoc = await getDoc(doc(db, 'milestones', milestoneId));
            if (milestoneDoc.exists()) {
                const milestoneData = milestoneDoc.data();
                if (milestoneData.uid && milestoneData.uid !== currentUser.uid) {
                    createNotification(
                        milestoneData.uid,
                        'milestone_cheer',
                        `cheered your ${milestoneData.milestoneLabel || 'milestone'} 🎉`,
                        milestoneId
                    );
                }
            }
        } catch (notifError) {
            // Don't block the celebration if notification fails
            console.error('Error sending cheer notification:', notifError);
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
                        <a class="community-profile-link" onclick="viewUserProfile('${data.uid}')">
                            ${avatar}
                        </a>
                        <div class="medallion-card-info">
                            <a class="community-profile-link" onclick="viewUserProfile('${data.uid}')">
                                <span class="medallion-card-name">${escapeHtml(displayName)}</span>
                            </a>
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
        const q = query(collection(db, 'shared'), orderBy('sharedAt', 'desc'), limit(50));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            feedContainer.innerHTML = '<p class="community-empty">No shared gratitude yet. Share yours from the Gratitude page!</p>';
            return;
        }

        // Build a cache of user data so we don't re-fetch the same user
        const userCache = {};
        // Track seen user+date combos to deduplicate
        const seen = new Set();
        let html = '';

        for (const d of snapshot.docs) {
            const data = d.data();

            // Skip entries with no author
            if (!data.sharedBy) continue;

            // Deduplicate by user + content hash (items joined)
            // This catches duplicates even with different dates/timestamps
            const itemsKey = (data.items || []).join('|||');
            const dedupeKey = `${data.sharedBy}_${itemsKey}`;
            if (seen.has(dedupeKey)) continue;
            seen.add(dedupeKey);

            // Fetch user data (with cache)
            if (!(data.sharedBy in userCache)) {
                try {
                    const userDoc = await getDoc(doc(db, 'users', data.sharedBy));
                    userCache[data.sharedBy] = userDoc.exists() ? userDoc.data() : null;
                } catch (e) {
                    userCache[data.sharedBy] = null;
                }
            }

            const userData = userCache[data.sharedBy];

            // Only show entries from users who have opted in to the community gratitude feed
            if (!userData || !userData.communityOptIn?.sharedGratitudeFeed) continue;

            const displayName = userData.preferredName || 'A grateful person';
            const avatarHtml = renderCommunityAvatar(userData);
            const date = data.sharedAt?.toDate();
            const timeAgo = date ? getTimeAgo(date) : '';
            const items = (data.items || []).map(item => `<li>${escapeHtml(item)}</li>`).join('');

            html += `
                <div class="gratitude-feed-card">
                    <div class="gratitude-feed-card-header">
                        <a class="community-profile-link" onclick="viewUserProfile('${data.sharedBy}')">
                            ${avatarHtml}
                        </a>
                        <div class="gratitude-feed-card-info">
                            <a class="community-profile-link" onclick="viewUserProfile('${data.sharedBy}')">
                                <span class="gratitude-feed-card-name">${escapeHtml(displayName)}</span>
                            </a>
                            <span class="gratitude-feed-card-time">${timeAgo}</span>
                        </div>
                    </div>
                    <ul class="gratitude-feed-card-items">${items}</ul>
                </div>
            `;
        }
        feedContainer.innerHTML = html || '<p class="community-empty">No shared gratitude lists are public yet. Opt in from your Profile to share!</p>';
    } catch (error) {
        console.error('Error loading shared gratitude feed:', error);
        feedContainer.innerHTML = '<p class="community-error">Unable to load gratitude feed right now.</p>';
    }
}
window.loadSharedGratitudeFeed = loadSharedGratitudeFeed;

// ========== PUBLIC PROFILES ==========

async function loadPublicProfile(uid) {
    const container = document.getElementById('publicProfileContent');
    if (!container || !uid) return;
    container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

    try {
        // Fetch user document
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (!userDoc.exists()) {
            container.innerHTML = '<p class="community-empty">This profile could not be found.</p>';
            return;
        }
        const data = userDoc.data();
        const optIn = data.communityOptIn || {};

        // Build hero card
        const displayName = data.preferredName || 'Recovery Friend';
        const pronouns = data.pronouns || '';
        const fellowship = data.fellowship || '';
        const avatarHtml = renderCommunityAvatar(data);
        const sponsorBadges = renderSponsorBadges({
            lookingForSponsor: optIn.lookingForSponsor || false,
            openToSponsoring: optIn.openToSponsoring || false,
        });

        // Recovery time (only if user opted into public milestones)
        let recoveryTimeHtml = '';
        if (optIn.publicMilestones && data.cleanDate) {
            const recoveryTime = calculateCleanTime(data.cleanDate);
            recoveryTimeHtml = `
                <div class="public-profile-card">
                    <div class="public-profile-card-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    </div>
                    <div>
                        <h4>Time in Recovery</h4>
                        <p class="public-profile-recovery-time">${escapeHtml(recoveryTime)}</p>
                    </div>
                </div>
            `;
        }

        // Milestones (only if user opted into public milestones)
        let milestonesHtml = '';
        if (optIn.publicMilestones) {
            try {
                const mq = query(collection(db, 'milestones'), where('uid', '==', uid), orderBy('createdAt', 'desc'), limit(20));
                const mSnapshot = await getDocs(mq);
                if (!mSnapshot.empty) {
                    let milestoneItems = '';
                    mSnapshot.forEach(d => {
                        const m = d.data();
                        milestoneItems += `<div class="public-profile-milestone"><span>${m.milestoneIcon}</span> ${escapeHtml(m.milestoneLabel)}</div>`;
                    });
                    milestonesHtml = `
                        <div class="public-profile-section">
                            <h4>Milestones Earned</h4>
                            <div class="public-profile-milestones-grid">${milestoneItems}</div>
                        </div>
                    `;
                }
            } catch (e) { console.error('Error loading profile milestones:', e); }
        }

        // Mantra
        let mantraHtml = '';
        if (data.mantra) {
            mantraHtml = `
                <div class="public-profile-card public-profile-mantra-card">
                    <div class="public-profile-card-icon mantra-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    </div>
                    <div>
                        <h4>Personal Mantra</h4>
                        <p class="public-profile-mantra-text">"${escapeHtml(data.mantra)}"</p>
                    </div>
                </div>
            `;
        }

        // Shared gratitude (only if opted in to shared gratitude feed)
        let gratitudeHtml = '';
        if (optIn.sharedGratitudeFeed) {
            try {
                const gq = query(collection(db, 'shared'), where('sharedBy', '==', uid), orderBy('sharedAt', 'desc'), limit(5));
                const gSnapshot = await getDocs(gq);
                if (!gSnapshot.empty) {
                    let gratitudeItems = '';
                    gSnapshot.forEach(d => {
                        const g = d.data();
                        const items = (g.items || []).map(item => `<li>${escapeHtml(item)}</li>`).join('');
                        const date = g.sharedAt?.toDate();
                        const timeAgo = date ? getTimeAgo(date) : '';
                        gratitudeItems += `
                            <div class="public-profile-gratitude-entry">
                                <span class="public-profile-gratitude-time">${timeAgo}</span>
                                <ul>${items}</ul>
                            </div>
                        `;
                    });
                    gratitudeHtml = `
                        <div class="public-profile-section">
                            <h4>Shared Gratitude</h4>
                            ${gratitudeItems}
                        </div>
                    `;
                }
            } catch (e) { console.error('Error loading profile gratitude:', e); }
        }

        // Action buttons — own profile gets "Edit", others get partner controls
        let partnerBtnHtml = '';
        const isOwnProfile = currentUser && currentUser.uid === uid;
        if (isOwnProfile) {
            partnerBtnHtml = `
                <div class="public-profile-actions">
                    <button class="btn btn-primary public-profile-partner-btn" onclick="showPage('profile')">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        Edit My Profile
                    </button>
                </div>
            `;
        } else if (currentUser) {
            try {
                const myDoc = await getDoc(doc(db, 'users', currentUser.uid));
                const myPartners = myDoc.exists() ? (myDoc.data().partners || []) : [];
                const isAlreadyPartner = myPartners.includes(uid);

                if (isAlreadyPartner) {
                    partnerBtnHtml = `
                        <div class="public-profile-actions">
                            <button class="btn btn-secondary public-profile-partner-btn" disabled>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>
                                Already Partners
                            </button>
                            <button class="btn btn-secondary partner-msg-btn" onclick="openMessagingPanel('${uid}', '${escapeHtml(displayName).replace(/'/g, "\\'")}')">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                                Message
                            </button>
                        </div>
                    `;
                } else {
                    // Check for pending request
                    const q1 = query(collection(db, 'partnerRequests'),
                        where('fromUid', '==', currentUser.uid), where('toUid', '==', uid), where('status', '==', 'pending'));
                    const q2 = query(collection(db, 'partnerRequests'),
                        where('fromUid', '==', uid), where('toUid', '==', currentUser.uid), where('status', '==', 'pending'));
                    const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);

                    if (!snap1.empty) {
                        partnerBtnHtml = `
                            <div class="public-profile-actions">
                                <button class="btn btn-secondary public-profile-partner-btn" id="publicProfilePartnerBtn" disabled>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Request Pending
                                </button>
                            </div>
                        `;
                    } else if (!snap2.empty) {
                        // They sent US a request — show accept/decline
                        const reqId = snap2.docs[0].id;
                        partnerBtnHtml = `
                            <div class="public-profile-actions public-profile-actions-row">
                                <button class="btn btn-primary" onclick="respondToPartnerRequest('${reqId}', true)">Accept Request</button>
                                <button class="btn btn-secondary" onclick="respondToPartnerRequest('${reqId}', false)">Decline</button>
                            </div>
                        `;
                    } else if (optIn.openToPartner) {
                        partnerBtnHtml = `
                            <div class="public-profile-actions">
                                <button class="btn btn-primary public-profile-partner-btn" id="publicProfilePartnerBtn" onclick="sendPartnerRequest('${uid}')">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                                    Request as Partner
                                </button>
                            </div>
                        `;
                    }
                }
            } catch (e) { console.error('Error checking partner status:', e); }
        }

        container.innerHTML = `
            <div class="public-profile-hero">
                <div class="public-profile-avatar-large">${avatarHtml}</div>
                <div class="public-profile-hero-info">
                    <h2 class="public-profile-name">${escapeHtml(displayName)}</h2>
                    ${pronouns ? `<span class="public-profile-pronouns">${escapeHtml(pronouns)}</span>` : ''}
                    <div class="public-profile-badges">
                        ${fellowship ? `<span class="community-fellowship-badge">${escapeHtml(fellowship)}</span>` : ''}
                        ${sponsorBadges}
                    </div>
                </div>
            </div>
            ${recoveryTimeHtml}
            ${mantraHtml}
            ${milestonesHtml}
            ${gratitudeHtml}
            ${partnerBtnHtml}
        `;
    } catch (error) {
        console.error('Error loading public profile:', error);
        container.innerHTML = '<p class="community-error">Unable to load this profile right now.</p>';
    }
}
window.loadPublicProfile = loadPublicProfile;

// ========== ACCOUNTABILITY PARTNERS ==========

async function sendPartnerRequest(toUid) {
    if (!currentUser) { showPage('auth'); return; }
    if (currentUser.uid === toUid) { showToast('You can\'t partner with yourself'); return; }

    try {
        // Check if already partners
        const myDoc = await getDoc(doc(db, 'users', currentUser.uid));
        const myData = myDoc.exists() ? myDoc.data() : {};
        if ((myData.partners || []).includes(toUid)) {
            showToast('You\'re already partners!');
            return;
        }

        // Check for existing pending request (either direction)
        const q1 = query(collection(db, 'partnerRequests'),
            where('fromUid', '==', currentUser.uid),
            where('toUid', '==', toUid),
            where('status', '==', 'pending')
        );
        const q2 = query(collection(db, 'partnerRequests'),
            where('fromUid', '==', toUid),
            where('toUid', '==', currentUser.uid),
            where('status', '==', 'pending')
        );
        const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
        if (!snap1.empty || !snap2.empty) {
            showToast('A request is already pending');
            return;
        }

        // Get sender profile for denormalization
        const senderName = myData.preferredName || currentUser.displayName || 'Someone';

        // Get recipient name
        const toDoc = await getDoc(doc(db, 'users', toUid));
        const toName = toDoc.exists() ? (toDoc.data().preferredName || 'Someone') : 'Someone';

        await addDoc(collection(db, 'partnerRequests'), {
            fromUid: currentUser.uid,
            toUid: toUid,
            fromName: senderName,
            toName: toName,
            status: 'pending',
            createdAt: serverTimestamp()
        });

        // Send notification
        createNotification(toUid, 'partner_request', 'sent you a partner request');

        showToast('Partner request sent!');

        // Update button state on public profile if visible
        const btn = document.getElementById('publicProfilePartnerBtn');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Request Pending`;
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-secondary');
        }
    } catch (error) {
        console.error('Error sending partner request:', error);
        showToast('Error sending request');
    }
}
window.sendPartnerRequest = sendPartnerRequest;

async function respondToPartnerRequest(requestId, accept) {
    if (!currentUser) return;
    try {
        const reqRef = doc(db, 'partnerRequests', requestId);
        const reqDoc = await getDoc(reqRef);
        if (!reqDoc.exists()) { showToast('Request not found'); return; }
        const reqData = reqDoc.data();

        if (accept) {
            // Update request status
            await updateDoc(reqRef, { status: 'accepted', respondedAt: serverTimestamp() });

            // Add each user to the other's partners array
            await Promise.all([
                updateDoc(doc(db, 'users', reqData.fromUid), { partners: arrayUnion(reqData.toUid) }),
                updateDoc(doc(db, 'users', reqData.toUid), { partners: arrayUnion(reqData.fromUid) })
            ]);

            // Notify the requester
            createNotification(reqData.fromUid, 'partner_accepted', 'accepted your partner request!');
            showToast('Partner added! 🤝');
        } else {
            // Decline — just update status
            await updateDoc(reqRef, { status: 'rejected', respondedAt: serverTimestamp() });
            showToast('Request declined');
        }

        // Refresh the partners tab
        loadPartnersTab();
    } catch (error) {
        console.error('Error responding to partner request:', error);
        showToast('Error processing request');
    }
}
window.respondToPartnerRequest = respondToPartnerRequest;

async function removePartner(partnerUid) {
    if (!currentUser) return;
    try {
        // Remove from both users' partner arrays
        await Promise.all([
            updateDoc(doc(db, 'users', currentUser.uid), { partners: arrayRemove(partnerUid) }),
            updateDoc(doc(db, 'users', partnerUid), { partners: arrayRemove(currentUser.uid) })
        ]);
        showToast('Partner removed');
        loadPartnersTab();
    } catch (error) {
        console.error('Error removing partner:', error);
        showToast('Error removing partner');
    }
}
window.removePartner = removePartner;

async function loadPartnersTab() {
    await loadPendingRequests();
    await loadMyPartners();
}
window.loadPartnersTab = loadPartnersTab;

async function loadPendingRequests() {
    if (!currentUser) return;
    const section = document.getElementById('pendingRequestsSection');
    const feed = document.getElementById('pendingRequestsFeed');
    if (!section || !feed) return;

    try {
        const q = query(
            collection(db, 'partnerRequests'),
            where('toUid', '==', currentUser.uid),
            where('status', '==', 'pending'),
            orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            section.style.display = 'none';
            return;
        }

        section.style.display = 'block';
        let html = '';
        for (const d of snapshot.docs) {
            const req = d.data();
            // Fetch requester's live profile
            let userData = null;
            try {
                const userDoc = await getDoc(doc(db, 'users', req.fromUid));
                userData = userDoc.exists() ? userDoc.data() : null;
            } catch (e) { /* ignore */ }

            const name = userData?.preferredName || req.fromName || 'Someone';
            const avatarHtml = renderCommunityAvatar(userData || { preferredName: name });
            const fellowship = userData?.fellowship || '';
            const timeAgo = req.createdAt?.toDate() ? getTimeAgo(req.createdAt.toDate()) : '';

            html += `
                <div class="partner-request-card">
                    <div class="partner-request-header">
                        <a class="community-profile-link" onclick="viewUserProfile('${req.fromUid}')">
                            ${avatarHtml}
                        </a>
                        <div class="partner-request-info">
                            <a class="community-profile-link" onclick="viewUserProfile('${req.fromUid}')">
                                <span class="partner-request-name">${escapeHtml(name)}</span>
                            </a>
                            ${fellowship ? `<span class="community-fellowship-badge">${escapeHtml(fellowship)}</span>` : ''}
                            <span class="partner-request-time">${timeAgo}</span>
                        </div>
                    </div>
                    <div class="partner-request-actions">
                        <button class="btn btn-primary partner-accept-btn" onclick="respondToPartnerRequest('${d.id}', true)">Accept</button>
                        <button class="btn btn-secondary partner-decline-btn" onclick="respondToPartnerRequest('${d.id}', false)">Decline</button>
                    </div>
                </div>
            `;
        }
        feed.innerHTML = html;
    } catch (error) {
        console.error('Error loading pending requests:', error);
        section.style.display = 'none';
    }
}
window.loadPendingRequests = loadPendingRequests;

async function loadMyPartners() {
    if (!currentUser) return;
    const feed = document.getElementById('myPartnersFeed');
    if (!feed) return;

    try {
        const myDoc = await getDoc(doc(db, 'users', currentUser.uid));
        const myData = myDoc.exists() ? myDoc.data() : {};
        const partnerUids = myData.partners || [];

        if (partnerUids.length === 0) {
            feed.innerHTML = `
                <div class="partners-empty">
                    <div class="partners-empty-icon">🤝</div>
                    <h4>No Partners Yet</h4>
                    <p>Find someone in the community and send them a partner request. Accountability partners help you stay on track in recovery.</p>
                </div>
            `;
            return;
        }

        let html = '';
        for (const uid of partnerUids) {
            let userData = null;
            try {
                const userDoc = await getDoc(doc(db, 'users', uid));
                userData = userDoc.exists() ? userDoc.data() : null;
            } catch (e) { /* ignore */ }

            if (!userData) continue;

            const name = userData.preferredName || 'Recovery Friend';
            const avatarHtml = renderCommunityAvatar(userData);
            const fellowship = userData.fellowship || '';
            const sponsorBadges = renderSponsorBadges({
                lookingForSponsor: userData.communityOptIn?.lookingForSponsor || false,
                openToSponsoring: userData.communityOptIn?.openToSponsoring || false,
            });

            // Recovery time
            let recoveryHtml = '';
            if (userData.cleanDate && userData.communityOptIn?.publicMilestones) {
                recoveryHtml = `<span class="partner-card-recovery">${calculateCleanTime(userData.cleanDate)}</span>`;
            }

            html += `
                <div class="partner-card">
                    <div class="partner-card-header">
                        <a class="community-profile-link" onclick="viewUserProfile('${uid}')">
                            ${avatarHtml}
                        </a>
                        <div class="partner-card-info">
                            <a class="community-profile-link" onclick="viewUserProfile('${uid}')">
                                <span class="partner-card-name">${escapeHtml(name)}</span>
                            </a>
                            ${recoveryHtml}
                        </div>
                        ${fellowship ? `<span class="community-fellowship-badge">${escapeHtml(fellowship)}</span>` : ''}
                        ${sponsorBadges}
                    </div>
                    <div class="partner-card-actions">
                        <button class="btn btn-secondary partner-msg-btn" onclick="openMessagingPanel('${uid}', '${escapeHtml(name).replace(/'/g, "\\'")}')">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                            Message
                        </button>
                        <button class="partner-remove-btn" onclick="if(confirm('Remove this partner?')) removePartner('${uid}')" title="Remove partner">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                    </div>
                </div>
            `;
        }
        feed.innerHTML = html;
    } catch (error) {
        console.error('Error loading partners:', error);
        feed.innerHTML = '<p class="community-error">Unable to load partners right now.</p>';
    }
}
window.loadMyPartners = loadMyPartners;

// Stub for Phase 3 — will be fully implemented with messaging
function openMessagingPanel(partnerUid, partnerName) {
    showToast('Messaging coming soon!');
}
window.openMessagingPanel = openMessagingPanel;

// ========== NOTIFICATIONS ==========

let _notificationPollTimer = null;

async function createNotification(recipientUid, type, message, referenceId = '') {
    if (!currentUser || currentUser.uid === recipientUid) return;
    try {
        // Get sender's profile data for denormalization
        const senderDoc = await getDoc(doc(db, 'users', currentUser.uid));
        const senderData = senderDoc.exists() ? senderDoc.data() : {};

        await addDoc(collection(db, 'notifications'), {
            recipientUid: recipientUid,
            type: type,
            senderUid: currentUser.uid,
            senderName: senderData.preferredName || currentUser.displayName || 'Someone',
            senderAvatarType: senderData.avatarType || 'initial',
            senderAvatarColor: senderData.avatarColor || '',
            senderAvatarIcon: senderData.avatarIcon || '',
            senderAvatarUrl: senderData.avatarUrl || '',
            message: message,
            referenceId: referenceId,
            read: false,
            createdAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error creating notification:', error);
    }
}
window.createNotification = createNotification;

async function loadNotifications() {
    if (!currentUser) return;
    const list = document.getElementById('notificationList');
    if (!list) return;

    try {
        const q = query(
            collection(db, 'notifications'),
            where('recipientUid', '==', currentUser.uid),
            orderBy('createdAt', 'desc'),
            limit(50)
        );
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            list.innerHTML = '<p class="notification-empty">No notifications yet. When someone cheers your milestones or sends you a request, you\'ll see it here!</p>';
            return;
        }

        let html = '';
        snapshot.forEach(d => {
            const n = d.data();
            const isUnread = !n.read;
            const date = n.createdAt?.toDate();
            const timeAgo = date ? getTimeAgo(date) : '';
            const avatar = renderCommunityAvatar({
                avatarType: n.senderAvatarType,
                avatarColor: n.senderAvatarColor,
                avatarIcon: n.senderAvatarIcon,
                avatarUrl: n.senderAvatarUrl,
                preferredName: n.senderName
            });

            // Icon per notification type
            let typeIcon = '';
            switch (n.type) {
                case 'milestone_cheer': typeIcon = '🎉'; break;
                case 'partner_request': typeIcon = '🤝'; break;
                case 'partner_accepted': typeIcon = '✅'; break;
                case 'nudge': typeIcon = '💭'; break;
                case 'message': typeIcon = '💬'; break;
                default: typeIcon = '🔔';
            }

            // Sanitize IDs for safe onclick usage
            const safeId = escapeHtml(d.id);
            const safeType = escapeHtml(n.type || '');
            const safeSenderUid = escapeHtml(n.senderUid || '');
            const safeRefId = escapeHtml(n.referenceId || '');

            html += `
                <div class="notification-item ${isUnread ? 'unread' : ''}" onclick="handleNotificationClick('${safeId}', '${safeType}', '${safeSenderUid}', '${safeRefId}')">
                    <div class="notification-item-avatar">${avatar}</div>
                    <div class="notification-item-content">
                        <span class="notification-item-text"><strong>${escapeHtml(n.senderName || 'Someone')}</strong> ${escapeHtml(n.message || '')}</span>
                        <span class="notification-item-time">${typeIcon} ${timeAgo}</span>
                    </div>
                    ${isUnread ? '<div class="notification-item-dot"></div>' : ''}
                </div>
            `;
        });
        list.innerHTML = html;
    } catch (error) {
        console.error('Error loading notifications:', error);
        if (error.code === 'failed-precondition') {
            list.innerHTML = '<p class="notification-empty">Notifications are being set up. Check back soon!</p>';
        } else {
            list.innerHTML = '<p class="notification-empty">Unable to load notifications right now.</p>';
        }
    }
}
window.loadNotifications = loadNotifications;

async function handleNotificationClick(notifId, type, senderUid, referenceId) {
    if (!currentUser) return;
    // Mark as read
    try {
        await updateDoc(doc(db, 'notifications', notifId), { read: true });
    } catch (e) { console.error('Error marking notification read:', e); }

    // Close panel
    if (typeof window.closeNotificationPanel === 'function') {
        window.closeNotificationPanel();
    }

    // Navigate based on type
    switch (type) {
        case 'milestone_cheer':
            showPage('community');
            if (typeof window.switchCommunityTab === 'function') window.switchCommunityTab('milestones');
            break;
        case 'partner_request':
        case 'partner_accepted':
            // Will navigate to partners tab once Phase 2 is built
            if (senderUid && typeof window.viewUserProfile === 'function') window.viewUserProfile(senderUid);
            break;
        case 'nudge':
        case 'message':
            // Will open messaging panel once Phase 3 is built
            if (senderUid && typeof window.viewUserProfile === 'function') window.viewUserProfile(senderUid);
            break;
        default:
            break;
    }

    // Refresh badge count
    updateNotificationBadge();
}
window.handleNotificationClick = handleNotificationClick;

async function markAllNotificationsRead() {
    if (!currentUser) return;
    try {
        const q = query(
            collection(db, 'notifications'),
            where('recipientUid', '==', currentUser.uid),
            where('read', '==', false)
        );
        const snapshot = await getDocs(q);
        const promises = snapshot.docs.map(d => updateDoc(d.ref, { read: true }));
        await Promise.all(promises);
        // Refresh the panel and badge
        loadNotifications();
        updateNotificationBadge();
    } catch (error) {
        console.error('Error marking all notifications read:', error);
    }
}
window.markAllNotificationsRead = markAllNotificationsRead;

async function updateNotificationBadge() {
    if (!currentUser) return;
    const badge = document.getElementById('notificationBadge');
    if (!badge) return;
    try {
        const q = query(
            collection(db, 'notifications'),
            where('recipientUid', '==', currentUser.uid),
            where('read', '==', false)
        );
        const snapshot = await getDocs(q);
        const count = snapshot.size;
        if (count > 0) {
            badge.textContent = count > 99 ? '99+' : count;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    } catch (error) {
        // Silently fail — badge just won't update
        console.error('Error updating notification badge:', error);
    }
}
window.updateNotificationBadge = updateNotificationBadge;

function startNotificationPolling() {
    if (_notificationPollTimer) clearInterval(_notificationPollTimer);
    // Initial badge check
    updateNotificationBadge();
    // Poll every 60 seconds
    _notificationPollTimer = setInterval(() => {
        updateNotificationBadge();
    }, 60000);
}

function stopNotificationPolling() {
    if (_notificationPollTimer) {
        clearInterval(_notificationPollTimer);
        _notificationPollTimer = null;
    }
}

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
        if (lfs) {
            lfs.checked = opts.lookingForSponsor || false;
            lfs.addEventListener('change', updateSponsorBadgePreview);
        }
        const ots = document.getElementById('profileOpenToSponsoring');
        if (ots) {
            ots.checked = opts.openToSponsoring || false;
            ots.addEventListener('change', updateSponsorBadgePreview);
        }
        updateSponsorBadgePreview();

        // Cache preferred name and update welcome message
        if (data.preferredName) {
            localStorage.setItem('preferredName', data.preferredName);
            const welcomeEl = document.getElementById('welcomeUser');
            if (welcomeEl) welcomeEl.textContent = `Welcome back, ${data.preferredName}!`;
        }

        // Update nav avatar
        updateNavAvatar(data);

        // Populate account email display
        const accountEmailEl = document.getElementById('profileAccountEmail');
        if (accountEmailEl && currentUser) {
            accountEmailEl.textContent = currentUser.email || 'Signed in with Google (no password set)';
        }
    } catch (error) {
        console.error('Error loading profile data:', error);
    }
}
window.loadProfileData = loadProfileData;

function updateSponsorBadgePreview() {
    const container = document.getElementById('profileBadgePreview');
    const badgesEl = document.getElementById('profileBadgePreviewBadges');
    if (!container || !badgesEl) return;
    const looking = document.getElementById('profileLookingForSponsor')?.checked;
    const offering = document.getElementById('profileOpenToSponsoring')?.checked;
    if (looking || offering) {
        let html = '';
        if (looking) html += '<span class="sponsor-badge looking">Seeking Sponsor</span>';
        if (offering) html += '<span class="sponsor-badge offering">Open to Sponsor</span>';
        badgesEl.innerHTML = html;
        container.style.display = 'block';
    } else {
        container.style.display = 'none';
    }
}
window.updateSponsorBadgePreview = updateSponsorBadgePreview;

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

        // Sync denormalized profile data on community milestone posts
        syncCommunityPosts(profileData);

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

// Sync denormalized profile fields on all community milestone posts
async function syncCommunityPosts(profileData) {
    if (!currentUser) return;
    try {
        const q = query(collection(db, 'milestones'), where('uid', '==', currentUser.uid));
        const snapshot = await getDocs(q);
        if (snapshot.empty) return;

        const updates = {
            preferredName: profileData.preferredName || currentUser.displayName || '',
            fellowship: profileData.fellowship || '',
            avatarType: profileData.avatarType || 'initial',
            avatarColor: profileData.avatarColor || '',
            avatarIcon: profileData.avatarIcon || '',
            avatarUrl: profileData.avatarUrl || '',
            lookingForSponsor: profileData.communityOptIn?.lookingForSponsor || false,
            openToSponsoring: profileData.communityOptIn?.openToSponsoring || false,
        };

        const promises = snapshot.docs.map(d => updateDoc(d.ref, updates));
        await Promise.all(promises);
    } catch (e) {
        console.error('Error syncing community posts:', e);
    }
}

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
