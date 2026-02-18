import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyDuAAakrVw8UPClW81oQCcVtKoNSXsy0qQ",
    authDomain: "hospital-management-webs-3c917.firebaseapp.com",
    projectId: "hospital-management-webs-3c917",
    storageBucket: "hospital-management-webs-3c917.firebasestorage.app",
    messagingSenderId: "659818725957",
    appId: "1:659818725957:web:0f4cf28f05948d0034d92c",
    measurementId: "G-J92HSQKSTP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
