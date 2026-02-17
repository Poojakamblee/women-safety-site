"use client";

import { useState, useEffect } from 'react';
import db from './firebase'; 
import { ref, set } from "firebase/database";

export default function WomenSafetyApp() {
  const [status, setStatus] = useState("System Active");
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [battery, setBattery] = useState<number | null>(null);
  
  // DYNAMIC USER ID: Random ID so multiple users show up on one dashboard
  const [userId] = useState(() => "User-" + Math.floor(1000 + Math.random() * 9000));

  // Trusted Contact Number
  const TRUSTED_NUMBER = "+919076397124";

  useEffect(() => {
    if ("getBattery" in navigator) {
      (navigator as any).getBattery().then((bat: any) => {
        setBattery(Math.round(bat.level * 100));
      });
    }
  }, []);

  const triggerSOS = () => {
    setStatus("Fetching Location...");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const currentBattery = battery || 100;
          
          setLocation({ lat: latitude, lng: longitude });
          setStatus("ALERT SENT!");
          
          // 1. SEND TO FIREBASE: Using the dynamic userId
          set(ref(db, `alerts/${userId}`), {
            location: { lat: latitude, lng: longitude },
            status: "EMERGENCY",
            time: new Date().toLocaleString(),
            battery: currentBattery,
            userId: userId
          });

          // 2. SMS TRIGGER: Opens messaging app with your pre-filled number and link
          const mapLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
          const message = `🚨 SOS! I am in danger. My live location: ${mapLink}. Battery: ${currentBattery}%`;
          
          // This line triggers the actual SMS app on your phone
          window.location.href = `sms:${TRUSTED_NUMBER}?body=${encodeURIComponent(message)}`;
        },
        () => setStatus("Error: Please enable GPS")
      );
    }
  };

  // "I'M SAFE" FUNCTION: Clears your alert from the database
  const clearSOS = () => {
    set(ref(db, `alerts/${userId}`), null); 
    setStatus("System Active - Safe");
    setLocation(null);
    alert("Guardian dashboard cleared. You are marked as Safe.");
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center p-4 font-sans">
      {/* Header */}
      <div className="w-full max-w-md flex justify-between items-center py-6">
        <div>
          <h1 className="text-2xl font-black text-red-600 tracking-tighter">SHESAFE</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            ID: {userId} | Battery: {battery}%
          </p>
        </div>
      </div>

      {/* SOS Section */}
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <div className="relative">
          {/* Pulsing effect behind button */}
          <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20"></div>
          <button 
            onClick={triggerSOS}
            className="relative w-64 h-64 bg-red-600 rounded-full border-[12px] border-red-100 shadow-2xl active:scale-95 transition-all flex items-center justify-center group"
          >
            <span className="text-white text-6xl font-black group-hover:scale-110 transition-transform">SOS</span>
          </button>
        </div>
        
        {/* I'm Safe Button */}
        <button 
          onClick={clearSOS}
          className="mt-8 bg-green-500 text-white px-10 py-3 rounded-full font-bold shadow-lg hover:bg-green-600 active:scale-95 transition-all"
        >
          ✅ I AM SAFE
        </button>

        <div className="mt-8 bg-white px-8 py-4 rounded-3xl shadow-xl border border-slate-100 text-center w-full max-w-sm">
          <p className="text-slate-800 font-bold text-lg">{status}</p>
        </div>
      </div>

      {/* Bottom Information */}
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4">
        Trusted Contact: {TRUSTED_NUMBER}
      </p>
    </main>
  );
}