import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBktWfHfWO55E5sFkQXtj lD05Gi8MtPxPo",
  authDomain: "shesafe-alerts.firebaseapp.com",
  projectId: "shesafe-alerts",
  storageBucket: "shesafe-alerts.firebasestorage.app",
  messagingSenderId: "1063118514750",
  appId: "1:1063118514750:web:3df30469ee8f37479d3f6f",
  measurementId: "G-TGVLGW65WM"
};

// Safe initialization for Next.js/Vercel
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getDatabase(app);

// Exporting as default to match your page.tsx import
export default db;