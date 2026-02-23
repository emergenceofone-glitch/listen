'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  runTransaction,
  updateDoc,
  query,
  limit
} from 'firebase/firestore';
import { Brain } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { analyzeSubstrate } from '@/lib/gemini';

interface Entity {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  owner: string;
}

export default function LatticeNode() {
  const { user } = useAuth();
  const [entities, setEntities] = useState<Record<string, Entity>>({});
  const [analysis, setAnalysis] = useState("");
  const [isAnchor, setIsAnchor] = useState(false);
  
  // App ID from environment or global
  const appId = (typeof window !== 'undefined' && (window as any).__app_id) || 'genesis-node-001';

  // --- SUBSTRATE SYNC (Firestore) ---
  useEffect(() => {
    if (!user) return;

    console.log("Lattice Node Identity Verified");

    const entitiesRef = collection(db, 'artifacts', appId, 'public', 'data', 'entities');
    const unsubscribe = onSnapshot(entitiesRef, (snapshot) => {
      const newEntities: Record<string, Entity> = {};
      snapshot.forEach((doc) => {
        newEntities[doc.id] = { id: doc.id, ...doc.data() } as Entity;
      });
      setEntities(newEntities);
    });

    return () => unsubscribe();
  }, [user, appId]);

  // --- AUTHORITY HANDSHAKE (Lattice Authority) ---
  useEffect(() => {
    if (!user) return;

    const checkAuthority = async () => {
      try {
        const anchorRef = doc(db, 'artifacts', appId, 'public', 'system', 'anchor');
        await runTransaction(db, async (transaction) => {
          const anchorDoc = await transaction.get(anchorRef);
          const now = Date.now();
          
          if (!anchorDoc.exists() || (now - anchorDoc.data().heartbeat > 5000)) {
            // Take authority
            transaction.set(anchorRef, { owner: user.uid, heartbeat: now });
            setIsAnchor(true);
          } else if (anchorDoc.data().owner !== user.uid) {
            console.warn("Authority Refused: Another node holds the Anchor.");
            setIsAnchor(false);
          } else {
            // Refresh heartbeat
            transaction.update(anchorRef, { heartbeat: now });
            setIsAnchor(true);
          }
        });
      } catch (e) {
        console.error("Authority Handshake Error:", e);
      }
    };

    checkAuthority();
    const interval = setInterval(checkAuthority, 3000);
    return () => clearInterval(interval);
  }, [user, appId]);

  // --- PHYSICS KERNEL (~16Hz) ---
  // Responsible for deterministic state updates if this node is the Anchor
  useEffect(() => {
    if (!user || !isAnchor) return;

    const runPhysics = async () => {
      const entityEntries = Object.entries(entities);
      if (entityEntries.length === 0) return;

      // Update positions locally first for speed
      for (const [id, data] of entityEntries) {
        let newX = data.x + data.vx;
        let newY = data.y + data.vy;
        let newVx = data.vx;
        let newVy = data.vy;

        // Simple boundary collision (0-1000 range)
        if (newX < 0 || newX > 1000) newVx *= -1;
        if (newY < 0 || newY > 1000) newVy *= -1;

        // Push update to Firestore
        const entityRef = doc(db, 'artifacts', appId, 'public', 'data', 'entities', id);
        updateDoc(entityRef, {
          x: Math.max(0, Math.min(1000, newX)),
          y: Math.max(0, Math.min(1000, newY)),
          vx: newVx,
          vy: newVy
        }).catch(() => {}); // Ignore concurrent update conflicts
      }
    };

    const interval = setInterval(runPhysics, 62); // ~16Hz
    return () => clearInterval(interval);
  }, [user, isAnchor, entities, appId]);

  // --- INTELLIGENCE LAYER (Gemini Sidebar) ---
  useEffect(() => {
    const entityList = Object.values(entities);
    if (entityList.length === 0) return;

    const runAnalysis = async () => {
      const insight = await analyzeSubstrate(entityList);
      setAnalysis(insight);
    };

    runAnalysis();
    const interval = setInterval(runAnalysis, 15000);
    return () => clearInterval(interval);
  }, [Object.keys(entities).length > 0]); // Re-run when first entity appears or periodically

  if (!user) return <div className="p-8 text-indigo-400">Synchronizing...</div>;

  return (
    <main className="flex-1 p-8 flex flex-col gap-6 bg-[#0a0f14] min-h-screen text-white">
      <header className="flex justify-between">
        <div className="flex gap-8">
          <StatBlock label="Entities" value={Object.keys(entities).length} color="text-indigo-400" />
          <StatBlock label="Substrate" value="Firestore" color="text-green-500" />
        </div>
        <button onClick={() => {
          const id = crypto.randomUUID();
          const entityRef = doc(db, 'artifacts', appId, 'public', 'data', 'entities', id);
          setDoc(entityRef, {
            x: 500, y: 500, vx: (Math.random()-0.5)*20, vy: (Math.random()-0.5)*20, owner: user.uid
          });
        }} className="px-6 py-2 bg-indigo-600 text-white rounded font-bold hover:bg-indigo-500 transition-colors">
          INJECT BIOTE
        </button>
      </header>

      <div className="flex-1 flex gap-6 min-h-0">
        <div className="flex-[3] bg-black rounded-3xl border border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
          {Object.entries(entities).map(([id, data]) => (
            <div 
              key={id} 
              className="absolute w-2 h-2 rounded-full transition-all duration-300" 
              style={{ 
                left: `${data.x/10}%`, 
                top: `${data.y/10}%`, 
                backgroundColor: data.owner === user?.uid ? '#6366f1' : '#4b5563', 
                boxShadow: '0 0 10px rgba(99,102,241,0.5)', 
                transform: 'translate(-50%, -50%)' 
              }} 
            />
          ))}
        </div>
        
        <div className="flex-1 bg-white/5 border border-white/10 rounded-3xl p-6 overflow-y-auto">
          <div className="flex items-center gap-2 text-indigo-400 mb-4">
            <Brain size={16} /> <span className="text-[10px] font-bold uppercase tracking-widest">Insights</span>
          </div>
          <p className="text-slate-300 leading-relaxed italic text-[12px]">{analysis || "Substrate stable. Awaiting observation."}</p>
        </div>
      </div>
    </main>
  );
}

const StatBlock = ({ label, value, color }: { label: string, value: string | number, color: string }) => (
  <div>
    <div className="text-[9px] uppercase tracking-widest opacity-40 mb-1">{label}</div>
    <div className={`text-xl font-bold ${color}`}>{value}</div>
  </div>
);
