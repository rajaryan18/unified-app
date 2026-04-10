"use client";

import React from "react";
import { X, ArrowLeft, BarChart3 } from "lucide-react";
import { Charts } from "./Charts";

interface ChartsModalProps { isOpen: boolean; onClose: () => void; }

export const ChartsModal: React.FC<ChartsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col">
      <div className="bg-white border-b border-zinc-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-500 hover:text-black flex items-center gap-2 group">
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold text-sm hidden sm:inline">Back to Dashboard</span>
          </button>
          <div className="w-px h-6 bg-zinc-200 hidden sm:block"></div>
          <div className="flex items-center gap-2">
            <BarChart3 size={20} className="text-black" />
            <h2 className="text-lg font-black uppercase tracking-wider text-black">Performance Analytics</h2>
          </div>
        </div>
        <button onClick={onClose} className="p-2 bg-zinc-100 hover:bg-zinc-200 rounded-full transition-colors text-zinc-500 hover:text-black"><X size={20} /></button>
      </div>
      <div className="flex-1 overflow-y-auto bg-[#FAFAFA] p-6 custom-scrollbar">
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Charts hideExpand={true} />
          </div>
        </div>
      </div>
    </div>
  );
};
