// storage.js — Connected to Firebase Firestore & Auth
// Configured for Project: golf-app-practice

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
    // Explicitly set persistence (though it's default)
    setPersistence(auth, browserLocalPersistence);
    console.log("Firebase initialized successfully");
} catch (error) {
    console.error("Firebase failed to initialize:", error);
}

const COLLECTION_NAME = "sessions";
const DRAFT_KEY = "golf_session_draft";

// ============================================================
// AUTHENTICATION
// ============================================================
export function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
}

// NEW: Email Login
export function loginWithEmail(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
}

// NEW: Email Signup
export function signupWithEmail(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
}

export function logout() {
    return signOut(auth);
}

// Subscribe to auth changes
export function subscribeToAuth(callback) {
    return onAuthStateChanged(auth, callback);
}

export function getCurrentUser() {
    return auth.currentUser;
}

// ============================================================
// DRAFT SYSTEM (Local Auto-Save)
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
    if (!db) { 
        alert("Database connection failed."); 
        return false; 
    }
    
    // Ensure we have a user (even if auth state is lagging slightly)
    const user = auth.currentUser;
    if (!user) {
        alert("You must be logged in to save history."); 
        return false; 
    }
    
    try {
        // Add User ID to the session document
        const sessionWithUser = {
            ...session,
            userId: user.uid, // CRITICAL: Link data to user
            userEmail: user.email || "anonymous"
        };

        await addDoc(collection(db, COLLECTION_NAME), sessionWithUser);
        clearDraft(); 
        return true;
    } catch (e) {
        console.error("Error adding document: ", e);
        if(e.code === 'permission-denied') {
            alert("Permission denied. Check Firestore rules in Firebase Console.");
        } else {
            alert("Error saving: " + e.message);
        }
        return false;
    }
}

export async function loadSessions() {
    if (!db || !auth.currentUser) return [];
    
    const sessions = [];
    try {
        // Query ONLY sessions belonging to current user
        const q = query(
            collection(db, COLLECTION_NAME), 
            where("userId", "==", auth.currentUser.uid), // Filter by User ID
            orderBy("createdAt", "desc")
        );
        
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            sessions.push({ id: doc.id, ...doc.data() });
        });
    } catch (e) {
        // If sorting fails initially due to missing index, it might error.
        console.error("Error loading documents: ", e);
        if(e.message.includes("index")) {
             // Fallback query without sort if index is missing
             const qFallback = query(
                collection(db, COLLECTION_NAME), 
                where("userId", "==", auth.currentUser.uid)
            );
            const fallbackSnapshot = await getDocs(qFallback);
            fallbackSnapshot.forEach((doc) => {
                sessions.push({ id: doc.id, ...doc.data() });
            });
            // Client-side sort
            sessions.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
    }
    return sessions;
}

export async function deleteSessionFromCloud(id) {
    if (!db || !auth.currentUser) return;
    try {
        await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (e) {
        console.error("Error deleting: ", e);
    }
}