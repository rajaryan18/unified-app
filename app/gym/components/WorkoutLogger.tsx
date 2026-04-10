"use client";

import React, { useState } from "react";
import { Plus, Dumbbell, Clock, Loader2 } from "lucide-react";
import { ExerciseCard } from "./ExerciseCard";
import { useWorkoutLogger } from "../hooks/useWorkoutLogger";

interface WorkoutLoggerProps {
  onClose?: () => void;
}

export const WorkoutLogger: React.FC<WorkoutLoggerProps> = ({ onClose }) => {
  const {
    exercises,
    workoutTime,
    isSaving,
    setWorkoutTime,
    addExercise,
    removeExercise,
    updateExerciseName,
    addSet,
    removeSet,
    updateSet,
    saveWorkout,
  } = useWorkoutLogger();

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 px-2">
        <div className="flex items-center gap-2">
          <Dumbbell size={20} className="text-zinc-500" />
          <h2 className="text-lg font-bold text-black uppercase tracking-wider">New Session</h2>
        </div>

        <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-2xl border border-zinc-100 shadow-sm w-fit transition-all hover:border-zinc-300">
          <Clock size={16} className="text-zinc-400" />
          <input
            type="time"
            value={workoutTime}
            onChange={(e) => setWorkoutTime(e.target.value)}
            className="bg-transparent text-sm font-bold text-black outline-none tracking-wider"
            placeholder="HH:MM"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-8 custom-scrollbar pb-12">
        {exercises.map((exercise) => (
          <ExerciseCard
            key={exercise.exerciseId}
            exercise={exercise}
            onUpdateName={(name) => updateExerciseName(exercise.exerciseId, name)}
            onRemove={() => removeExercise(exercise.exerciseId)}
            onAddSet={() => addSet(exercise.exerciseId)}
            onUpdateSet={(setId, field, value) => updateSet(exercise.exerciseId, setId, field, value)}
            onRemoveSet={(setId) => removeSet(exercise.exerciseId, setId)}
            isOnlyExercise={exercises.length === 1}
          />
        ))}

        <div className="flex gap-3 sm:gap-4 mt-4">
          <button
            onClick={addExercise}
            className="flex-1 py-4 sm:py-6 bg-zinc-100 text-black rounded-2xl sm:rounded-3xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Add Exercise</span>
            <span className="sm:hidden">Add</span>
          </button>

          <button
            onClick={async () => {
              const success = await saveWorkout();
              if (success && onClose) onClose();
            }}
            disabled={isSaving}
            className="flex-1 py-4 sm:py-6 bg-black text-white rounded-2xl sm:rounded-3xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all shadow-lg disabled:opacity-50"
          >
            {isSaving && <Loader2 size={18} className="animate-spin" />}
            {isSaving ? "Saving..." : "Save Session"}
          </button>
        </div>
      </div>
    </div>
  );
};
