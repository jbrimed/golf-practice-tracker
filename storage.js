// storage.js — CANVAS ENVIRONMENT FIX
// STRICT CONFIGURATION: Uses ONLY the platform-provided config.

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
    signInAnonymously
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// ============================================================
// CANVAS ENVIRONMENT SETUP
// ============================================================
const COLLECTION_NAME = "sessions";
const DRAFT_KEY = "golf_session_draft";

let db, auth;

// STRICTLY parse the global variable. No manual fallbacks.
// This ensures we get the valid config injected by the environment.
let firebaseConfig;
try {
    if (typeof __firebase_config !== 'undefined') {
        firebaseConfig = JSON.parse(__firebase_config);
        console.log("✅ Config found. Project ID:", firebaseConfig.projectId);
    } else {
        throw new Error("Global __firebase_config is missing.");
    }
} catch (e) {
    console.error("CRITICAL: Failed to parse Firebase Config.", e);
    alert("System Error: App configuration missing. Please reload.");
}

// Initialize Firebase services
try {
    if (firebaseConfig) {
        const app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);
        console.log("✅ Firebase Core Initialized.");
    }
} catch (error) {
    console.error("❌ Firebase Init Error:", error);
}

// ============================================================
// AUTHENTICATION
// ============================================================

/**
 * Signs in the user using Google Popup.
 * Must be called from a user-triggered event (like a button click).
 */
export async function loginWithGoogle() {
    if (!auth) {
        console.error("Auth object is null. Init failed.");
        alert("System Error: Auth service not ready.");
        return;
    }
    
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        console.log("✅ Logged in as:", result.user.email);
        return result.user;
    } catch (error) {
        console.error("Login Error:", error);
        alert("Login Failed: " + error.message);
        throw error;
    }
}

export function logout() {
    if (!auth) return Promise.resolve();
    return signOut(auth);
}

export function subscribeToAuth(callback) {
    if (!auth) return;
    return onAuthStateChanged(auth, callback);
}

export function getCurrentUser() {
    return auth ? auth.currentUser : null;
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
        alert("You must be logged in to save history."); 
        return false; 
    }
    
    const user = auth.currentUser;
    
    try {
        const sessionWithUser = {
            ...session,
            userId: user.uid,
            userEmail: user.email || "anonymous",
            timestamp: Date.now()
        };

        // Remove undefined values to prevent Firestore crash
        const cleanSession = JSON.parse(JSON.stringify(sessionWithUser));

        const docRef = await addDoc(collection(db, COLLECTION_NAME), cleanSession);
        console.log("✅ Session saved with ID:", docRef.id);
        
        clearDraft(); 
        return true;

    } catch (e) {
        console.error("❌ Firestore Write Error: ", e);
        if(e.code === 'permission-denied') {
            alert("Error: Permission denied. Check database rules.");
        } else {
            alert("Error saving: " + e.message);
        }
        return false;
    }
}

export async function loadSessions() {
    if (!db || !auth || !auth.currentUser) return [];
    
    const sessions = [];
    try {
        const q = query(
            collection(db, COLLECTION_NAME), 
            where("userId", "==", auth.currentUser.uid), 
            orderBy("timestamp", "desc") // Sort by timestamp we added
        );
        
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            sessions.push({ id: doc.id, ...doc.data() });
        });
        console.log(`Loaded ${sessions.length} sessions.`);
    } catch (e) {
        console.error("Error loading documents: ", e);
        // Fallback: If index is missing, try loading without sort
        if(e.code === 'failed-precondition') {
             console.warn("Index missing. Loading unsorted data.");
             const q2 = query(collection(db, COLLECTION_NAME), where("userId", "==", auth.currentUser.uid));
             const snap = await getDocs(q2);
             snap.forEach((doc) => sessions.push({ id: doc.id, ...doc.data() }));
        }
    }
    return sessions;
}

export async function deleteSessionFromCloud(id) {
    if (!db || !auth.currentUser) return;
    try {
        await deleteDoc(doc(db, COLLECTION_NAME, id));
        console.log("Deleted session:", id);
    } catch (e) {
        console.error("Error deleting: ", e);
    }
}