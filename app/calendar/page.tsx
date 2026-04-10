"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { authenticatedFetch } from "@/lib/api";

interface Event { id: string; eventId: string; date: string; title: string; description?: string; startTime?: string; endTime?: string; createdAt: string; }

const HOUR_HEIGHT = 60;

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try { const response = await authenticatedFetch(`/api/events?date=${date}`); if (response.ok) setEvents(await response.json()); }
    catch (error) { console.error("Failed to fetch events:", error); }
    finally { setLoading(false); }
  }, [date]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);
  useEffect(() => { const t = setInterval(() => setCurrentTime(new Date()), 60000); return () => clearInterval(t); }, []);

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault(); if (!title) return;
    setIsAdding(true);
    try { const response = await authenticatedFetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date, title, description, startTime, endTime }) }); if (response.ok) { setTitle(""); setDescription(""); setStartTime(""); setEndTime(""); fetchEvents(); } }
    catch (error) { console.error("Failed to add event:", error); }
    finally { setIsAdding(false); }
  };

  const getTimeOffset = (time: string) => { const [h, m] = time.split(":").map(Number); return (h + m / 60) * HOUR_HEIGHT; };
  const getDurationHeight = (start: string, end: string) => Math.max(getTimeOffset(end) - getTimeOffset(start), 30);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const sortedEvents = useMemo(() => [...events].sort((a, b) => (a.startTime || "00:00").localeCompare(b.startTime || "00:00")), [events]);
  const isToday = date === new Date().toISOString().split("T")[0];
  const currentTimeOffset = useMemo(() => { if (!isToday) return -1; return (currentTime.getHours() + currentTime.getMinutes() / 60) * HOUR_HEIGHT; }, [currentTime, isToday]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-panel relative overflow-x-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black gradient-text">Schedule</h2>
            <div className="flex gap-2 items-center">
              <button onClick={() => setDate(new Date().toISOString().split("T")[0])} className="px-3 py-1 text-xs bg-white/10 rounded-full hover:bg-white/20 transition-all cursor-pointer">Today</button>
              <input type="date" className="input-field w-auto px-3 py-1 text-sm" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>
          {loading ? (<div className="h-96 flex items-center justify-center text-zinc-400">Loading events...</div>) : (
            <div className="relative ml-14 border-l border-white/10">
              {isToday && currentTimeOffset >= 0 && (<div className="absolute top-0 left-0 right-0 z-50 pointer-events-none" style={{ top: `${currentTimeOffset}px` }}><div className="absolute left-[-5px] top-[-4px] w-2.5 h-2.5 rounded-full bg-red-500" /><div className="h-0.5 bg-red-500 w-full" /></div>)}
              {hours.map((hour) => (
                <div key={hour} className="relative" style={{ height: `${HOUR_HEIGHT}px`, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <span className="absolute -left-14 -top-2 text-xs text-zinc-500 w-12 text-right tabular-nums">{hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}</span>
                </div>
              ))}
              {sortedEvents.map((event) => {
                if (!event.startTime || !event.endTime) return null;
                const top = getTimeOffset(event.startTime);
                const height = getDurationHeight(event.startTime, event.endTime);
                return (
                  <div key={event.id} className="absolute left-1 right-1 p-2 glass-panel z-10 hover:scale-[1.02] hover:shadow-lg transition-all cursor-pointer overflow-hidden" style={{ top: `${top}px`, height: `${height}px`, background: "rgba(59,130,246,0.15)", borderLeft: "3px solid #3b82f6" }}>
                    <div className="font-bold text-sm text-white truncate">{event.title}</div>
                    {height > 50 && <div className="text-xs text-zinc-400 mt-1">{event.startTime} - {event.endTime}</div>}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="glass-panel" style={{ position: "sticky", top: "100px" }}>
          <h3 className="text-lg font-bold mb-6">Add Event</h3>
          <form onSubmit={handleAddEvent} className="space-y-4">
            <div><label className="text-sm text-zinc-400 block mb-1">Title</label><input type="text" className="input-field" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Deep Work Session" /></div>
            <div><label className="text-sm text-zinc-400 block mb-1">Description</label><textarea className="input-field" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Focus on core engine refactoring" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm text-zinc-400 block mb-1">Start</label><input type="time" className="input-field" value={startTime} onChange={(e) => setStartTime(e.target.value)} /></div>
              <div><label className="text-sm text-zinc-400 block mb-1">End</label><input type="time" className="input-field" value={endTime} onChange={(e) => setEndTime(e.target.value)} /></div>
            </div>
            <button type="submit" className="primary-button w-full" disabled={isAdding || !title}>{isAdding ? "Adding..." : "Add Event"}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
