"use client";

import { useState, useEffect } from 'react';
import db from './firebase'; 
import { ref, set } from "firebase/database";

export default function WomenSafetyApp() {
  const [status, setStatus] = useState("System Active");
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [battery, setBattery] = useState<number | null>(null);
  const [userId] = useState(() => "User-" + Math.floor(1000 + Math.random() * 9000));
  
  // New State for the Trusted Contact
  const [trustedNumber, setTrustedNumber] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Load the saved number from the phone's memory when the app starts
  useEffect(() => {
    const savedNumber = localStorage.getItem("shesafe_contact");
    if (savedNumber) {
      setTrustedNumber(savedNumber);
    } else {
      setIsEditing(true); // Ask for a number if none is saved
    }
  }, []);

  const saveContact = () => {
    localStorage.setItem("shesafe_contact", trustedNumber);
    setIsEditing(false);
  };

  useEffect(() => {
    if ("getBattery" in navigator) {
      (navigator as any).getBattery().then((bat: any) => {
        setBattery(Math.round(bat.level * 100));
      });
    }
  }, []);

  const triggerSOS = () => {
    if (!trustedNumber) {
      alert("Please add a trusted contact number first!");
      setIsEditing(true);
      return;
    }

    setStatus("Fetching Location...");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const currentBattery = battery || 100;
          
          setLocation({ lat: latitude, lng: longitude });
          setStatus("ALERT SENT!");
          
          // 1. UPDATE FIREBASE
          set(ref(db, `alerts/${userId}`), {
            location: { lat: latitude, lng: longitude },
            status: "EMERGENCY",
            time: new Date().toLocaleString(),
            battery: currentBattery,
            userId: userId
          });

          // 2. DYNAMIC SMS TRIGGER
          const mapLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
          const message = `🚨 SOS! I need help. My live location: ${mapLink}. Battery: ${currentBattery}%`;
          
          window.location.href = `sms:${trustedNumber}?body=${encodeURIComponent(message)}`;
        },
        () => setStatus("Error: Please enable GPS")
      );
    }
  };

  const clearSOS = () => {
    set(ref(db, `alerts/${userId}`), null);
    setStatus("System Active - Safe");
    setLocation(null);
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center p-4 font-sans text-slate-900">
      {/* Header */}
      <div className="w-full max-w-md flex justify-between items-center py-6">
        <h1 className="text-2xl font-black text-red-600 tracking-tighter">SHESAFE</h1>
        <button 
          onClick={() => setIsEditing(true)}
          className="text-[10px] font-bold text-blue-600 uppercase border-b border-blue-200"
        >
          ⚙️ Settings
        </button>
      </div>

      {/* Contact Configuration UI */}
      {isEditing && (
        <div className="w-full max-w-md bg-white p-6 rounded-3xl shadow-xl mb-6 border-2 border-blue-100 animate-in fade-in zoom-in duration-300">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Set Trusted Contact</h2>
          <input 
            type="tel"
            placeholder="+919999999999"
            value={trustedNumber}
            onChange={(e) => setTrustedNumber(e.target.value)}
            className="w-full p-4 bg-slate-100 rounded-2xl mb-4 font-bold text-lg outline-none focus:ring-2 ring-blue-400 transition-all"
          />
          <button 
            onClick={saveContact}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg active:scale-95 transition-all"
          >
            SAVE CONTACT
          </button>
        </div>
      )}

      {/* SOS Button Section */}
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20"></div>
          <button 
            onClick={triggerSOS}
            className="relative w-64 h-64 bg-red-600 rounded-full border-[12px] border-red-100 shadow-2xl active:scale-95 transition-all flex items-center justify-center"
          >
            <span className="text-white text-6xl font-black">SOS</span>
          </button>
        </div>

        <button 
          onClick={clearSOS}
          className="bg-green-500 text-white px-12 py-4 rounded-full font-bold shadow-lg hover:bg-green-600 active:scale-95 transition-all mb-8"
        >
          ✅ I AM SAFE
        </button>

        <div className="bg-white px-8 py-4 rounded-3xl shadow-md border border-slate-100 text-center w-full max-w-sm">
          <p className="text-slate-800 font-bold">{status}</p>
          {trustedNumber && !isEditing && (
            <p className="text-[10px] text-slate-400 mt-1 uppercase">SMS Target: {trustedNumber}</p>
          )}
        </div>
      </div>
    </main>
  );
}