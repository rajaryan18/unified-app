"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { authenticatedFetch } from "@/lib/api";
import Link from "next/link";

type TimeSegment = "Before breakfast" | "Before lunch" | "Before gym" | "Before dinner" | "Before sleep";

interface Goal { _id: string; goalId: string; date: string; segment: TimeSegment; text: string; isCompleted: boolean; classification?: "productive" | "waste" | "none"; createdAt: string; }

const SEGMENTS: TimeSegment[] = ["Before breakfast", "Before lunch", "Before gym", "Before dinner", "Before sleep"];
const SEGMENT_ICONS: Record<TimeSegment, string> = { "Before breakfast": "🌅", "Before lunch": "☀️", "Before gym": "💪", "Before dinner": "🌙", "Before sleep": "💤" };
const SEGMENT_COLORS: Record<TimeSegment, string> = { "Before breakfast": "#f59e0b", "Before lunch": "#3b82f6", "Before gym": "#10b981", "Before dinner": "#8b5cf6", "Before sleep": "#6366f1" };

export default function ProductivityPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);
  const [recurringGoals, setRecurringGoals] = useState<any[]>([]);
  const [showRecurringManager, setShowRecurringManager] = useState(false);
  const [newRecurringText, setNewRecurringText] = useState("");
  const [newRecurringSegment, setNewRecurringSegment] = useState<TimeSegment>("Before breakfast");
  const [newRecurringStart, setNewRecurringStart] = useState(new Date().toISOString().split("T")[0]);
  const [newRecurringEnd, setNewRecurringEnd] = useState("");
  const [isAlwaysRecurring, setIsAlwaysRecurring] = useState(true);
  const [isAddingRecurring, setIsAddingRecurring] = useState(false);
  const [deletingRecurringId, setDeletingRecurringId] = useState<string | null>(null);
  const [classifyingGoalId, setClassifyingGoalId] = useState<string | null>(null);

  const fetchGoals = useCallback(async () => {
    if (goals.length === 0) setLoading(true);
    try { const response = await authenticatedFetch(`/api/goals?date=${date}`); if (response.ok) { const data = await response.json(); setGoals(data); } }
    catch (error) { console.error("Failed to fetch goals:", error); }
    finally { setLoading(false); }
  }, [date, goals.length]);

  const fetchRecurringGoals = useCallback(async () => {
    try { const response = await authenticatedFetch("/api/recurring-goals"); if (response.ok) setRecurringGoals(await response.json()); }
    catch (error) { console.error("Failed to fetch recurring goals:", error); }
  }, []);

  useEffect(() => { fetchGoals(); fetchRecurringGoals(); }, [fetchGoals, fetchRecurringGoals]);

  // Sync recurring goals
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    if (date === today && recurringGoals.length > 0 && !loading) {
      const syncRecurring = async () => {
        let needsUpdate = false;
        for (const rg of recurringGoals) {
          const start = new Date(rg.startDate); const current = new Date(today); const end = rg.endDate ? new Date(rg.endDate) : null;
          if (current >= start && (!end || current <= end)) {
            const exists = goals.find((g) => g.text === rg.text && g.segment === rg.segment);
            if (!exists) { needsUpdate = true; await authenticatedFetch("/api/goals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date: today, segment: rg.segment, text: rg.text }) }); }
          }
        }
        if (needsUpdate) fetchGoals();
      };
      syncRecurring();
    }
  }, [date, recurringGoals, goals, loading, fetchGoals]);

  const handleAddRecurring = async (e: React.FormEvent) => {
    e.preventDefault(); if (!newRecurringText.trim()) return;
    setIsAddingRecurring(true);
    try { const response = await authenticatedFetch("/api/recurring-goals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: newRecurringText, segment: newRecurringSegment, startDate: newRecurringStart, endDate: isAlwaysRecurring ? null : newRecurringEnd, isAlwaysRecurring }) }); if (response.ok) { setNewRecurringText(""); setIsAlwaysRecurring(true); fetchRecurringGoals(); } }
    catch (error) { console.error("Failed to add recurring goal:", error); }
    finally { setIsAddingRecurring(false); }
  };

  const handleDeleteRecurring = async (id: string) => {
    try { const response = await authenticatedFetch(`/api/recurring-goals?id=${id}`, { method: "DELETE" }); if (response.ok) { setDeletingRecurringId(null); fetchRecurringGoals(); } }
    catch (error) { console.error("Failed to delete recurring goal:", error); }
  };

  const handleAddGoal = async (segment: TimeSegment, text: string) => { const response = await authenticatedFetch("/api/goals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date, segment, text }) }); if (response.ok) fetchGoals(); };

  const handleToggleGoal = async (goal: Goal) => {
    if (goal.isCompleted) { await fetch("/api/goals", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: goal.goalId, isCompleted: false, classification: "none" }) }); fetchGoals(); }
    else { setClassifyingGoalId(goal.goalId); }
  };

  const handleClassifyGoal = async (goal: Goal, classification: "productive" | "waste") => {
    await fetch("/api/goals", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: goal.goalId, isCompleted: true, classification }) });
    setClassifyingGoalId(null); fetchGoals();
  };

  const handleDeleteGoal = async (goalId: string) => { await fetch(`/api/goals?id=${goalId}`, { method: "DELETE" }); fetchGoals(); };

  const stats = useMemo(() => { const total = goals.length; const completed = goals.filter((g) => g.isCompleted).length; const percentage = total > 0 ? Math.round((completed / total) * 100) : 0; return { total, completed, percentage }; }, [goals]);

  const getGoalsForSegment = (segment: TimeSegment) => goals.filter((g) => g.segment === segment);

  const formattedDate = new Date(date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  if (loading) return <div className="animate-pulse text-center py-20 text-zinc-400">Loading your agenda...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
        <div>
          <p className="text-blue-400 font-semibold text-sm uppercase tracking-widest mb-2">{formattedDate}</p>
          <h1 className="text-4xl font-black gradient-text mb-0">Daily Focus</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowRecurringManager(true)} className="glass-panel px-4 py-2 text-sm font-semibold text-blue-400 border border-blue-400/20 hover:bg-blue-400/10 transition-all cursor-pointer">🔄 Recurring</button>
          <Link href="/insights" className="glass-panel px-4 py-2 text-sm font-semibold text-emerald-400 border border-emerald-400/20 hover:bg-emerald-400/10 transition-all">📊 Insights</Link>
          <div className="glass-panel px-4 py-2 flex items-center gap-3">
            <span className="text-sm text-zinc-400">Date:</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-transparent text-white font-semibold outline-none cursor-pointer" />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-6 mb-10">
        <div className="glass-panel stat-card"><div className="stat-label">Total Goals</div><div className="stat-value text-glow">{stats.total}</div></div>
        <div className="glass-panel stat-card"><div className="stat-label">Completed</div><div className="stat-value text-emerald-400">{stats.completed}</div></div>
        <div className="glass-panel stat-card">
          <div className="stat-label">Progress</div><div className="stat-value text-purple-400">{stats.percentage}%</div>
          <div className="w-full h-2 bg-white/5 rounded-lg mt-3 overflow-hidden"><div className="h-full bg-gradient-to-r from-emerald-400 to-purple-400 rounded-lg transition-all duration-500" style={{ width: `${stats.percentage}%` }} /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SEGMENTS.map((segment) => {
          const segmentGoals = getGoalsForSegment(segment);
          return <SegmentBoard key={segment} segment={segment} goals={segmentGoals} onAddGoal={handleAddGoal} onToggleGoal={handleToggleGoal} onClassifyGoal={handleClassifyGoal} onDeleteGoal={handleDeleteGoal} classifyingGoalId={classifyingGoalId} />;
        })}
      </div>

      {showRecurringManager && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setShowRecurringManager(false)}>
          <div className="glass-panel w-full max-w-lg max-h-[80vh] overflow-y-auto animate-fade-in relative" onClick={(e) => e.stopPropagation()} style={{ background: "rgba(15,23,42,0.95)" }}>
            <button onClick={() => setShowRecurringManager(false)} className="absolute top-4 right-4 bg-none border-none text-zinc-400 cursor-pointer text-xl">✕</button>
            <h2 className="gradient-text text-2xl mb-6">Recurring Goals</h2>
            <form onSubmit={handleAddRecurring} className="space-y-3 mb-8">
              <div className="flex gap-2">
                <input type="text" className="input-field" placeholder="Task name" value={newRecurringText} onChange={(e) => setNewRecurringText(e.target.value)} />
                <select className="input-field w-40" value={newRecurringSegment} onChange={(e) => setNewRecurringSegment(e.target.value as TimeSegment)}>{SEGMENTS.map((s) => <option key={s} value={s}>{s}</option>)}</select>
              </div>
              <div className="flex gap-2 items-end">
                <div className="flex-1"><label className="text-xs text-zinc-400 block mb-1">Start</label><input type="date" className="input-field" value={newRecurringStart} onChange={(e) => setNewRecurringStart(e.target.value)} /></div>
                {!isAlwaysRecurring && (<div className="flex-1"><label className="text-xs text-zinc-400 block mb-1">End</label><input type="date" className="input-field" value={newRecurringEnd} onChange={(e) => setNewRecurringEnd(e.target.value)} /></div>)}
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={isAlwaysRecurring} onChange={(e) => setIsAlwaysRecurring(e.target.checked)} /> Always recurring</label>
              <button type="submit" className="primary-button w-full" disabled={isAddingRecurring}>{isAddingRecurring ? "Scheduling..." : "Schedule Recurring Task"}</button>
            </form>
            <div className="space-y-2">
              {recurringGoals.map((rg) => (
                <div key={rg.id} className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                  {deletingRecurringId === rg.id ? (
                    <div className="flex gap-2 items-center w-full"><span className="text-red-300 text-sm">Delete?</span><button onClick={() => handleDeleteRecurring(rg.id)} className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs font-semibold">Yes</button><button onClick={() => setDeletingRecurringId(null)} className="px-3 py-1 bg-white/10 text-white rounded-lg text-xs">Cancel</button></div>
                  ) : (
                    <><div><div className="font-semibold">{rg.text}</div><div className="text-xs text-zinc-400">{rg.segment} • {rg.isAlwaysRecurring ? "Always" : `${rg.startDate} to ${rg.endDate}`}</div></div><button onClick={() => setDeletingRecurringId(rg.id)} className="text-red-400 bg-none border-none cursor-pointer px-2">✕</button></>
                  )}
                </div>
              ))}
              {recurringGoals.length === 0 && <div className="text-center text-zinc-400 py-4">No recurring goals yet.</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SegmentBoard({ segment, goals, onAddGoal, onToggleGoal, onClassifyGoal, onDeleteGoal, classifyingGoalId }: {
  segment: TimeSegment; goals: any[]; onAddGoal: (s: TimeSegment, t: string) => void; onToggleGoal: (g: any) => void; onClassifyGoal: (g: any, c: "productive" | "waste") => void; onDeleteGoal: (id: string) => void; classifyingGoalId: string | null;
}) {
  const [newGoalText, setNewGoalText] = useState("");
  const [deletingGoalId, setDeletingGoalId] = useState<string | null>(null);

  return (
    <div className="glass-panel flex flex-col" style={{ borderLeft: `4px solid ${SEGMENT_COLORS[segment]}` }}>
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold flex items-center gap-2"><span className="text-xl">{SEGMENT_ICONS[segment]}</span>{segment}</h3>
          <span className="text-xs font-bold px-2 py-1 rounded-full bg-white/5 text-zinc-400">{goals.filter((g) => g.isCompleted).length}/{goals.length}</span>
        </div>
        <div className="w-full h-1 bg-white/5 rounded-lg overflow-hidden"><div className="h-full rounded-lg transition-all" style={{ width: `${goals.length > 0 ? (goals.filter((g) => g.isCompleted).length / goals.length) * 100 : 0}%`, background: SEGMENT_COLORS[segment] }} /></div>
      </div>
      <div className="flex-1 space-y-2 mb-4">
        {goals.map((goal) => (
          <div key={goal.goalId} className="p-3 bg-white/5 rounded-xl border border-white/5">
            <div className="flex items-center gap-3">
              <input type="checkbox" checked={goal.isCompleted} onChange={() => onToggleGoal(goal)} className="w-5 h-5 cursor-pointer" style={{ accentColor: SEGMENT_COLORS[segment] }} />
              <span className={`flex-1 ${goal.isCompleted ? "line-through text-zinc-500" : "text-white"}`}>{goal.text}</span>
              <button onClick={() => setDeletingGoalId(goal.goalId)} className="text-red-400 bg-none border-none cursor-pointer text-sm">✕</button>
            </div>
            {deletingGoalId === goal.goalId && (
              <div className="mt-2 flex gap-2 items-center"><span className="text-red-300 text-xs">Delete?</span><button onClick={() => onDeleteGoal(goal.goalId)} className="px-2 py-1 bg-red-500 text-white rounded text-xs font-semibold">Delete</button><button onClick={() => setDeletingGoalId(null)} className="px-2 py-1 bg-white/10 text-white rounded text-xs">Cancel</button></div>
            )}
            {classifyingGoalId === goal.goalId && !goal.isCompleted && (
              <div className="mt-2 flex gap-2"><button onClick={() => onClassifyGoal(goal, "productive")} className="flex-1 py-1 bg-emerald-500 text-white rounded text-xs font-semibold">🚀 Productive</button><button onClick={() => onClassifyGoal(goal, "waste")} className="flex-1 py-1 bg-red-500 text-white rounded text-xs font-semibold">🗑️ Waste</button><button onClick={() => onClassifyGoal(null as any, "productive")} className="px-2 text-zinc-400 bg-none border-none cursor-pointer text-xs">Cancel</button></div>
            )}
          </div>
        ))}
        {goals.length === 0 && <div className="h-20 flex items-center justify-center border-2 border-dashed border-white/5 rounded-xl text-zinc-500 text-sm italic">Empty segment</div>}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); if (newGoalText.trim()) { onAddGoal(segment, newGoalText); setNewGoalText(""); } }} className="flex gap-2">
        <input type="text" className="input-field text-sm" placeholder="New goal..." value={newGoalText} onChange={(e) => setNewGoalText(e.target.value)} />
        <button type="submit" className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold cursor-pointer" style={{ background: SEGMENT_COLORS[segment] }}>+</button>
      </form>
    </div>
  );
}
