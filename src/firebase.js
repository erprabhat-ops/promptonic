import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBO25E7C8t3H82FzlKT3s9xW2F4Bq11AS8",
  authDomain: "promptonic-d7f16.firebaseapp.com",
  projectId: "promptonic-d7f16",
  storageBucket: "promptonic-d7f16.firebasestorage.app",
  messagingSenderId: "871394383563",
  appId: "1:871394383563:web:5ceadfbfa951c6b2952d4e",
  measurementId: "G-0RFGH0MJBZ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
