// ==========================================================================
// Firebase Configuration — Eric's Arcade
// ==========================================================================
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth }       from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getFirestore }  from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const firebaseConfig = {
    apiKey:            "AIzaSyDnZOwSu_5hqAuzAqgd3gNimWcQg1IuyIc",
    authDomain:        "eric-arcade.firebaseapp.com",
    projectId:         "eric-arcade",
    storageBucket:     "eric-arcade.firebasestorage.app",
    messagingSenderId: "933974427341",
    appId:             "1:933974427341:web:12c8a56664acf9e9c60b84"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db   = getFirestore(app);
