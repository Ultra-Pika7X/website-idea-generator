import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCOcrIwB2xgPbUbQQzIsyYBN0jqqzKa5MY",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "chat-330e3.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "chat-330e3",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "chat-330e3.firebasestorage.app",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "663444636956",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:663444636956:web:aa5c3b923876b7bc9866d9",
};

// Initialize Firebase (Safe Mode)
let app: any;
let auth: any;
let db: any;
let provider: any;

try {
    if (typeof window !== 'undefined' || firebaseConfig.apiKey) {
        app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        auth = getAuth(app);
        db = getFirestore(app);
        provider = new GoogleAuthProvider();
    }
} catch (error) {
    console.warn("Firebase initialization failed:", error);
}

export { app, auth, db, provider };
