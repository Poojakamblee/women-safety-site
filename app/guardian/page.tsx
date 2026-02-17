"use client";

import { useState, useEffect } from "react";
import db from "../firebase";
import { ref, onValue } from "firebase/database";

export default function GuardianDashboard() {
  const [alerts, setAlerts] = useState<any>(null);

  useEffect(() => {
    // Listen to the entire 'alerts' folder instead of just 'user1'
    const alertsRef = ref(db, "alerts");
    return onValue(alertsRef, (snapshot) => {
      setAlerts(snapshot.val());
    });
  }, []);

  const activeIds = alerts ? Object.keys(alerts) : [];

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <h1 className="text-red-500 font-black text-3xl mb-8">GUARDIAN COMMAND CENTER</h1>

      {activeIds.length === 0 ? (
        <div className="border-2 border-dashed border-slate-800 rounded-3xl p-20 text-center text-slate-500 font-bold uppercase">
          No Active Emergencies
        </div>
      ) : (
        <div className="grid gap-6">
          {activeIds.map((id) => (
            <div key={id} className="bg-slate-900 border-l-8 border-red-600 rounded-2xl p-6 shadow-2xl">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-black">{id}</h2>
                  <p className="text-red-400 text-xs font-bold uppercase">STATUS: EMERGENCY</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500 font-mono">{alerts[id].time}</p>
                  <p className="text-green-500 font-bold text-sm">Battery: {alerts[id].battery}%</p>
                </div>
              </div>
              <div className="flex gap-4">
                <a
                  href={`http://maps.google.com/?q=${alerts[id].location.lat},${alerts[id].location.lng}`}
                  target="_blank"
                  className="flex-1 bg-blue-600 text-center py-4 rounded-xl font-bold hover:bg-blue-700"
                >
                  📍 OPEN LIVE MAP
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}