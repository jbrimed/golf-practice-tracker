// storage.js — DEBUGGED VERSION
// Added explicit logging to catch why saveSession is failing

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
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    setPersistence,
    browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// ============================================================
// FIREBASE CONFIGURATION
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

// Initialize Firebase
let db, auth;
try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    setPersistence(auth, browserLocalPersistence);
    console.log("✅ Firebase initialized");
} catch (error) {
    console.error("❌ Firebase Init Error:", error);
    alert("Critical Error: Firebase could not start. Check console.");
}

const COLLECTION_NAME = "sessions";
const DRAFT_KEY = "golf_session_draft";

// ============================================================
// AUTHENTICATION
// ============================================================
export async function loginWithGoogle() {
    if (!auth) throw new Error("Auth not ready");
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

export function loginWithEmail(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
}

export function signupWithEmail(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
}

export function logout() {
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
// DRAFT SYSTEM
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
    
    const user = auth.currentUser;
    if (!user) {
        console.error("❌ Save failed: No authenticated user.");
        alert("You must be logged in to save history."); 
        return false; 
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
        if(e.message.includes("index")) {
             alert("Missing Index! Open console (F12) and click the link in the error message.");
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