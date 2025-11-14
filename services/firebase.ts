import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB06JTnk1cGAs5mmz4VhUN3vRcJ8RuSp6E",
  authDomain: "academic-gading-system.firebaseapp.com",
  projectId: "academic-gading-system",
  storageBucket: "academic-gading-system.firebasestorage.app",
  messagingSenderId: "696143594162",
  appId: "1:696143594162:web:6c5967c0a28854d1b07fab",
  measurementId: "G-EQXLTQNSDJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
