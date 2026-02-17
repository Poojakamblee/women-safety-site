"use client";

import { useState, useEffect } from 'react';
import db from './firebase'; 
import { ref, set, onValue } from "firebase/database";

export default function WomenSafetyApp() {
  const [status, setStatus] = useState("System Active");
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [battery, setBattery] = useState<number | null>(null);
  
  // Multi-User Support: Assigns a random ID so users don't overwrite each other
  const [userId] = useState(() => "User-" + Math.floor(1000 + Math.random() * 9000));

  // FEATURE: Discreet Mode (Hides the site if 'Esc' is pressed)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        window.location.href = "https://www.google.com/search?q=weather+today";
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // FEATURE: Battery Monitoring
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
          setStatus("ALERT SENT: Trusted contacts notified.");
          
          // 1. UPDATE FIREBASE (Dynamic path using userId)
          set(ref(db, `alerts/${userId}`), {
            location: { lat: latitude, lng: longitude },
            status: "EMERGENCY",
            time: new Date().toLocaleString(),
            battery: currentBattery,
            userId: userId
          });

          // 2. SMS TRIGGER (The "Easy Way")
          // Replace +919999999999 with your Guardian's actual number
          const message = `SOS! I need help. Location: https://www.google.com/maps?q=${latitude},${longitude}`;
          window.location.href = `sms:+919999999999?body=${encodeURIComponent(message)}`;
        },
        () => setStatus("Error: Please enable GPS")
      );
    }
  };

  const clearSOS = () => {
    // This removes your alert from the database
    set(ref(db, `alerts/${userId}`), null); 
    
    setStatus("System Active - Safe");
    setLocation(null);
    alert("Guardian notified that you are safe.");
  };

  const triggerFakeCall = () => {
    setStatus("Fake Call incoming in 5s...");
    setTimeout(() => {
      alert("📞 INCOMING CALL: Mom\n\n(This allows you to leave an uncomfortable situation)");
      setStatus("System Active");
    }, 5000);
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
        <button 
          onClick={() => window.location.href = "https://www.google.com"}
          className="bg-slate-200 text-slate-700 px-4 py-2 rounded-full text-xs font-bold hover:bg-slate-300 transition-all"
        >
          QUICK EXIT (ESC)
        </button>
      </div>

      {/* SOS Section */}
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <div className="relative">
          <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20"></div>
          <button 
            onClick={triggerSOS}
            className="relative w-64 h-64 bg-red-600 rounded-full border-[12px] border-red-100 shadow-2xl active:scale-95 transition-all flex items-center justify-center group"
          >
            <span className="text-white text-6xl font-black group-hover:scale-110 transition-transform">SOS</span>
          </button>
        </div>
        
        {/* New "I'M SAFE" Button */}
        <button 
          onClick={clearSOS}
          className="mt-6 bg-green-500 text-white px-10 py-3 rounded-full font-bold shadow-lg hover:bg-green-600 active:scale-95 transition-all"
        >
          ✅ I AM SAFE
        </button>

        <div className="mt-8 bg-white px-8 py-4 rounded-3xl shadow-xl border border-slate-100 text-center w-full max-w-sm">
          <p className="text-slate-800 font-bold text-lg">{status}</p>
          {location && (
            <div className="mt-2 flex flex-col items-center">
              <p className="text-[10px] text-slate-400 font-mono">
                COORD: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </p>
            </div>
          )}
        </div>

        <button 
          onClick={triggerFakeCall}
          className="mt-6 text-slate-400 text-[10px] font-bold tracking-widest uppercase hover:text-red-500 transition-colors border-b border-slate-200"
        >
          Discreet Feature: Trigger Fake Call
        </button>
      </div>

      {/* Emergency Contacts Table */}
      <div className="w-full max-w-md grid grid-cols-2 gap-4 my-8">
        <a href="tel:112" className="bg-white p-5 rounded-2xl border border-slate-200 text-center shadow-sm hover:shadow-md transition-all active:bg-red-50">
          <p className="text-xs text-slate-400 uppercase font-black mb-1">Police</p>
          <p className="text-xl font-bold text-slate-900">112</p>
        </a>
        <a href="tel:1091" className="bg-white p-5 rounded-2xl border border-slate-200 text-center shadow-sm hover:shadow-md transition-all active:bg-red-50">
          <p className="text-xs text-slate-400 uppercase font-black mb-1">Helpline</p>
          <p className="text-xl font-bold text-slate-900">1091</p>
        </a>
      </div>

      <button 
        onClick={() => window.location.href = "/guardian"}
        className="mb-10 text-[10px] text-slate-300 hover:text-slate-500 font-bold tracking-widest"
      >
        ADMIN ACCESS
      </button>
    </main>
  );
}