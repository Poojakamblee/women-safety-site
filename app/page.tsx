"use client";

import { useState, useEffect } from 'react';
import db from './firebase'; 
import { ref, set } from "firebase/database";

export default function WomenSafetyApp() {
  const [status, setStatus] = useState("System Active");
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [battery, setBattery] = useState<number | null>(null);
  
  // 1. DYNAMIC USER ID: Random ID so multiple users show up on one dashboard
  const [userId] = useState(() => "User-" + Math.floor(1000 + Math.random() * 9000));

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
          setLocation({ lat: latitude, lng: longitude });
          setStatus("ALERT SENT!");
          
          // 2. SEND TO FIREBASE: Using the dynamic userId
          set(ref(db, `alerts/${userId}`), {
            location: { lat: latitude, lng: longitude },
            status: "EMERGENCY",
            time: new Date().toLocaleString(),
            battery: battery || 100,
            userId: userId
          });

          // 3. SMS TRIGGER: Opens your phone's SMS app with a pre-filled link
          const message = `SOS! I need help. My location: http://maps.google.com/?q=${latitude},${longitude}`;
          window.location.href = `sms:+919999999999?body=${encodeURIComponent(message)}`;
        },
        () => setStatus("Error: Enable GPS")
      );
    }
  };

  // 4. "I'M SAFE" FUNCTION: Clears your alert from the database
  const clearSOS = () => {
    set(ref(db, `alerts/${userId}`), null); 
    setStatus("System Active - Safe");
    setLocation(null);
    alert("Guardian dashboard cleared. You are marked as Safe.");
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center p-4">
      <div className="w-full max-w-md flex justify-between items-center py-6">
        <h1 className="text-2xl font-black text-red-600">SHESAFE</h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase">ID: {userId}</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <button 
          onClick={triggerSOS}
          className="w-64 h-64 bg-red-600 rounded-full border-[12px] border-red-100 shadow-2xl active:scale-95 transition-all text-white text-6xl font-black"
        >
          SOS
        </button>

        {/* The New Safe Button */}
        <button 
          onClick={clearSOS}
          className="mt-8 bg-green-500 text-white px-10 py-3 rounded-full font-bold shadow-lg hover:bg-green-600 active:scale-95 transition-all"
        >
          ✅ I AM SAFE
        </button>

        <div className="mt-8 bg-white px-8 py-4 rounded-3xl shadow-xl text-center w-full max-w-sm">
          <p className="font-bold text-lg text-slate-800">{status}</p>
        </div>
      </div>
    </main>
  );
}