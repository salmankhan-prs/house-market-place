// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAJbkKgt8xZQbR0k2zv3kbHSxlGWTul05Y",
  authDomain: "house-marketplace-app-8fc0c.firebaseapp.com",
  projectId: "house-marketplace-app-8fc0c",
  storageBucket: "house-marketplace-app-8fc0c.appspot.com",
  messagingSenderId: "486835134183",
  appId: "1:486835134183:web:b4369a1dd06553acf6cc42",
};

// Initialize Firebase
initializeApp(firebaseConfig);
export const db = getFirestore();
