"use client";

import React, { useEffect, useMemo, useState } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useWorkouts } from "../hooks/useWorkouts";
import { useWeight } from "../hooks/useWeight";
import { useExerciseLibrary } from "../hooks/useExerciseLibrary";
import { IntensityCalendar } from "./IntensityCalendar";
import { Maximize2 } from "lucide-react";

interface ChartsProps { onExpand?: () => void; hideExpand?: boolean; }

export const Charts: React.FC<ChartsProps> = ({ onExpand, hideExpand }) => {
  const { workouts } = useWorkouts();
  const { weightHistory, fetchWeightHistory } = useWeight();
  const { library } = useExerciseLibrary();
  const [selectedMuscle, setSelectedMuscle] = useState<string>("");

  const muscleGroups = useMemo(() => Array.from(new Set(library.map((ex) => ex.targetMuscle))).sort(), [library]);

  useEffect(() => { if (!selectedMuscle && muscleGroups.length > 0) setSelectedMuscle(muscleGroups[0]); }, [muscleGroups, selectedMuscle]);
  useEffect(() => { fetchWeightHistory(); }, [fetchWeightHistory]);

  const exerciseToMuscle = useMemo(() => {
    const map: Record<string, string> = {};
    library.forEach((ex) => { map[ex.name.toLowerCase()] = ex.targetMuscle; });
    return map;
  }, [library]);

  const weightChartData = useMemo(() => {
    if (!weightHistory) return [];
    return weightHistory.map((entry) => ({ date: new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }), weight: entry.weight }));
  }, [weightHistory]);

  const workoutChartData = useMemo(() => {
    if (!workouts) return [];
    const data = workouts.map((session) => {
      let totalVolume = 0;
      session.exercises.forEach((ex) => { ex.sets.forEach((set) => { totalVolume += (parseFloat(set.weight) || 0) * (parseInt(set.reps) || 0); }); });
      return { date: new Date(session.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }), volume: totalVolume };
    });
    return [...data].reverse();
  }, [workouts]);

  const muscleFrequencyData = useMemo(() => {
    if (!workouts || !library.length) return [];
    const freq: Record<string, number> = {};
    workouts.forEach((session) => {
      const musclesInSession = new Set<string>();
      session.exercises.forEach((ex) => { const muscle = exerciseToMuscle[ex.name?.toLowerCase()]; if (muscle) musclesInSession.add(muscle); });
      musclesInSession.forEach((m) => { freq[m] = (freq[m] || 0) + 1; });
    });
    return Object.entries(freq).map(([name, frequency]) => ({ name, frequency })).sort((a, b) => b.frequency - a.frequency);
  }, [workouts, exerciseToMuscle, library.length]);

  const muscleIntensityData = useMemo(() => {
    if (!workouts || !library.length) return [];
    const volumeMap: Record<string, number> = {};
    workouts.forEach((session) => {
      session.exercises.forEach((ex) => {
        const muscle = exerciseToMuscle[ex.name?.toLowerCase()];
        if (muscle) { let vol = 0; ex.sets.forEach((s) => { vol += (parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0); }); volumeMap[muscle] = (volumeMap[muscle] || 0) + vol; }
      });
    });
    return Object.entries(volumeMap).map(([name, volume]) => ({ name, volume })).sort((a, b) => b.volume - a.volume);
  }, [workouts, exerciseToMuscle, library.length]);

  const muscleIntensityOverTime = useMemo(() => {
    if (!workouts || !selectedMuscle) return [];
    const data = workouts.map((session) => {
      let volume = 0;
      session.exercises.forEach((ex) => {
        if (exerciseToMuscle[ex.name?.toLowerCase()] === selectedMuscle) {
          ex.sets.forEach((s) => { volume += (parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0); });
        }
      });
      return { date: new Date(session.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }), volume, timestamp: new Date(session.date).getTime() };
    }).filter((d) => d.volume > 0);
    return data.sort((a, b) => a.timestamp - b.timestamp);
  }, [workouts, selectedMuscle, exerciseToMuscle]);

  const ChartContainer: React.FC<{ title: string; children: React.ReactNode; hasData: boolean }> = ({ title, children, hasData }) => (
    <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm flex flex-col min-w-0">
      <h2 className="text-lg font-bold text-black uppercase tracking-wider mb-6">{title}</h2>
      <div className="h-[250px] w-full">
        {hasData ? <ResponsiveContainer width="100%" height="100%">{children as React.ReactElement}</ResponsiveContainer> : (
          <div className="flex items-center justify-center h-full text-zinc-400 font-medium text-sm">Not enough data for this chart.</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 w-full pb-8">
      {!hideExpand && onExpand && (
        <div className="flex justify-end -mb-2">
          <button onClick={onExpand} className="p-3 bg-white border border-zinc-100 text-zinc-400 hover:text-black hover:border-zinc-200 rounded-2xl transition-all shadow-sm flex items-center gap-2 text-xs font-bold uppercase tracking-wider group" title="Expand Charts">
            <Maximize2 size={14} className="group-hover:scale-110 transition-transform" /> Fullscreen
          </button>
        </div>
      )}
      <IntensityCalendar />
      <ChartContainer title="Body Weight History" hasData={weightChartData.length > 0}>
        <LineChart data={weightChartData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#a1a1aa" }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#a1a1aa" }} domain={["dataMin - 5", "dataMax + 5"]} />
          <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} itemStyle={{ color: "#000", fontWeight: "bold" }} />
          <Line type="monotone" dataKey="weight" name="Weight (kg)" stroke="#000000" strokeWidth={3} dot={{ r: 4, fill: "#000000" }} activeDot={{ r: 6 }} />
        </LineChart>
      </ChartContainer>

      <ChartContainer title="Total Volume History" hasData={workoutChartData.length > 0}>
        <BarChart data={workoutChartData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#a1a1aa" }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#a1a1aa" }} />
          <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} cursor={{ fill: "#f4f4f5" }} itemStyle={{ color: "#000", fontWeight: "bold" }} />
          <Bar dataKey="volume" name="Volume (kg)" fill="#000000" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ChartContainer>

      <ChartContainer title="Muscle Group Frequency" hasData={muscleFrequencyData.length > 0}>
        <BarChart data={muscleFrequencyData} layout="vertical" margin={{ top: 5, right: 30, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f4f4f5" />
          <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#a1a1aa" }} />
          <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#1A1A1A", fontWeight: "bold" }} width={80} />
          <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} cursor={{ fill: "#f4f4f5" }} itemStyle={{ color: "#000", fontWeight: "bold" }} />
          <Bar dataKey="frequency" name="Sessions" fill="#000000" radius={[0, 4, 4, 0]} maxBarSize={20} />
        </BarChart>
      </ChartContainer>

      <ChartContainer title="Muscle Distribution (Volume)" hasData={muscleIntensityData.length > 0}>
        <BarChart data={muscleIntensityData} layout="vertical" margin={{ top: 5, right: 30, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f4f4f5" />
          <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#a1a1aa" }} />
          <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#1A1A1A", fontWeight: "bold" }} width={80} />
          <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} cursor={{ fill: "#f4f4f5" }} itemStyle={{ color: "#000", fontWeight: "bold" }} />
          <Bar dataKey="volume" name="Total Volume (kg)" fill="#000000" radius={[0, 4, 4, 0]} maxBarSize={20} />
        </BarChart>
      </ChartContainer>

      <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm flex flex-col min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-lg font-bold text-black uppercase tracking-wider">Muscle Intensity Over Time</h2>
          <select value={selectedMuscle} onChange={(e) => setSelectedMuscle(e.target.value)} className="bg-zinc-50 border border-zinc-100 rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-black/5 transition-all outline-none">
            {muscleGroups.map((muscle) => (<option key={muscle} value={muscle}>{muscle}</option>))}
          </select>
        </div>
        <div className="h-[250px] w-full">
          {muscleIntensityOverTime.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={muscleIntensityOverTime} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#a1a1aa" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#a1a1aa" }} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} itemStyle={{ color: "#000", fontWeight: "bold" }} />
                <Line type="monotone" dataKey="volume" name={`${selectedMuscle} Volume (kg)`} stroke="#000000" strokeWidth={3} dot={{ r: 4, fill: "#000000" }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (<div className="flex items-center justify-center h-full text-zinc-400 font-medium text-sm">No data for {selectedMuscle}.</div>)}
        </div>
      </div>
    </div>
  );
};
