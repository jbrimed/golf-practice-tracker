// storage.js — CANVAS ENVIRONMENT & ANONYMOUS SIGN-IN FIX

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getFirestore, collection, addDoc, getDocs, orderBy, query, deleteDoc, doc, where 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { 
    getAuth, 
    signInWithPopup, 
    GoogleAuthProvider, 
    signOut, 
    onAuthStateChanged,
    signInAnonymously // REQUIRED for fallback
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// ============================================================
// CANVAS ENVIRONMENT SETUP
// ============================================================
const COLLECTION_NAME = "sessions";
const DRAFT_KEY = "golf_session_draft";

let db, auth;

// Use the global Canvas provided configuration
const firebaseConfig = JSON.parse(
    typeof __firebase_config !== 'undefined' ? __firebase_config : '{}'
);

try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    
    // Immediate attempt to sign in anonymously if no token exists, 
    // ensuring 'auth.currentUser' is never null.
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
             console.log("No user found. Attempting Anonymous Sign-in.");
             await signInAnonymously(auth);
        }
        // Since app.js uses subscribeToAuth, this handles initial state.
    });
    
    console.log("✅ Firebase Core Initialized.");
} catch (error) {
    console.error("❌ Firebase Init Error (Check Configuration):", error);
}

// ============================================================
// AUTHENTICATION
// ============================================================
export async function loginWithGoogle() {
    if (!auth) throw new Error("Authentication service is not ready.");
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        console.log("✅ Logged in as:", result.user.email);
        return result.user;
    } catch (error) {
        // If login fails, force UI refresh which will fall back to anonymous user
        console.error("Login Error:", error);
        throw error;
    }
}

export function logout() {
    // If the user is currently anonymous, sign them out of the session.
    if (auth.currentUser.isAnonymous) {
        return signOut(auth).then(() => {
            // After signing out, sign them back in anonymously immediately
            // to maintain a session for the app structure to work.
            return signInAnonymously(auth); 
        });
    }
    return signOut(auth);
}

export function subscribeToAuth(callback) {
    if (!auth) return;
    return onAuthStateChanged(auth, callback);
}

// ============================================================
// DRAFT SYSTEM (Standard Local Storage)
// ============================================================
export function saveDraft(data) {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
}

export function loadDraft() {
    const data = localStorage.getItem(DRAFT_KEY);
    return data ? JSON.parse(data) : null;
}

export function clearDraft() {
    localStorage.removeItem(DRAFT_KEY);
}

// ============================================================
// CLOUD STORAGE (History)
// ============================================================

export async function saveSession(session) {
    if (!db || !auth || !auth.currentUser) { 
        alert("Authentication required. Please wait for the app to load or sign in."); 
        return false; 
    }
    
    const user = auth.currentUser;
    // Disallow saving to cloud if user is only anonymous
    if (user.isAnonymous) {
        alert("History saved locally. Sign in with Google to save permanently.");
        // This is a stub: in a real app, you'd save locally here. 
        // For now, we abort the cloud save.
        return true; 
    }
    
    try {
        const sessionWithUser = {
            ...session,
            userId: user.uid,
            userEmail: user.email || "anonymous",
            timestamp: Date.now()
        };

        const docRef = await addDoc(collection(db, COLLECTION_NAME), sessionWithUser);
        console.log("✅ Session saved with ID:", docRef.id);
        clearDraft(); 
        return true;

    } catch (e) {
        console.error("❌ Firestore Write Error: ", e);
        alert("Error saving: " + e.message);
        return false;
    }
}

export async function loadSessions() {
    // Allows loading if the user is signed in (even anonymously)
    if (!db || !auth || !auth.currentUser) return [];
    
    // Prevent loading data if user is anonymous (security rules often prevent this)
    if (auth.currentUser.isAnonymous) {
        console.log("User is anonymous. Skipping cloud history load.");
        return [];
    }

    const sessions = [];
    try {
        const q = query(
            collection(db, COLLECTION_NAME), 
            where("userId", "==", auth.currentUser.uid)
        );
        
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            sessions.push({ id: doc.id, ...doc.data() });
        });
        console.log(`Loaded ${sessions.length} sessions.`);
    } catch (e) {
        console.error("Error loading documents: ", e);
    }
    return sessions;
}

export async function deleteSessionFromCloud(id) {
    if (!db || !auth.currentUser || auth.currentUser.isAnonymous) return;
    try {
        await deleteDoc(doc(db, COLLECTION_NAME, id));
        console.log("Deleted session:", id);
    } catch (e) {
        console.error("Error deleting: ", e);
    }
}