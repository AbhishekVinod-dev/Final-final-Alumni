// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; 
// import { getAnalytics } from "firebase/analytics";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBnIobVWI0PpK_hkhd_Pcsxjy6Da501wI8",
  authDomain: "alumni-website-25747.firebaseapp.com",
  projectId: "alumni-website-25747",
  storageBucket: "alumni-website-25747.appspot.com", 
  messagingSenderId: "504751237682",
  appId: "1:504751237682:web:7a255fd543358f661fea2b",
  measurementId: "G-X5Y9RQS20V",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); 

// Admin accounts (optional, update with real emails)
export const ADMIN_EMAILS = ["abhishekvinod144@gmail.com"];

// (Optional) Analytics
// import { getAnalytics } from "firebase/analytics";
// export const analytics = getAnalytics(app);
