"use client";

import React, { useState } from "react";
import { Calendar, ChevronRight, Loader2, Trash2 } from "lucide-react";
import { useWorkouts } from "../hooks/useWorkouts";
import { WorkoutDetails } from "./WorkoutDetails";

export const WeeklyLog: React.FC = () => {
  const { workouts, isLoading, deleteWorkout } = useWorkouts();
  const [selectedWorkout, setSelectedWorkout] = useState<any | null>(null);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6 px-2">
        <div className="flex items-center gap-2">
          <Calendar size={20} className="text-zinc-500" />
          <h2 className="text-lg font-bold text-black uppercase tracking-wider">Weekly Activity</h2>
        </div>
        {isLoading && <Loader2 size={16} className="text-zinc-400 animate-spin" />}
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar pb-12">
        {!isLoading && workouts.length === 0 && (
          <div className="text-sm font-medium text-zinc-400 text-center mt-10">No sessions recorded yet.</div>
        )}

        {workouts.map((log: any) => {
          const totalSets = log.exercises.reduce((acc: number, ex: any) => acc + ex.sets.length, 0);
          const exerciseNames = log.exercises.map((ex: any) => ex.name || "Unnamed").join(" • ");
          const dateFormatted = new Date(log.date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

          return (
            <div
              key={log.sessionId}
              onClick={() => setSelectedWorkout(log)}
              className="group bg-white border border-zinc-100 rounded-2xl p-4 hover:border-zinc-300 transition-all cursor-pointer shadow-sm hover:shadow-md relative"
            >
              <div className="flex justify-between items-start mb-2 pr-8">
                <span className="text-sm font-bold text-zinc-800">{dateFormatted} {log.workoutTime ? `• ${log.workoutTime}` : ""}</span>
                <span className="text-[10px] font-bold bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full uppercase">{totalSets} Sets</span>
              </div>
              <p className="text-xs text-zinc-400 line-clamp-1 pr-8">{exerciseNames || "No exercises"}</p>
              <div className="mt-3 flex items-center text-[10px] font-bold text-black transition-opacity">
                VIEW DETAILS <ChevronRight size={12} />
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); deleteWorkout(log.sessionId); }}
                className="absolute top-4 right-4 text-zinc-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        })}
      </div>

      {selectedWorkout && <WorkoutDetails workout={selectedWorkout} onClose={() => setSelectedWorkout(null)} />}
    </div>
  );
};
