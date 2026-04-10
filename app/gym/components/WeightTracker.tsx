"use client";

import React, { useState } from "react";
import { Scale, Check, Loader2, Plus, ArrowLeft } from "lucide-react";
import { useWeight } from "../hooks/useWeight";

export const WeightTracker: React.FC = () => {
  const [weight, setWeight] = useState<string>("");
  const [isSaved, setIsSaved] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const { saveWeight, isLoading, latestWeight } = useWeight();

  const handleSave = async () => {
    if (!weight || isLoading) return;
    const numericWeight = parseFloat(weight);
    if (isNaN(numericWeight)) return;

    const success = await saveWeight(numericWeight);
    if (success) {
      setIsSaved(true);
      setTimeout(() => { setIsSaved(false); setShowInput(false); }, 1500);
      setWeight("");
    }
  };

  return (
    <div className="bg-white border border-zinc-100 rounded-3xl p-4 shadow-sm flex flex-col min-h-[120px] justify-center transition-all">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Scale size={18} className="text-zinc-500" />
          <h2 className="text-sm font-bold text-black uppercase tracking-wider">Body Weight</h2>
        </div>
        {!showInput && (
          <button
            onClick={() => setShowInput(true)}
            className="px-2 py-1 bg-zinc-100 text-black rounded-lg hover:bg-zinc-200 transition-colors flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider"
          >
            <Plus size={12} /> New Log
          </button>
        )}
      </div>

      {!showInput ? (
        <div className="flex flex-col items-center justify-center py-1">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black text-black tracking-tighter">{latestWeight ? latestWeight : "--.-"}</span>
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">kg</span>
          </div>
          <p className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest mt-0.5">Last recorded</p>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <button onClick={() => setShowInput(false)} className="p-3 text-zinc-400 hover:text-black transition-colors" title="Back">
            <ArrowLeft size={20} />
          </button>
          <div className="relative flex-1">
            <input
              type="number"
              value={weight}
              autoFocus
              onChange={(e) => setWeight(e.target.value)}
              placeholder="0.0"
              step="0.1"
              className="w-full bg-zinc-50 rounded-2xl px-4 py-4 text-2xl font-black text-center outline-none focus:ring-2 ring-black transition-all"
              style={{ MozAppearance: "textfield" }}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">kg</span>
          </div>
          <button
            onClick={handleSave}
            disabled={isLoading || !weight}
            className="h-[64px] w-[64px] bg-black text-white rounded-2xl flex items-center justify-center hover:bg-zinc-800 transition-all active:scale-95 shrink-0 disabled:opacity-50"
          >
            {isLoading ? <Loader2 size={24} className="animate-spin" /> : isSaved ? <Check size={24} className="text-green-400" /> : <span className="font-bold text-sm uppercase">Save</span>}
          </button>
        </div>
      )}
    </div>
  );
};
