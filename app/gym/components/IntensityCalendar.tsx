"use client";

import React, { useMemo, useState } from "react";
import { useWorkouts } from "../hooks/useWorkouts";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

export const IntensityCalendar: React.FC = () => {
  const { workouts } = useWorkouts();
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const prevMonthDays = [];
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      prevMonthDays.push({ day: prevMonthLastDay - i, currentMonth: false, date: new Date(year, month - 1, prevMonthLastDay - i) });
    }
    const currentMonthDays = [];
    for (let i = 1; i <= daysInMonth; i++) {
      currentMonthDays.push({ day: i, currentMonth: true, date: new Date(year, month, i) });
    }
    const allDays = [...prevMonthDays, ...currentMonthDays];
    const nextMonthDaysNeeded = 42 - allDays.length;
    for (let i = 1; i <= nextMonthDaysNeeded; i++) {
      allDays.push({ day: i, currentMonth: false, date: new Date(year, month + 1, i) });
    }
    return { days: allDays, monthYear: currentDate.toLocaleDateString("default", { month: "long", year: "numeric" }) };
  }, [currentDate]);

  const dailyIntensity = useMemo(() => {
    const map: Record<string, number> = {};
    workouts.forEach((session) => {
      const dateStr = new Date(session.date).toDateString();
      let volume = 0;
      session.exercises.forEach((ex) => { ex.sets.forEach((set) => { volume += (parseFloat(set.weight) || 0) * (parseInt(set.reps) || 0); }); });
      map[dateStr] = (map[dateStr] || 0) + volume;
    });
    return map;
  }, [workouts]);

  const maxIntensity = useMemo(() => {
    const values = Object.values(dailyIntensity);
    return values.length > 0 ? Math.max(...values) : 0;
  }, [dailyIntensity]);

  const changeMonth = (offset: number) => { setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1)); };
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm flex flex-col w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <CalendarIcon size={20} className="text-zinc-500" />
          <h2 className="text-lg font-bold text-black uppercase tracking-wider">Workout Consistency</h2>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">{monthData.monthYear}</span>
          <div className="flex items-center gap-1">
            <button onClick={() => changeMonth(-1)} className="p-1.5 hover:bg-zinc-50 rounded-lg transition-colors text-zinc-400 hover:text-black"><ChevronLeft size={16} /></button>
            <button onClick={() => changeMonth(1)} className="p-1.5 hover:bg-zinc-50 rounded-lg transition-colors text-zinc-400 hover:text-black"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-y-4">
        {weekDays.map((day) => (<div key={day} className="text-center text-[10px] font-black uppercase tracking-widest text-zinc-400 pb-2">{day}</div>))}
        {monthData.days.map((item, idx) => {
          const dateStr = item.date.toDateString();
          const intensity = dailyIntensity[dateStr] || 0;
          const isToday = new Date().toDateString() === dateStr;
          const circleSize = intensity > 0 ? Math.max(16, Math.min(36, (intensity / maxIntensity) * 36)) : 0;
          return (
            <div key={idx} className="relative flex items-center justify-center aspect-square flex-col">
              {intensity > 0 && (<div className="absolute inset-0 m-auto rounded-full bg-black/5 border border-black/10 transition-all duration-500" style={{ width: `${circleSize}px`, height: `${circleSize}px` }} />)}
              <span className={`relative text-xs font-bold transition-colors ${item.currentMonth ? (isToday ? "text-black" : "text-zinc-600") : "text-zinc-200"} ${isToday && item.currentMonth ? "underline underline-offset-4 decoration-black decoration-2" : ""}`}>
                {item.day}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-6 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-black/5 border border-black/10" /><span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Lower Intensity</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-black/5 border border-black/10" /><span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Higher Intensity</span></div>
      </div>
    </div>
  );
};
