// storage.js — Connected to Firebase Firestore
// Configured for Project: golf-app-practice

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, orderBy, query, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ============================================================
// FIREBASE CONFIGURATION
// Your specific keys are now plugged in below.
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
let db;
try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("Firebase initialized successfully");
} catch (error) {
    console.error("Firebase failed to initialize:", error);
}

const COLLECTION_NAME = "sessions";
const DRAFT_KEY = "golf_session_draft";

// ============================================================
// DRAFT SYSTEM (Local Auto-Save)
// This saves your inputs instantly if you refresh/close
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
    if (!db) { alert("Firebase not connected. Check console."); return false; }
    try {
        await addDoc(collection(db, COLLECTION_NAME), session);
        clearDraft(); // Clear draft after successful save
        return true;
    } catch (e) {
        console.error("Error adding document: ", e);
        // Common error: Firestore rules blocking write
        if(e.code === 'permission-denied') {
            alert("Permission denied. Did you set Firestore to 'Test Mode' in the console?");
        } else {
            alert("Error saving to cloud: " + e.message);
        }
        return false;
    }
}

export async function loadSessions() {
    if (!db) return [];
    const sessions = [];
    try {
        // Query sessions ordered by date (newest first)
        const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            sessions.push({ id: doc.id, ...doc.data() });
        });
    } catch (e) {
        console.error("Error loading documents: ", e);
    }
    return sessions;
}

export async function deleteSessionFromCloud(id) {
    if (!db) return;
    try {
        await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (e) {
        console.error("Error deleting: ", e);
    }
}