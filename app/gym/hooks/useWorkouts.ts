"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";

export interface WorkoutSession {
  _id?: string;
  sessionId: string;
  userId: string;
  email: string;
  date: string;
  workoutTime?: string;
  exercises: Array<{
    exerciseId: string;
    name: string;
    sets: Array<{ setId: string; weight: string; reps: string }>;
  }>;
}

export const useWorkouts = () => {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWorkouts = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/workouts");
      if (res.ok) { const data = await res.json(); setWorkouts(data); }
    } catch (error) { console.error("Error fetching workouts:", error); }
    finally { setIsLoading(false); }
  }, [user]);

  useEffect(() => {
    fetchWorkouts();
    const handleUpdate = () => { fetchWorkouts(); };
    window.addEventListener("gym:workout_updated", handleUpdate);
    return () => window.removeEventListener("gym:workout_updated", handleUpdate);
  }, [fetchWorkouts]);

  const deleteWorkout = async (id: string) => {
    try {
      const res = await fetch(`/api/workouts/${id}`, { method: "DELETE" });
      if (res.ok) { setWorkouts(workouts.filter((w) => w.sessionId !== id)); window.dispatchEvent(new CustomEvent("gym:workout_updated")); return true; }
      return false;
    } catch (error) { console.error("Error deleting workout:", error); return false; }
  };

  const updateWorkout = async (id: string, data: any) => {
    try {
      const res = await fetch(`/api/workouts/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (res.ok) { window.dispatchEvent(new CustomEvent("gym:workout_updated")); return true; }
      return false;
    } catch (error) { console.error("Error updating workout:", error); return false; }
  };

  return { workouts, isLoading, fetchWorkouts, deleteWorkout, updateWorkout };
};
