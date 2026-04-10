"use client";

import React, { useState } from "react";
import { Plus, Trash2, ChevronDown, Check, X, Loader2 } from "lucide-react";
import { SetRow } from "./SetRow";
import { useExerciseLibrary } from "../hooks/useExerciseLibrary";

interface Set {
  setId: string;
  weight: string;
  reps: string;
}

interface Exercise {
  exerciseId: string;
  name: string;
  sets: Set[];
}

interface ExerciseCardProps {
  exercise: Exercise;
  onUpdateName: (name: string) => void;
  onRemove: () => void;
  onAddSet: () => void;
  onUpdateSet: (setId: string, field: "weight" | "reps", value: string) => void;
  onRemoveSet: (setId: string) => void;
  isOnlyExercise: boolean;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  onUpdateName,
  onRemove,
  onAddSet,
  onUpdateSet,
  onRemoveSet,
  isOnlyExercise,
}) => {
  const { library, addCustomExercise } = useExerciseLibrary();
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newMuscle, setNewMuscle] = useState("Other");
  const [isSavingCustom, setIsSavingCustom] = useState(false);

  const uniqueMuscleGroups = Array.from(new Set(library.map((e) => e.targetMuscle))).sort();

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "ADD_NEW_CUSTOM") {
      setIsAddingNew(true);
      onUpdateName("");
    } else {
      onUpdateName(val);
    }
  };

  const handleSaveNewCustom = async () => {
    if (!exercise.name.trim()) return;
    setIsSavingCustom(true);
    const success = await addCustomExercise(exercise.name.trim(), newMuscle);
    setIsSavingCustom(false);
    if (success) {
      setIsAddingNew(false);
    }
  };

  return (
    <section className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
        <div className="flex-1 mr-0 sm:mr-4 relative">
          {!isAddingNew ? (
            <div className="relative w-full">
              <select
                value={exercise.name}
                onChange={handleSelectChange}
                className="w-full text-lg sm:text-xl font-bold bg-zinc-50 rounded-xl border-none focus:ring-2 ring-black p-3 pr-10 appearance-none text-black truncate cursor-pointer shadow-sm"
              >
                <option value="" disabled>Select an exercise...</option>
                <optgroup label="Actions">
                  <option value="ADD_NEW_CUSTOM" className="font-bold text-blue-600">+ Add New Custom Exercise</option>
                </optgroup>
                {uniqueMuscleGroups.map((muscle) => (
                  <optgroup key={muscle} label={`-- ${muscle} --`}>
                    {library
                      .filter((ex) => ex.targetMuscle === muscle)
                      .map((ex) => (
                        <option key={ex._id} value={ex.name}>
                          {ex.name} {ex.isCustom ? "(Custom)" : ""}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
              <ChevronDown size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            </div>
          ) : (
            <div className="flex flex-col gap-3 bg-zinc-50 p-4 rounded-xl border border-zinc-200">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Create Custom Exercise</div>
              <input
                type="text"
                placeholder="Exercise Name (e.g. Hex Press)"
                value={exercise.name}
                onChange={(e) => onUpdateName(e.target.value)}
                className="w-full text-lg font-bold bg-white rounded-lg border-none focus:ring-2 ring-black placeholder:text-zinc-300 p-3 shadow-sm"
                autoFocus
              />
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-1">
                <select
                  value={newMuscle}
                  onChange={(e) => setNewMuscle(e.target.value)}
                  className="bg-white rounded-lg border-none focus:ring-2 ring-black p-3 text-sm font-bold flex-1 shadow-sm"
                >
                  <option value="Chest">Chest</option>
                  <option value="Back">Back</option>
                  <option value="Legs">Legs</option>
                  <option value="Shoulders">Shoulders</option>
                  <option value="Arms">Arms</option>
                  <option value="Core">Core</option>
                  <option value="Other">Other</option>
                </select>
                <div className="flex items-center gap-2 justify-end sm:justify-start">
                  <button
                    onClick={() => { setIsAddingNew(false); onUpdateName(""); }}
                    className="h-[44px] w-[44px] bg-red-100 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-200 transition-colors"
                  >
                    <X size={18} />
                  </button>
                  <button
                    onClick={handleSaveNewCustom}
                    disabled={isSavingCustom || !exercise.name.trim()}
                    className="h-[44px] px-4 bg-black text-white rounded-lg flex items-center justify-center hover:bg-zinc-800 transition-colors disabled:opacity-50 font-bold text-sm gap-2"
                  >
                    {isSavingCustom ? <Loader2 size={16} className="animate-spin" /> : <Check size={18} />}
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        {!isOnlyExercise && (
          <button onClick={onRemove} className="text-zinc-300 hover:text-red-500 transition-colors p-2">
            <Trash2 size={18} />
          </button>
        )}
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-12 gap-4 px-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
          <div className="col-span-1">Set</div>
          <div className="col-span-5">Weight (kg)</div>
          <div className="col-span-5">Reps</div>
          <div className="col-span-1"></div>
        </div>
        {exercise.sets.map((set, setIndex) => (
          <SetRow
            key={set.setId}
            index={setIndex}
            weight={set.weight}
            reps={set.reps}
            onUpdate={(field, value) => onUpdateSet(set.setId, field, value)}
            onRemove={() => onRemoveSet(set.setId)}
            isOnlySet={exercise.sets.length === 1}
          />
        ))}
        <button
          onClick={onAddSet}
          className="w-full mt-4 py-3 border-2 border-dashed border-zinc-100 rounded-2xl text-zinc-400 text-sm font-medium hover:border-zinc-200 hover:text-zinc-600 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={16} /> Add Set
        </button>
      </div>
    </section>
  );
};
