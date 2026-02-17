"use client";

import { useState, useEffect } from "react";
import db from "../firebase";
import { ref, onValue } from "firebase/database";

export default function GuardianDashboard() {
  const [alerts, setAlerts] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const alertsRef = ref(db, "alerts");

    // Listen for ALL changes in the alerts folder
    const unsubscribe = onValue(alertsRef, (snapshot) => {
      const data = snapshot.val();
      setAlerts(data || {}); // Update state with all active alerts
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Convert the object of alerts into an array for easy mapping
  const activeAlerts = Object.keys(alerts);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <p className="animate-pulse font-mono tracking-widest">CONNECTING TO SECURE FEED...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 font-sans text-white">
      <h1 className="text-red-500 font-black text-3xl mb-8 tracking-tighter">
        GUARDIAN COMMAND CENTER
      </h1>

      {activeAlerts.length === 0 ? (
        <div className="border-2 border-dashed border-slate-800 rounded-3xl p-20 text-center">
          <p className="text-slate-500 font-bold uppercase tracking-widest">No Active Emergencies</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {activeAlerts.map((id) => {
            const alert = alerts[id];
            return (
              <div key={id} className="bg-slate-900 border-l-8 border-red-600 rounded-2xl p-6 shadow-2xl animate-in fade-in slide-in-from-right duration-500">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-black">{id}</h2>
                    <p className="text-red-400 text-xs font-bold uppercase tracking-widest">STATUS: {alert.status}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 font-mono">{alert.time}</p>
                    <p className="text-green-500 font-bold text-sm">Battery: {alert.battery}%</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <a
                    href={`https://www.google.com/maps?q=${alert.location.lat},${alert.location.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-center py-4 rounded-xl font-bold transition-colors"
                  >
                    📍 OPEN LIVE MAP
                  </a>
                  <a
                    href={`tel:${alert.phone || ""}`} // Will work if you add a phone field
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-center py-4 rounded-xl font-bold transition-colors"
                  >
                    📞 CALL USER
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}