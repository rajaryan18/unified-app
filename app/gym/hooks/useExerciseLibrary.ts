"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

export interface IDictionaryExercise { _id: string; name: string; targetMuscle: string; isCustom: boolean; }

export const useExerciseLibrary = () => {
  const { user } = useAuth();
  const [library, setLibrary] = useState<IDictionaryExercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLibrary = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/exercises");
      if (res.ok) { const data = await res.json(); setLibrary(data); }
    } catch (error) { console.error("Error fetching exercise library:", error); }
    finally { setIsLoading(false); }
  }, [user]);

  useEffect(() => { fetchLibrary(); }, [fetchLibrary]);

  const addCustomExercise = async (name: string, targetMuscle: string) => {
    if (!user) return false;
    try {
      const res = await fetch("/api/exercises", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, targetMuscle }) });
      if (res.ok) { await fetchLibrary(); return true; }
      return false;
    } catch (error) { console.error("Error adding custom exercise:", error); return false; }
  };

  return { library, isLoading, addCustomExercise };
};
