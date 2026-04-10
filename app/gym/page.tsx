"use client";

import React, { useState } from "react";
import { Header } from "./components/Header";
import { WeeklyLog } from "./components/WeeklyLog";
import { WorkoutLogger } from "./components/WorkoutLogger";
import { WeightTracker } from "./components/WeightTracker";
import { Charts } from "./components/Charts";
import { ChartsModal } from "./components/ChartsModal";
import { X, BarChart3, ListFilter } from "lucide-react";

export default function GymPage() {
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [isChartsModalOpen, setIsChartsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"logs" | "charts">("logs");

  return (
    <div className="bg-[#FAFAFA] text-[#1A1A1A] font-sans selection:bg-blue-100 flex flex-col min-h-screen md:h-[100dvh] md:overflow-hidden relative">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-1 md:py-2 flex flex-col flex-1 md:h-full">
        <Header onAddSessionClick={() => setIsMobileModalOpen(true)} />

        <div className="flex flex-col md:flex-row gap-4 md:gap-12 flex-1 md:overflow-hidden mt-2 md:mt-0">
          {/* Left Column: Stats & Tracking */}
          <aside className="w-full md:w-[45%] flex flex-col gap-4 md:min-h-0 md:overflow-y-auto custom-scrollbar pr-2">
            <WeightTracker />

            <div className="bg-white border border-zinc-100 rounded-3xl p-2 shadow-sm flex items-center justify-between">
              <button
                onClick={() => setActiveTab("logs")}
                className={`flex-1 flex justify-center items-center gap-2 py-2 rounded-2xl text-[11px] font-bold uppercase tracking-wider transition-all ${
                  activeTab === "logs" ? "bg-black text-white" : "text-zinc-400 hover:text-black"
                }`}
              >
                <ListFilter size={16} /> History
              </button>
              <button
                onClick={() => setActiveTab("charts")}
                className={`flex-1 flex justify-center items-center gap-2 py-2 rounded-2xl text-[11px] font-bold uppercase tracking-wider transition-all ${
                  activeTab === "charts" ? "bg-black text-white" : "text-zinc-400 hover:text-black"
                }`}
              >
                <BarChart3 size={16} /> Charts
              </button>
            </div>

            {activeTab === "logs" ? (
              <div className="h-[350px] md:h-auto md:flex-1 md:min-h-0 md:overflow-hidden">
                <WeeklyLog />
              </div>
            ) : (
              <div className="md:h-auto md:flex-1 md:min-h-0 md:overflow-y-auto custom-scrollbar">
                <Charts onExpand={() => setIsChartsModalOpen(true)} />
              </div>
            )}
          </aside>

          {/* Vertical Divider for Desktop */}
          <div className="hidden md:block w-px bg-zinc-100 self-stretch"></div>

          {/* Right Column: Workout Logger */}
          <main
            className={`
              w-full md:w-[55%] flex flex-col h-[600px] md:h-auto md:min-h-0 overflow-hidden mb-6 md:mb-0
              ${isMobileModalOpen ? "fixed inset-0 z-50 bg-[#FAFAFA] p-4 sm:p-6 h-[100dvh] m-0 mb-0" : "hidden md:flex"}
            `}
          >
            {isMobileModalOpen && (
              <div className="flex justify-between items-center mb-6 md:hidden">
                <h2 className="text-xl font-bold uppercase tracking-wider">Log Session</h2>
                <button
                  onClick={() => setIsMobileModalOpen(false)}
                  className="p-2 bg-zinc-100 rounded-full hover:bg-zinc-200 active:scale-95 transition-all text-zinc-600"
                >
                  <X size={24} />
                </button>
              </div>
            )}
            <WorkoutLogger onClose={() => setIsMobileModalOpen(false)} />
          </main>
        </div>
      </div>

      <ChartsModal isOpen={isChartsModalOpen} onClose={() => setIsChartsModalOpen(false)} />

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e4e4e7;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d4d4d8;
        }
      `}</style>
    </div>
  );
}
