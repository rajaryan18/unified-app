"use client";

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export interface Set { setId: string; weight: string; reps: string; }
export interface Exercise { exerciseId: string; name: string; sets: Set[]; }

export const useWorkoutLogger = () => {
  const { user } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([
    { exerciseId: "1", name: "", sets: [{ setId: "s1", weight: "", reps: "" }] },
  ]);
  const [workoutTime, setWorkoutTime] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  const addExercise = () => {
    setExercises([...exercises, { exerciseId: Math.random().toString(36).substr(2, 9), name: "", sets: [{ setId: Math.random().toString(36).substr(2, 9), weight: "", reps: "" }] }]);
  };

  const removeExercise = (exerciseId: string) => { setExercises(exercises.filter((ex) => ex.exerciseId !== exerciseId)); };

  const updateExerciseName = (exerciseId: string, name: string) => {
    setExercises(exercises.map((ex) => (ex.exerciseId === exerciseId ? { ...ex, name } : ex)));
  };

  const addSet = (exerciseId: string) => {
    setExercises(exercises.map((ex) => {
      if (ex.exerciseId === exerciseId) {
        return { ...ex, sets: [...ex.sets, { setId: Math.random().toString(36).substr(2, 9), weight: "", reps: "" }] };
      }
      return ex;
    }));
  };

  const removeSet = (exerciseId: string, setId: string) => {
    setExercises(exercises.map((ex) => {
      if (ex.exerciseId === exerciseId) return { ...ex, sets: ex.sets.filter((s) => s.setId !== setId) };
      return ex;
    }));
  };

  const updateSet = (exerciseId: string, setId: string, field: "weight" | "reps", value: string) => {
    setExercises(exercises.map((ex) => {
      if (ex.exerciseId === exerciseId) return { ...ex, sets: ex.sets.map((s) => (s.setId === setId ? { ...s, [field]: value } : s)) };
      return ex;
    }));
  };

  const saveWorkout = async () => {
    if (!exercises || exercises.length === 0 || !user) return false;
    setIsSaving(true);
    try {
      const res = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exercises, workoutTime }),
      });
      if (res.ok) {
        setExercises([{ exerciseId: Math.random().toString(36).substr(2, 9), name: "", sets: [{ setId: Math.random().toString(36).substr(2, 9), weight: "", reps: "" }] }]);
        setWorkoutTime("");
        window.dispatchEvent(new CustomEvent("gym:workout_updated"));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error saving workout:", error);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return { exercises, workoutTime, isSaving, setWorkoutTime, addExercise, removeExercise, updateExerciseName, addSet, removeSet, updateSet, saveWorkout };
};
