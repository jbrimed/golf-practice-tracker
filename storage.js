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
    signInAnonymously
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// ============================================================
// CANVAS ENVIRONMENT SETUP
// ============================================================
const COLLECTION_NAME = "sessions";
const DRAFT_KEY = "golf_session_draft";

let db, auth;

// CRITICAL FIX: Robustly retrieve config from environment or fallback
let firebaseConfig;
try {
    if (typeof __firebase_config !== 'undefined') {
        firebaseConfig = JSON.parse(__firebase_config);
    } else {
        console.warn("⚠️ __firebase_config not found. Using fallback/placeholder.");
        // Placeholder to prevent "projectId missing" crash on init, 
        // though auth will still fail if this isn't replaced by real data.
        firebaseConfig = { apiKey: "placeholder", projectId: "placeholder" }; 
    }
} catch (e) {
    console.error("Error parsing firebase config:", e);
    firebaseConfig = { apiKey: "placeholder", projectId: "placeholder" };
}

try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    
    // Check initial auth state and sign in anonymously if no user is found.
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
             console.log("No persistent user found. Attempting Anonymous Sign-in.");
             try {
                await signInAnonymously(auth);
             } catch (err) {
                 console.warn("Anonymous sign-in failed (likely due to invalid config):", err);
             }
        }
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
        console.error("Login Error:", error);
        throw error;
    }
}

export function logout() {
    // If the user is currently anonymous, sign them out and immediately back in
    if (auth.currentUser && auth.currentUser.isAnonymous) {
        return signOut(auth).then(() => {
            return signInAnonymously(auth); 
        });
    }
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
    console.log("Attempting to save session...", session);

    if (!db) { 
        alert("Database not connected."); 
        return false; 
    }
    
    const user = auth?.currentUser;
    if (!user) {
        console.error("❌ Save failed: No authenticated user.");
        alert("You must be logged in to save history."); 
        return false; 
    }
    
    // Prevent saving if user is anonymous to avoid filling public space unnecessarily
    if (user.isAnonymous) {
        alert("Session saved locally (Anonymous mode). Sign in with Google to save permanently.");
        return true; 
    }
    
    try {
        // Prepare data payload
        const sessionWithUser = {
            ...session,
            userId: user.uid,
            userEmail: user.email || "anonymous",
            timestamp: Date.now() // Helper for sorting
        };

        // Check for undefined values which crash Firestore
        // (Simple sanitization)
        const cleanSession = JSON.parse(JSON.stringify(sessionWithUser));

        const docRef = await addDoc(collection(db, COLLECTION_NAME), cleanSession);
        console.log("✅ Session saved with ID:", docRef.id);
        
        clearDraft(); 
        return true;

    } catch (e) {
        console.error("❌ Firestore Write Error: ", e);
        
        if(e.code === 'permission-denied') {
            alert("Permission denied! \n1. Go to Firebase Console > Firestore > Rules.\n2. Change to: allow read, write: if true;");
        } else {
            alert("Error saving: " + e.message);
        }
        return false;
    }
}

export async function loadSessions() {
    if (!db || !auth || !auth.currentUser) return [];
    
    if (auth.currentUser.isAnonymous) {
        console.log("User is anonymous. Skipping cloud history load.");
        return [];
    }

    const sessions = [];
    try {
        const q = query(
            collection(db, COLLECTION_NAME), 
            where("userId", "==", auth.currentUser.uid), 
            orderBy("createdAt", "desc")
        );
        
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            sessions.push({ id: doc.id, ...doc.data() });
        });
        console.log(`Loaded ${sessions.length} sessions.`);
    } catch (e) {
        console.error("Error loading documents: ", e);
        if(e.message && e.message.includes("index")) {
             alert("Missing Index! Open console (F12) and click the link in the error message.");
        }
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