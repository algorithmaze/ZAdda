import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyBBosMTOA6ax6DQS67kSfrjImYTzoDSm1g", // You'll get this by adding a Web App in your Firebase project settings!
  authDomain: "zadda-ba5a0.firebaseapp.com",
  projectId: "zadda-ba5a0",
  storageBucket: "zadda-ba5a0.firebasestorage.app", // This is derived from your project ID
  messagingSenderId: "1037242909778", // This is your Project Number
  appId: "YOUR_WEB_APP_APP_ID", // You'll get this by adding a Web App in your Firebase project settings!
  databaseURL: "https://zadda-ba5a0-default-rtdb.asia-southeast1.firebasedatabase.app",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const rtdb = getDatabase(app);
export const functions = getFunctions(app);
