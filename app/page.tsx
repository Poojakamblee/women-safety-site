"use client";

import { useState, useEffect } from 'react';
import db from './firebase'; 
import { ref, set } from "firebase/database";

export default function WomenSafetyApp() {
  const [status, setStatus] = useState("System Active");
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [battery, setBattery] = useState<number | null>(null);
  const [userId] = useState(() => "User-" + Math.floor(1000 + Math.random() * 9000));
  const [trustedNumber, setTrustedNumber] = useState("");
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    const savedNumber = localStorage.getItem("shesafe_contact");
    if (savedNumber) setTrustedNumber(savedNumber);
  }, []);

  const saveContact = () => {
    localStorage.setItem("shesafe_contact", trustedNumber);
    setShowInput(false);
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
      setShowInput(true);
      return;
    }
    setStatus("Fetching Location...");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setLocation({ lat: latitude, lng: longitude });
          setStatus("ALERT SENT!");
          
          set(ref(db, `alerts/${userId}`), {
            location: { lat: latitude, lng: longitude },
            status: "EMERGENCY",
            time: new Date().toLocaleString(),
            battery: battery || 100,
            userId: userId
          });

          const mapLink = `http://maps.google.com/?q=${latitude},${longitude}`;
          const message = `🚨 SOS! I need help. My live location: ${mapLink}. Battery: ${battery}%`;
          window.location.href = `sms:${trustedNumber}?body=${encodeURIComponent(message)}`;
        },
        () => setStatus("Error: Enable GPS")
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
      <div className="w-full max-w-md py-6">
        <h1 className="text-2xl font-black text-red-600 tracking-tighter">SHESAFE</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md">
        {/* SOS BUTTON */}
        <div className="relative mb-10">
          <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20"></div>
          <button 
            onClick={triggerSOS}
            className="relative w-64 h-64 bg-red-600 rounded-full border-[12px] border-red-100 shadow-2xl active:scale-95 transition-all flex items-center justify-center"
          >
            <span className="text-white text-6xl font-black">SOS</span>
          </button>
        </div>

        {/* TRUSTED CONTACT AREA */}
        <div className="w-full bg-white p-4 rounded-3xl shadow-md border border-slate-100 mb-6">
          {!showInput ? (
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Target Contact:</p>
                <p className="font-bold text-slate-800">{trustedNumber || "No Number Set"}</p>
              </div>
              <button onClick={() => setShowInput(true)} className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-xs font-bold uppercase">Edit</button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input type="tel" placeholder="Enter Number" value={trustedNumber} onChange={(e) => setTrustedNumber(e.target.value)} className="flex-1 bg-slate-100 p-3 rounded-xl font-bold outline-none" />
              <button onClick={saveContact} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest">Save</button>
            </div>
          )}
        </div>

        {/* EMERGENCY ACTION BUTTONS */}
        <div className="w-full grid grid-cols-2 gap-4 mb-6">
          <button 
            onClick={clearSOS}
            className="bg-green-500 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-green-600 active:scale-95 transition-all text-sm uppercase tracking-tighter"
          >
            ✅ I AM SAFE
          </button>
          
          <a 
            href="tel:112"
            className="bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-black active:scale-95 transition-all text-sm uppercase tracking-tighter flex items-center justify-center"
          >
            🚨 CALL 112
          </a>
        </div>

        <div className="w-full bg-slate-200 p-3 rounded-2xl text-center">
          <p className="text-sm font-bold text-slate-600">{status}</p>
        </div>
      </div>
    </main>
  );
}