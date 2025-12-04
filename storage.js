// storage.js — STRICT GOOGLE AUTH
// Fixed: Hardcoded Configuration

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getFirestore, collection, addDoc, getDocs, orderBy, query, deleteDoc, doc, where 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { 
    getAuth, 
    signInWithPopup, 
    GoogleAuthProvider, 
    signOut, 
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// ============================================================
// CONFIGURATION & INITIALIZATION
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyCt-LkGkr0_P2kRt0EMaDbWAUGM27c02K4",
  authDomain: "golf-app-practice.firebaseapp.com",
  projectId: "golf-app-practice",
  storageBucket: "golf-app-practice.firebasestorage.app",
  messagingSenderId: "438728696738",
  appId: "1:438728696738:web:1f3cccff35c35407d748fb",
  measurementId: "G-BZN8HXMEXK"
};

// Initialize Firebase services immediately
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

console.log("✅ Firebase Initialized with Project ID:", firebaseConfig.projectId);

const COLLECTION_NAME = "sessions";
const DRAFT_KEY = "golf_session_draft";

// ============================================================
// AUTHENTICATION
// ============================================================

/**
 * Signs in the user using Google Popup.
 * Must be called from a user-triggered event (like a button click).
 */
export async function loginWithGoogle() {
    if (!auth) {
        alert("System Error: Auth service not ready.");
        return;
    }
    
    const provider = new GoogleAuthProvider();
    try {
        console.log("Attempting Google Sign-In...");
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
    if (!auth || !auth.currentUser) { 
        alert("You must be logged in to save history."); 
        return false; 
    }
    
    const user = auth.currentUser;
    
    try {
        const sessionWithUser = {
            ...session,
            userId: user.uid,
            userEmail: user.email,
            timestamp: Date.now()
        };

        // Deep copy to remove any undefined values that crash Firestore
        const cleanSession = JSON.parse(JSON.stringify(sessionWithUser));

        const docRef = await addDoc(collection(db, COLLECTION_NAME), cleanSession);
        console.log("✅ Session saved with ID:", docRef.id);
        
        clearDraft(); 
        return true;

    } catch (e) {
        console.error("❌ Firestore Write Error: ", e);
        if(e.code === 'permission-denied') {
            alert("Error: Permission denied. Check database rules in Firebase Console.");
        } else {
            alert("Error saving: " + e.message);
        }
        return false;
    }
}

export async function loadSessions() {
    if (!auth || !auth.currentUser) return [];
    
    const sessions = [];
    try {
        // Attempt to sort by timestamp (requires Firestore Index)
        const q = query(
            collection(db, COLLECTION_NAME), 
            where("userId", "==", auth.currentUser.uid), 
            orderBy("timestamp", "desc")
        );
        
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            sessions.push({ id: doc.id, ...doc.data() });
        });
        console.log(`Loaded ${sessions.length} sessions.`);
    } catch (e) {
        console.error("Error loading documents: ", e);
        
        // Fallback: If index is missing, load unsorted
        if(e.code === 'failed-precondition') {
             console.warn("Index missing. Loading unsorted data as fallback.");
             const q2 = query(collection(db, COLLECTION_NAME), where("userId", "==", auth.currentUser.uid));
             const snap = await getDocs(q2);
             snap.forEach((doc) => sessions.push({ id: doc.id, ...doc.data() }));
        }
    }
    return sessions;
}

export async function deleteSessionFromCloud(id) {
    if (!auth.currentUser) return;
    try {
        await deleteDoc(doc(db, COLLECTION_NAME, id));
        console.log("Deleted session:", id);
    } catch (e) {
        console.error("Error deleting: ", e);
    }
}