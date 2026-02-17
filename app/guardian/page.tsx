"use client";

import { useState, useEffect } from 'react';
import db from '../firebase'; 
import { ref, onValue } from "firebase/database";

export default function GuardianDashboard() {
  // Added <any> and specific types to stop VS Code errors
  const [alertData, setAlertData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const alertRef = ref(db, 'alerts/user1');

    const unsubscribe = onValue(alertRef, (snapshot) => {
      if (snapshot.exists()) {
        setAlertData(snapshot.val());
      } else {
        setAlertData(null);
      }
      setLoading(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-white font-bold animate-pulse">CONNECTING TO SECURE FEED...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-900 text-white p-6 font-sans">
      <h1 className="text-xl font-black text-red-500 mb-6">GUARDIAN DASHBOARD</h1>

      {!alertData ? (
        <div className="bg-slate-800 p-8 rounded-3xl text-center border border-slate-700">
          <p className="text-slate-400">No active alerts. System is monitoring.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className={`p-6 rounded-3xl border-2 ${alertData.status === 'EMERGENCY' ? 'bg-red-950 border-red-600' : 'bg-green-950 border-green-600'}`}>
            <p className="text-xs font-black uppercase tracking-widest opacity-70">Current Status</p>
            <h2 className="text-3xl font-black mt-1">{alertData.status || 'ACTIVE'}</h2>
            <p className="text-sm mt-2 font-mono opacity-80">Last Updated: {alertData.time}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Battery</p>
              <p className="text-xl font-bold">{alertData.battery}%</p>
            </div>
            <a 
              href={`https://www.google.com/maps?q=${alertData.location?.lat},${alertData.location?.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 p-4 rounded-2xl flex flex-col items-center justify-center hover:bg-blue-500 transition-colors"
            >
              <span className="text-[10px] font-bold text-white">OPEN MAPS</span>
              <span className="text-lg">📍</span>
            </a>
          </div>
        </div>
      )}
    </main>
  );
}