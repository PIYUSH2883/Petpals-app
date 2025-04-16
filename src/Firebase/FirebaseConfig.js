import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB6EASkCL3nO3t1P0en2yTSKE8KrKlH-tc",
  authDomain: "petpartner-df96d.firebaseapp.com",
  projectId: "petpartner-df96d",
  storageBucket: "petpartner-df96d.appspot.com",
  messagingSenderId: "1512399079",
  appId: "1:1512399079:web:a63f681aaca2b400cf4242",
  measurementId: "G-6108193ENF"
};


const app = initializeApp(firebaseConfig);


export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);