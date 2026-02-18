"use client";

import { useState, useEffect } from 'react';
import db from './firebase'; 
import { ref, set } from "firebase/database";

export default function WomenSafetyApp() {
  const [status, setStatus] = useState("System Active");
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [battery, setBattery] = useState<number | null>(null);
  const [userId] = useState(() => "User-" + Math.floor(1000 + Math.random() * 9000));
  const [contacts, setContacts] = useState<string[]>([]);
  const [newContact, setNewContact] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("shesafe_contacts");
    if (saved) setContacts(JSON.parse(saved));
    if (localStorage.getItem("shesafe_theme") === "dark") setDarkMode(true);
    
    if ("getBattery" in navigator) {
      (navigator as any).getBattery().then((bat: any) => setBattery(Math.round(bat.level * 100)));
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("shesafe_theme", newMode ? "dark" : "light");
  };

  const addContact = () => {
    if (newContact && !contacts.includes(newContact)) {
      const updated = [...contacts, newContact];
      setContacts(updated);
      localStorage.setItem("shesafe_contacts", JSON.stringify(updated));
      setNewContact("");
    }
  };

  const triggerSOS = () => {
    if (contacts.length === 0) {
      alert("Add a contact first!");
      setShowSettings(true);
      return;
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ lat: latitude, lng: longitude });
        setStatus("SOS SENT TO ALL");
        set(ref(db, `alerts/${userId}`), {
          location: { lat: latitude, lng: longitude },
          status: "EMERGENCY",
          time: new Date().toLocaleString(),
          battery: battery || 100,
          userId: userId
        });
        const mapLink = `http://maps.google.com/?q=${latitude},${longitude}`;
        window.location.href = `sms:${contacts.join(",")}?body=${encodeURIComponent("SOS! Help me: " + mapLink)}`;
      });
    }
  };

  return (
    <main className={`min-h-screen transition-colors duration-500 flex flex-col items-center p-4 
      ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'}`}>
      
      {/* Header Area */}
      <div className={`w-full max-w-5xl flex justify-between items-center py-6 border-b mb-8 
        ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
        
        {/* Logo - Always Red, but adjusts brightness */}
        <h1 className={`text-3xl font-black tracking-tighter ${darkMode ? 'text-red-500' : 'text-red-600'}`}>
          SHESAFE
        </h1>

        <div className="flex gap-4 items-center">
          {/* Fixed Contrast Button */}
          <button 
            onClick={toggleTheme} 
            className={`text-[10px] font-bold uppercase px-3 py-2 rounded-lg transition-all
              ${darkMode ? 'bg-white text-black' : 'bg-slate-900 text-white'}`}
          >
            {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
          
          <button 
            onClick={() => setShowSettings(!showSettings)} 
            className={`text-[10px] font-bold uppercase underline ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}
          >
            Manage Contacts
          </button>
        </div>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* Left Side: SOS Controls */}
        <div className="flex flex-col items-center justify-center space-y-8">
          {showSettings && (
            <div className={`w-full p-6 rounded-3xl border shadow-xl ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <h2 className={`text-[10px] font-bold uppercase mb-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Trusted Contacts
              </h2>
              <div className="flex gap-2 mb-4">
                <input 
                  type="tel" 
                  value={newContact} 
                  onChange={(e) => setNewContact(e.target.value)} 
                  placeholder="Enter number" 
                  className={`flex-1 p-3 rounded-xl text-sm outline-none border
                    ${darkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-black border-slate-300'}`} 
                />
                <button onClick={addContact} className="bg-blue-600 text-white px-6 rounded-xl font-bold">+</button>
              </div>
              
              {/* Added Numbers with High Contrast */}
              <div className="flex flex-wrap gap-2">
                {contacts.map(num => (
                  <span key={num} className={`px-3 py-1 rounded-full text-xs font-bold flex gap-2 border
                    ${darkMode ? 'bg-slate-800 text-blue-400 border-slate-600' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                    {num} 
                    <button onClick={() => setContacts(contacts.filter(c => c !== num))} className="text-red-500 ml-1">×</button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <button 
            onClick={triggerSOS} 
            className={`w-72 h-72 rounded-full shadow-2xl active:scale-90 transition-all border-[12px] flex items-center justify-center
              ${darkMode ? 'bg-red-700 border-red-950' : 'bg-red-600 border-red-100'}`}
          >
            <span className="text-white text-7xl font-black italic">SOS</span>
          </button>

          <div className="w-full grid grid-cols-2 gap-4">
            <a href="tel:100" className="bg-blue-700 text-white py-5 rounded-2xl font-black text-center shadow-lg">POLICE (100)</a>
            <a href="tel:112" className={`py-5 rounded-2xl font-black text-center shadow-lg 
              ${darkMode ? 'bg-slate-100 text-black' : 'bg-slate-900 text-white'}`}>HELPLINE (112)</a>
          </div>

          <button 
            onClick={() => set(ref(db, `alerts/${userId}`), null)} 
            className="w-full bg-green-500 text-white py-5 rounded-2xl font-black shadow-lg"
          >
            I AM SAFE
          </button>
          
          <div className={`w-full p-4 rounded-2xl text-center font-bold border transition-all
            ${darkMode ? 'bg-slate-900 text-slate-100 border-slate-700' : 'bg-slate-100 text-slate-900 border-slate-200'}`}>
            {status}
          </div>
        </div>

        {/* Right Side: Information Panel */}
        <div className="hidden lg:flex flex-col gap-6">
          <div className={`p-8 rounded-3xl border ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
            <h3 className="text-xl font-black mb-4">Safety Guide</h3>
            <ul className={`space-y-4 text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              <li>• Your ID: <span className="font-bold text-red-500 underline">{userId}</span></li>
              <li>• Battery Level: <span className="text-green-500 font-bold">{battery}%</span></li>
              <li>• Ensure GPS is on for accurate tracking.</li>
            </ul>
          </div>
          <div className={`p-8 rounded-3xl border border-dashed ${darkMode ? 'border-slate-700' : 'border-slate-300'}`}>
             <p className={`text-center text-[10px] font-bold uppercase tracking-widest py-12 
               ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>
               Live Map Feed Active during SOS
             </p>
          </div>
        </div>
      </div>
    </main>
  );
}