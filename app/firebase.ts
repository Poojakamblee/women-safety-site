import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBktWfHfWO55E5sFkQXtj lD05Gi8MtPxPo",
  authDomain: "shesafe-alerts.firebaseapp.com",
  projectId: "shesafe-alerts",
  storageBucket: "shesafe-alerts.firebasestorage.app",
  messagingSenderId: "1063118514750",
  appId: "1:1063118514750:web:3df30469ee8f37479d3f6f"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);