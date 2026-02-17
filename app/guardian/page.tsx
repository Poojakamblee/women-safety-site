"use client";

import { useState, useEffect } from 'react';
import db from '../firebase'; 
import { ref, onValue } from "firebase/database";

export default function GuardianDashboard() {
  const [alertData, setAlertData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We point to the same 'alerts/user1' path you used in the main page
    const alertRef = ref(db, 'alerts/user1');

    // 'onValue' creates the live connection
    const unsubscribe = onValue(alertRef, (snapshot) => {
      const data = snapshot.val();
      setAlertData(data);
      setLoading(false);
    });

    return () => unsubscribe(); // Closes the connection when you leave the page
  }, []);

  if (loading) return <div className="p-10 text-center font-bold">Connecting to Secure Feed...</div>;

  return (
    <main className="min-h-screen bg-slate-900 text-white p-6 font-sans">
      <h1 className="text-xl font-black text-red-500 mb-6">GUARDIAN DASHBOARD</h1>

      {!alertData ? (
        <div className="bg-slate-800 p-8 rounded-3xl text-center border border-slate-700">
          <p className="text-slate-400">No active alerts. System is monitoring.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Status Card */}
          <div className={`p-6 rounded-3xl border-2 ${alertData.status === 'EMERGENCY' ? 'bg-red-950 border-red-600' : 'bg-green-950 border-green-600'}`}>
            <p className="text-xs font-black uppercase tracking-widest opacity-70">Current Status</p>
            <h2 className="text-3xl font-black mt-1">{alertData.status}</h2>
            <p className="text-sm mt-2 font-mono opacity-80">Last Updated: {alertData.time}</p>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Battery</p>
              <p className="text-xl font-bold">{alertData.battery}%</p>
            </div>
            <a 
              href={`https://www.google.com/maps?q=${alertData.location.lat},${alertData.location.lng}`}
              target="_blank"
              className="bg-blue-600 p-4 rounded-2xl flex flex-col items-center justify-center hover:bg-blue-500 transition-colors"
            >
              <span className="text-[10px] font-bold">OPEN IN MAPS</span>
              <span className="text-lg">📍</span>
            </a>
          </div>

          {/* Mini "Map" View (Visual Representation) */}
          <div className="bg-slate-800 h-64 rounded-3xl border border-slate-700 flex items-center justify-center relative overflow-hidden">
             <div className="absolute inset-0 opacity-20 bg-[url('https://www.google.com/maps/vt/pb=!1m4!1m3!1i10!2i512!3i512!2m3!1e0!2sm!3i407105969!3m8!2m3!1e0!2sm!3i407105969!5e1105!12m4!1e68!2m2!1sset!2sRoadmap!4e0!5m1!1f2')] bg-center"></div>
             <div className="relative z-10 text-center">
                <div className="w-4 h-4 bg-red-600 rounded-full mx-auto animate-ping mb-2"></div>
                <p className="text-xs font-mono">{alertData.location.lat.toFixed(4)}, {alertData.location.lng.toFixed(4)}</p>
                <p className="text-[10px] text-slate-500 mt-1 uppercase">User Location Identified</p>
             </div>
          </div>
        </div>
      )}
    </main>
  );
}