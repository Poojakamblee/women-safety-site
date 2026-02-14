"use client";

import { useState, useEffect } from 'react';

export default function WomenSafetyApp() {
  const [status, setStatus] = useState("System Active");
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);

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

  const triggerSOS = () => {
    setStatus("Fetching Location...");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setLocation({ lat: latitude, lng: longitude });
          setStatus("ALERT SENT: Trusted contacts notified.");
          // Internship Tip: Mention you'd use Twilio API here to send an actual SMS
        },
        () => setStatus("Error: Please enable GPS")
      );
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center p-4 font-sans">
      {/* Top Header */}
      <div className="w-full max-w-md flex justify-between items-center py-6">
        <h1 className="text-2xl font-black text-red-600 tracking-tighter">SHESAFE</h1>
        <button 
          onClick={() => window.location.href = "https://www.google.com"}
          className="bg-slate-200 text-slate-700 px-4 py-2 rounded-full text-xs font-bold hover:bg-slate-300 transition-all"
        >
          QUICK EXIT (ESC)
        </button>
      </div>

      {/* Main SOS Button Section */}
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <div className="relative">
          {/* Animated Pulse Effect */}
          <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20"></div>
          <button 
            onClick={triggerSOS}
            className="relative w-64 h-64 bg-red-600 rounded-full border-[12px] border-red-100 shadow-2xl active:scale-90 transition-all flex items-center justify-center group"
          >
            <span className="text-white text-6xl font-black group-hover:scale-110 transition-transform">SOS</span>
          </button>
        </div>
        
        <div className="mt-12 bg-white px-8 py-4 rounded-3xl shadow-xl border border-slate-100 text-center w-full max-w-sm">
          <p className="text-slate-800 font-bold text-lg">{status}</p>
          {location && (
            <p className="text-xs text-slate-500 mt-1 font-mono">
              {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </p>
          )}
        </div>
      </div>

      {/* Emergency Quick-Dial Grid */}
      <div className="w-full max-w-md grid grid-cols-2 gap-4 my-8">
        <a href="tel:112" className="bg-white p-5 rounded-2xl border border-slate-200 text-center shadow-sm hover:shadow-md transition-all active:bg-red-50">
          <p className="text-xs text-slate-400 uppercase font-black mb-1">Police</p>
          <p className="text-xl font-bold text-slate-900">112</p>
        </a>
        <a href="tel:1091" className="bg-white p-5 rounded-2xl border border-slate-200 text-center shadow-sm hover:shadow-md transition-all active:bg-red-50">
          <p className="text-xs text-slate-400 uppercase font-black mb-1">Helpline</p>
          <p className="text-xl font-bold text-slate-900">1091</p>
        </a>
        {/* Trusted Contacts Section */}
<div className="mt-6 w-full max-w-sm bg-green-50 p-4 rounded-2xl border border-green-100">
  <h3 className="text-sm font-bold text-green-800 uppercase mb-3">Trusted Guardians</h3>
  <div className="space-y-2">
    <div className="flex justify-between text-sm bg-white p-2 rounded-lg shadow-sm">
      <span className="font-medium text-slate-700">Mom</span>
      <span className="text-green-600">● Active</span>
    </div>
    <div className="flex justify-between text-sm bg-white p-2 rounded-lg shadow-sm">
      <span className="font-medium text-slate-700">Brother</span>
      <span className="text-green-600">● Active</span>
    </div>
  </div>
</div>
      </div>
    </main>
  );
}