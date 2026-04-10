"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

export const useWeight = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [weightHistory, setWeightHistory] = useState<any[]>([]);

  const fetchWeightHistory = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/weight");
      if (res.ok) { const data = await res.json(); setWeightHistory(data); }
    } catch (error) { console.error("Error fetching weight history:", error); }
  }, [user]);

  useEffect(() => { fetchWeightHistory(); }, [fetchWeightHistory]);

  const saveWeight = async (weight: number) => {
    if (!user) return false;
    setIsLoading(true);
    try {
      const res = await fetch("/api/weight", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ weight }) });
      if (res.ok) { await fetchWeightHistory(); return true; }
      return false;
    } catch (error) { console.error("Error saving weight:", error); return false; }
    finally { setIsLoading(false); }
  };

  const latestWeight = weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].weight : null;
  return { saveWeight, fetchWeightHistory, weightHistory, latestWeight, isLoading };
};
