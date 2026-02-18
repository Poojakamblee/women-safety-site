"use client";

import { useState, useEffect } from 'react';
import db from './firebase'; 
import { ref, set } from "firebase/database";

export default function WomenSafetyApp() {
  const [status, setStatus] = useState("System Active");
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [battery, setBattery] = useState<number | null>(null);
  const [userId] = useState(() => "User-" + Math.floor(1000 + Math.random() * 9000));
  
  // 1. MULTI-CONTACT STATE
  const [contacts, setContacts] = useState<string[]>([]);
  const [newContact, setNewContact] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("shesafe_contacts");
    if (saved) setContacts(JSON.parse(saved));
    if (localStorage.getItem("shesafe_theme") === "dark") setDarkMode(true);
  }, []);

  const addContact = () => {
    if (newContact && !contacts.includes(newContact)) {
      const updated = [...contacts, newContact];
      setContacts(updated);
      localStorage.setItem("shesafe_contacts", JSON.stringify(updated));
      setNewContact("");
    }
  };

  const removeContact = (num: string) => {
    const updated = contacts.filter(c => c !== num);
    setContacts(updated);
    localStorage.setItem("shesafe_contacts", JSON.stringify(updated));
  };

  const triggerSOS = () => {
    if (contacts.length === 0) {
      alert("Please add at least one contact!");
      setShowSettings(true);
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ lat: latitude, lng: longitude });
        setStatus("SOS SENT TO ALL");

        // Update Firebase
        set(ref(db, `alerts/${userId}`), {
          location: { lat: latitude, lng: longitude },
          status: "EMERGENCY",
          time: new Date().toLocaleString(),
          battery: battery || 100,
          userId: userId
        });

        // SMS Logic for Multiple Numbers
        const mapLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
        const message = encodeURIComponent(`🚨 SOS! Help me. Location: ${mapLink}`);
        
        // On mobile, joining with commas triggers a group text or multi-send
        const numbers = contacts.join(",");
        window.location.href = `sms:${numbers}?body=${message}`;
      });
    }
  };

  return (
    <main className={`min-h-screen p-4 transition-colors duration-500 ${darkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Header */}
      <div className="max-w-md mx-auto flex justify-between py-4">
        <h1 className="text-2xl font-black text-red-600">SHESAFE</h1>
        <button onClick={() => setShowSettings(!showSettings)} className="text-xs font-bold uppercase underline">
          {showSettings ? "Close Settings" : "Manage Contacts"}
        </button>
      </div>

      <div className="max-w-md mx-auto flex flex-col items-center">
        
        {/* SETTINGS PANEL */}
        {showSettings && (
          <div className={`w-full p-4 rounded-3xl mb-6 border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <h2 className="text-xs font-bold uppercase mb-3 text-slate-400">Trusted Contacts ({contacts.length})</h2>
            <div className="flex gap-2 mb-4">
              <input 
                type="tel" value={newContact} onChange={(e) => setNewContact(e.target.value)}
                placeholder="+91..." className="flex-1 p-2 rounded-xl bg-slate-100 text-black outline-none"
              />
              <button onClick={addContact} className="bg-blue-600 text-white px-4 rounded-xl text-sm">+</button>
            </div>
            <div className="space-y-2">
              {contacts.map(num => (
                <div key={num} className="flex justify-between items-center bg-slate-100 p-2 rounded-lg text-black text-sm">
                  <span>{num}</span>
                  <button onClick={() => removeContact(num)} className="text-red-500 font-bold">X</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SOS BUTTON */}
        <button onClick={triggerSOS} className="w-60 h-60 bg-red-600 rounded-full shadow-2xl active:scale-90 transition-all border-[10px] border-red-100 flex items-center justify-center mb-10">
          <span className="text-white text-5xl font-black italic">SOS</span>
        </button>

        {/* EMERGENCY ACTIONS */}
        <div className="w-full grid grid-cols-2 gap-4 mb-6">
          <a href="tel:100" className="bg-blue-900 text-white py-4 rounded-2xl font-black text-center shadow-lg">🚨 POLICE (100)</a>
          <a href="tel:112" className="bg-slate-800 text-white py-4 rounded-2xl font-black text-center shadow-lg">🛡️ HELPLINE (112)</a>
        </div>

        <button onClick={() => set(ref(db, `alerts/${userId}`), null)} className="w-full bg-green-500 text-white py-4 rounded-2xl font-bold mb-4">
          ✅ I AM SAFE
        </button>

        <div className={`w-full p-3 rounded-2xl text-center text-sm font-bold ${darkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
          {status}
        </div>
      </div>
    </main>
  );
}