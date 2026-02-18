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
    <main className={`min-h-screen transition-colors duration-500 flex flex-col items-center p-4 ${darkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Header Area */}
      <div className="w-full max-w-5xl flex justify-between items-center py-6 border-b border-slate-200 dark:border-slate-800 mb-8">
        <h1 className="text-3xl font-black text-red-600 tracking-tighter">SHESAFE</h1>
        <div className="flex gap-4 items-center">
          <button onClick={toggleTheme} className="text-xs font-bold uppercase p-2 rounded-lg bg-slate-200 dark:bg-slate-800">
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button onClick={() => setShowSettings(!showSettings)} className="text-xs font-bold uppercase underline">
            Manage Contacts
          </button>
        </div>
      </div>

      {/* Main Content Grid: This fills the laptop screen better */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* Left Side: SOS Controls */}
        <div className="flex flex-col items-center justify-center space-y-8">
          {showSettings && (
            <div className={`w-full p-6 rounded-3xl border shadow-xl ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <h2 className="text-xs font-bold uppercase mb-4 opacity-50">Trusted Contacts</h2>
              <div className="flex gap-2 mb-4">
                <input type="tel" value={newContact} onChange={(e) => setNewContact(e.target.value)} placeholder="+91..." className="flex-1 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm outline-none" />
                <button onClick={addContact} className="bg-blue-600 text-white px-6 rounded-xl font-bold">+</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {contacts.map(num => (
                  <span key={num} className="bg-slate-200 dark:bg-slate-800 px-3 py-1 rounded-full text-xs font-bold flex gap-2">
                    {num} <button onClick={() => setContacts(contacts.filter(c => c !== num))} className="text-red-500">x</button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <button onClick={triggerSOS} className="w-72 h-72 bg-red-600 rounded-full shadow-2xl active:scale-90 transition-all border-[12px] border-red-100 dark:border-red-900 flex items-center justify-center">
            <span className="text-white text-7xl font-black italic">SOS</span>
          </button>

          <div className="w-full grid grid-cols-2 gap-4">
            <a href="tel:100" className="bg-blue-900 text-white py-5 rounded-2xl font-black text-center shadow-lg hover:bg-blue-800">POLICE (100)</a>
            <a href="tel:112" className="bg-slate-800 text-white py-5 rounded-2xl font-black text-center shadow-lg hover:bg-black">HELPLINE (112)</a>
          </div>

          <button onClick={() => set(ref(db, `alerts/${userId}`), null)} className="w-full bg-green-500 text-white py-5 rounded-2xl font-black shadow-lg hover:bg-green-600">I AM SAFE</button>
          <div className={`w-full p-4 rounded-2xl text-center font-bold border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>{status}</div>
        </div>

        {/* Right Side: Information Panel (Fills the empty laptop space) */}
        <div className="hidden lg:flex flex-col gap-6">
          <div className={`p-8 rounded-3xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <h3 className="text-xl font-black mb-4">Safety Guide</h3>
            <ul className="space-y-4 text-sm opacity-80 font-medium">
              <li>• Share your ID: <span className="font-bold text-red-500">{userId}</span> with your guardian.</li>
              <li>• Keep GPS active for high-accuracy tracking.</li>
              <li>• Your battery is currently at <span className="text-green-500">{battery}%</span>.</li>
              <li>• Press SOS if you feel followed or in immediate danger.</li>
            </ul>
          </div>

          <div className={`p-8 rounded-3xl border border-dashed ${darkMode ? 'border-slate-800' : 'border-slate-300'}`}>
            <p className="text-center text-xs font-bold uppercase tracking-widest opacity-40 py-12">
              Live Map Preview will appear here during active SOS
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}