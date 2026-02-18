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
  
  // DARK MODE STATE
  const [darkMode, setDarkMode] = useState(false);

  // Load preferences (Contact & Theme)
  useEffect(() => {
    const savedNumber = localStorage.getItem("shesafe_contact");
    if (savedNumber) setTrustedNumber(savedNumber);

    const savedTheme = localStorage.getItem("shesafe_theme");
    if (savedTheme === "dark") setDarkMode(true);
  }, []);

  // Toggle Theme Function
  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("shesafe_theme", newMode ? "dark" : "light");
  };

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
      alert("Please add a trusted contact first!");
      setShowInput(true);
      return;
    }
    setStatus("Fetching Location...");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
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
      });
    }
  };

  const clearSOS = () => {
    set(ref(db, `alerts/${userId}`), null);
    setStatus("System Active - Safe");
    setLocation(null);
  };

  return (
    // Dynamic background and text colors based on darkMode state
    <main className={`min-h-screen transition-colors duration-500 flex flex-col items-center p-4 font-sans 
      ${darkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Header */}
      <div className="w-full max-w-md flex justify-between items-center py-6">
        <h1 className={`text-2xl font-black tracking-tighter ${darkMode ? 'text-red-500' : 'text-red-600'}`}>SHESAFE</h1>
        
        {/* THEME TOGGLE BUTTON */}
        <button 
          onClick={toggleTheme}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all
            ${darkMode ? 'bg-slate-800 text-yellow-400' : 'bg-slate-200 text-slate-600'}`}
        >
          {darkMode ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md">
        {/* SOS BUTTON */}
        <div className="relative mb-10">
          <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20"></div>
          <button 
            onClick={triggerSOS}
            className={`relative w-64 h-64 rounded-full border-[12px] shadow-2xl active:scale-95 transition-all flex items-center justify-center
              ${darkMode ? 'bg-red-700 border-slate-800' : 'bg-red-600 border-red-100'}`}
          >
            <span className="text-white text-6xl font-black">SOS</span>
          </button>
        </div>

        {/* TRUSTED CONTACT AREA */}
        <div className={`w-full p-4 rounded-3xl shadow-md border mb-6 transition-colors
          ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
          {!showInput ? (
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Target Contact:</p>
                <p className="font-bold">{trustedNumber || "No Number Set"}</p>
              </div>
              <button onClick={() => setShowInput(true)} className="text-blue-500 text-xs font-bold uppercase">Edit</button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input 
                type="tel" 
                placeholder="Enter Number" 
                value={trustedNumber} 
                onChange={(e) => setTrustedNumber(e.target.value)} 
                className={`flex-1 p-3 rounded-xl font-bold outline-none ${darkMode ? 'bg-slate-800 text-white' : 'bg-slate-100'}`} 
              />
              <button onClick={saveContact} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase">Save</button>
            </div>
          )}
        </div>

        {/* EMERGENCY ACTION BUTTONS */}
        <div className="w-full grid grid-cols-2 gap-4 mb-6">
          <button 
            onClick={clearSOS}
            className="bg-green-500 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-green-600 active:scale-95 transition-all text-sm uppercase"
          >
            ✅ I AM SAFE
          </button>
          
          <a 
            href="tel:112"
            className={`py-4 rounded-2xl font-bold shadow-lg active:scale-95 transition-all text-sm uppercase flex items-center justify-center
              ${darkMode ? 'bg-white text-black' : 'bg-slate-900 text-white'}`}
          >
            🚨 CALL 112
          </a>
        </div>

        <div className={`w-full p-3 rounded-2xl text-center transition-colors
          ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-600'}`}>
          <p className="text-sm font-bold">{status}</p>
        </div>
      </div>
    </main>
  );
}