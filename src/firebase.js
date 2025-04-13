// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
const firebaseConfig = {
  apiKey: "AIzaSyDePZqpCrFdNsN1hUdw2_rwMfKP41SJgvU",
  authDomain: "nafa3ny-de185.firebaseapp.com",
  projectId: "nafa3ny-de185",
  storageBucket: "nafa3ny-de185.firebasestorage.app",
  messagingSenderId: "346694832541",
  appId: "1:346694832541:web:d2869f3ffb43e3c69a5f74"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };