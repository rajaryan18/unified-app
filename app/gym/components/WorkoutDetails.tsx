"use client";

import React, { useState } from "react";
import { X, Dumbbell, Hash, Weight, Repeat, Edit2, Check, Plus, Trash2 } from "lucide-react";
import { useWorkouts } from "../hooks/useWorkouts";

interface Set { setId: string; weight: string; reps: string; }
interface Exercise { exerciseId: string; name: string; sets: Set[]; }

interface WorkoutDetailsProps {
  workout: { sessionId: string; date: string; workoutTime?: string; exercises: Exercise[] };
  onClose: () => void;
}

export const WorkoutDetails: React.FC<WorkoutDetailsProps> = ({ workout, onClose }) => {
  const { updateWorkout } = useWorkouts();
  const [isEditing, setIsEditing] = useState(false);
  const [editedWorkout, setEditedWorkout] = useState(workout);
  const [isSaving, setIsSaving] = useState(false);

  const dateFormatted = new Date(workout.date).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  const handleSave = async () => {
    setIsSaving(true);
    const success = await updateWorkout(workout.sessionId, {
      workoutTime: editedWorkout.workoutTime,
      exercises: editedWorkout.exercises,
    });
    setIsSaving(false);
    if (success) { setIsEditing(false); onClose(); }
  };

  const updateSet = (exerciseId: string, setId: string, field: "weight" | "reps", value: string) => {
    setEditedWorkout({
      ...editedWorkout,
      exercises: editedWorkout.exercises.map((ex) => {
        if (ex.exerciseId === exerciseId) {
          return { ...ex, sets: ex.sets.map((s) => s.setId === setId ? { ...s, [field]: value } : s) };
        }
        return ex;
      }),
    });
  };

  const addSet = (exerciseId: string) => {
    setEditedWorkout({
      ...editedWorkout,
      exercises: editedWorkout.exercises.map((ex) => {
        if (ex.exerciseId === exerciseId) {
          return { ...ex, sets: [...ex.sets, { setId: Math.random().toString(36).substr(2, 9), weight: "", reps: "" }] };
        }
        return ex;
      }),
    });
  };

  const removeSet = (exerciseId: string, setId: string) => {
    setEditedWorkout({
      ...editedWorkout,
      exercises: editedWorkout.exercises.map((ex) => {
        if (ex.exerciseId === exerciseId) {
          return { ...ex, sets: ex.sets.filter((s) => s.setId !== setId) };
        }
        return ex;
      }),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-black p-6 text-white flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold tracking-tight">{dateFormatted}</h3>
            {!isEditing && workout.workoutTime && (
              <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mt-1">Started at {workout.workoutTime}</p>
            )}
            {isEditing && (
              <div className="mt-2">
                <input type="time" value={editedWorkout.workoutTime || ""} onChange={(e) => setEditedWorkout({ ...editedWorkout, workoutTime: e.target.value })} className="bg-zinc-800 text-white text-xs font-bold p-1 rounded border-none focus:ring-1 ring-zinc-500" />
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white" title="Edit Session"><Edit2 size={18} /></button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
          </div>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-8">
            {(isEditing ? editedWorkout : workout).exercises.map((exercise, idx) => (
              <div key={exercise.exerciseId || idx}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center"><Dumbbell size={16} className="text-black" /></div>
                    <h4 className="font-bold text-lg text-black">{exercise.name || "Unnamed Exercise"}</h4>
                  </div>
                  {isEditing && (
                    <button onClick={() => addSet(exercise.exerciseId)} className="p-2 bg-zinc-100 text-black rounded-lg hover:bg-zinc-200 transition-colors" title="Add Set"><Plus size={14} /></button>
                  )}
                </div>

                <div className="grid grid-cols-12 gap-4 mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400 text-center">
                  <div className="col-span-2 flex items-center gap-1"><Hash size={10} /> Set</div>
                  <div className="col-span-4 flex items-center gap-1 justify-center"><Weight size={10} /> Weight</div>
                  <div className="col-span-4 flex items-center gap-1 justify-center"><Repeat size={10} /> Reps</div>
                  <div className="col-span-2"></div>
                </div>

                <div className="space-y-2">
                  {exercise.sets.map((set, sIdx) => (
                    <div key={set.setId || sIdx} className="grid grid-cols-12 gap-4 p-3 bg-zinc-50 rounded-xl items-center border border-transparent hover:border-zinc-200 transition-colors">
                      <span className="col-span-2 text-xs font-bold text-zinc-400 text-center">{sIdx + 1}</span>
                      <div className="col-span-4 flex justify-center">
                        {!isEditing ? (
                          <span className="text-sm font-bold text-black">{set.weight || "0"}</span>
                        ) : (
                          <input type="number" value={set.weight} onChange={(e) => updateSet(exercise.exerciseId, set.setId, "weight", e.target.value)} className="w-16 bg-white border border-zinc-200 rounded p-1 text-center text-sm font-bold focus:ring-1 ring-black" />
                        )}
                      </div>
                      <div className="col-span-4 flex justify-center">
                        {!isEditing ? (
                          <span className="text-sm font-bold text-black">{set.reps || "0"}</span>
                        ) : (
                          <input type="number" value={set.reps} onChange={(e) => updateSet(exercise.exerciseId, set.setId, "reps", e.target.value)} className="w-16 bg-white border border-zinc-200 rounded p-1 text-center text-sm font-bold focus:ring-1 ring-black" />
                        )}
                      </div>
                      <div className="col-span-2 flex justify-end">
                        {isEditing && (
                          <button onClick={() => removeSet(exercise.exerciseId, set.setId)} className="p-1.5 text-zinc-300 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 bg-zinc-50 border-t border-zinc-100 flex justify-end gap-3">
          {!isEditing ? (
            <button onClick={onClose} className="px-6 py-2.5 bg-black text-white rounded-xl text-sm font-bold hover:bg-zinc-800 transition-all shadow-md">Close</button>
          ) : (
            <>
              <button onClick={() => { setIsEditing(false); setEditedWorkout(workout); }} className="px-6 py-2.5 bg-white text-zinc-500 border border-zinc-200 rounded-xl text-sm font-bold hover:bg-zinc-50 transition-all">Cancel</button>
              <button onClick={handleSave} disabled={isSaving} className="px-6 py-2.5 bg-black text-white rounded-xl text-sm font-bold hover:bg-zinc-800 transition-all shadow-md flex items-center gap-2 disabled:opacity-50">
                {isSaving ? "Saving..." : <><Check size={16} /> Save Changes</>}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
