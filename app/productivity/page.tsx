"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { authenticatedFetch } from "@/lib/api";
import Link from "next/link";

type TimeSegment = "Before breakfast" | "Before lunch" | "Before gym" | "Before dinner" | "Before sleep";

type GoalStatus = "todo" | "in_progress" | "completed";

interface Goal { _id: string; goalId: string; date: string; segment: TimeSegment; text: string; isCompleted: boolean; status: GoalStatus; classification?: "productive" | "waste" | "none"; createdAt: string; }

const SEGMENTS: TimeSegment[] = ["Before breakfast", "Before lunch", "Before gym", "Before dinner", "Before sleep"];
const SEGMENT_ICONS: Record<TimeSegment, string> = { "Before breakfast": "🌅", "Before lunch": "☀️", "Before gym": "💪", "Before dinner": "🌙", "Before sleep": "💤" };
const SEGMENT_COLORS: Record<TimeSegment, string> = { "Before breakfast": "#f59e0b", "Before lunch": "#3b82f6", "Before gym": "#10b981", "Before dinner": "#8b5cf6", "Before sleep": "#6366f1" };

import KanbanBoard from "./components/KanbanBoard";

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
  const [deletingGoalId, setDeletingGoalId] = useState<string | null>(null);
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
            if (!exists) { needsUpdate = true; await authenticatedFetch("/api/goals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date: today, segment: rg.segment, text: rg.text, status: "todo" }) }); }
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

  const handleAddGoal = async (text: string, segment: TimeSegment) => { 
    const response = await authenticatedFetch("/api/goals", { 
      method: "POST", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ date, segment, text, status: "todo" }) 
    }); 
    if (response.ok) fetchGoals(); 
  };

  const handleUpdateStatus = async (goalId: string, newStatus: GoalStatus) => {
    const goal = goals.find(g => g.goalId === goalId);
    if (!goal) return;

    if (newStatus === "completed") {
      setClassifyingGoalId(goalId);
    } else {
      await authenticatedFetch("/api/goals", { 
        method: "PATCH", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ id: goalId, status: newStatus, isCompleted: false, classification: "none" }) 
      });
      fetchGoals();
    }
  };

  const handleClassifyGoal = async (goalId: string, classification: "productive" | "waste") => {
    await authenticatedFetch("/api/goals", { 
      method: "PATCH", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ id: goalId, status: "completed", isCompleted: true, classification }) 
    });
    setClassifyingGoalId(null); 
    fetchGoals();
  };

  const handleDeleteGoal = async (goalId: string) => { 
    await authenticatedFetch(`/api/goals?id=${goalId}`, { method: "DELETE" }); 
    setDeletingGoalId(null);
    fetchGoals(); 
  };

  const stats = useMemo(() => { const total = goals.length; const completed = goals.filter((g) => g.status === "completed").length; const percentage = total > 0 ? Math.round((completed / total) * 100) : 0; return { total, completed, percentage }; }, [goals]);

  const formattedDate = new Date(date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  if (loading) return <div className="animate-pulse text-center py-20 text-zinc-400">Loading your board...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
        <div>
          <p className="text-blue-400 font-semibold text-sm uppercase tracking-widest mb-2">{formattedDate}</p>
          <h1 className="text-4xl font-black gradient-text mb-0">Daily Board</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => setShowRecurringManager(true)} className="glass-panel px-4 py-2 text-sm font-semibold text-blue-400 border border-blue-400/20 hover:bg-blue-400/10 transition-all cursor-pointer">🔄 Recurring</button>
          <Link href="/insights" className="glass-panel px-4 py-2 text-sm font-semibold text-emerald-400 border border-emerald-400/20 hover:bg-emerald-400/10 transition-all">📊 Insights</Link>
          <div className="glass-panel px-4 py-2 flex items-center gap-3">
            <span className="text-sm text-zinc-400">Date:</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-transparent text-white font-semibold outline-none cursor-pointer" />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <div className="glass-panel stat-card"><div className="stat-label">Total Tasks</div><div className="stat-value text-glow">{stats.total}</div></div>
        <div className="glass-panel stat-card"><div className="stat-label">Productive</div><div className="stat-value text-emerald-400">{goals.filter(g => g.classification === 'productive').length}</div></div>
        <div className="glass-panel stat-card"><div className="stat-label">Time Waste</div><div className="stat-value text-red-400">{goals.filter(g => g.classification === 'waste').length}</div></div>
        <div className="glass-panel stat-card">
          <div className="stat-label">Efficiency</div><div className="stat-value text-purple-400">{stats.percentage}%</div>
          <div className="w-full h-2 bg-white/5 rounded-lg mt-3 overflow-hidden"><div className="h-full bg-gradient-to-r from-emerald-400 to-purple-400 rounded-lg transition-all duration-500" style={{ width: `${stats.percentage}%` }} /></div>
        </div>
      </div>

      <KanbanBoard 
        goals={goals}
        onUpdateStatus={handleUpdateStatus}
        onDeleteGoal={handleDeleteGoal}
        onAddGoal={handleAddGoal}
        classifyingGoalId={classifyingGoalId}
        deletingGoalId={deletingGoalId}
        setDeletingGoalId={setDeletingGoalId}
      />

      {/* Classification Modal */}
      {classifyingGoalId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="glass-panel max-w-sm w-full p-8 text-center" style={{ background: "rgba(15,23,42,0.95)" }}>
            <h2 className="text-2xl font-black mb-2 gradient-text">Task Complete!</h2>
            <p className="text-zinc-400 mb-8">How would you classify this effort?</p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => handleClassifyGoal(classifyingGoalId, "productive")}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
              >
                🚀 Productive Session
              </button>
              <button 
                onClick={() => handleClassifyGoal(classifyingGoalId, "waste")}
                className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
              >
                🗑️ Time Waste
              </button>
              <button 
                onClick={() => setClassifyingGoalId(null)}
                className="mt-4 text-zinc-500 hover:text-white transition-colors text-sm font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
