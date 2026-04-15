import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCErzYRvwRIFe69glkkqEuilnl-NwPioyc",
  authDomain: "lovespace-25e8d.firebaseapp.com",
  projectId: "lovespace-25e8d",
  storageBucket: "lovespace-25e8d.firebasestorage.app",
  messagingSenderId: "52917856894",
  appId: "1:52917856894:web:055d09750672184570c62f",
  measurementId: "G-XLJ76E9F2T"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
