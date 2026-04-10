"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from "recharts";
import { authenticatedFetch } from "@/lib/api";

const COLORS = ["#10b981", "#ef4444"];

export default function InsightsPage() {
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split("T")[0];
  const lastWeek = new Date(); lastWeek.setDate(lastWeek.getDate() - 6);
  const startDate = lastWeek.toISOString().split("T")[0];

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [dailyRes, weeklyRes] = await Promise.all([
          authenticatedFetch(`/api/insights?type=daily&date=${today}`),
          authenticatedFetch(`/api/insights?type=weekly&startDate=${startDate}&endDate=${today}`),
        ]);
        if (dailyRes.ok) setDailyData(await dailyRes.json());
        if (weeklyRes.ok) setWeeklyData(await weeklyRes.json());
      } catch (error) { console.error("Failed to fetch insight data:", error); }
      finally { setLoading(false); }
    }
    fetchData();
  }, [today, startDate]);

  const totalProductive = dailyData.reduce((acc, curr) => acc + (curr.productive || 0), 0);
  const totalWaste = dailyData.reduce((acc, curr) => acc + (curr.waste || 0), 0);
  const overallEfficiency = totalProductive + totalWaste > 0 ? Math.round((totalProductive / (totalProductive + totalWaste)) * 100) : 0;
  const pieData = [{ name: "Productive", value: totalProductive }, { name: "Waste", value: totalWaste }];

  if (loading) return <div className="h-screen flex items-center justify-center"><div className="animate-pulse text-blue-400 text-xl">Analyzing your productivity...</div></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      <header className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-black gradient-text mb-2">Productivity Insights</h1>
          <p className="text-zinc-400 text-lg">Understand where your time goes and optimize your focus.</p>
        </div>
        <Link href="/productivity" className="primary-button" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", padding: "12px 24px", borderRadius: "14px" }}>← Back to Dashboard</Link>
      </header>

      <div className="grid grid-cols-3 gap-6 mb-10">
        <div className="glass-panel stat-card"><div className="stat-label">Daily Efficiency</div><div className="stat-value text-emerald-400">{overallEfficiency}%</div><p className="text-xs text-zinc-500 mt-2">Productive vs Total today</p></div>
        <div className="glass-panel stat-card"><div className="stat-label">Tasks Today</div><div className="stat-value">{totalProductive + totalWaste}</div><p className="text-xs text-zinc-500 mt-2">Classified tasks today</p></div>
        <div className="glass-panel stat-card"><div className="stat-label text-blue-400 text-lg">{dailyData.sort((a, b) => (b.productive || 0) - (a.productive || 0))[0]?.name?.split(" ")[1] || "N/A"}</div><p className="text-xs text-zinc-500 mt-2">Most productive session</p></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="glass-panel p-8 min-h-[400px]">
          <h3 className="text-xl font-bold mb-6">Today&apos;s Sessions</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyData}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" /><XAxis dataKey="name" stroke="#94a3b8" fontSize={12} /><YAxis stroke="#94a3b8" fontSize={12} /><Tooltip contentStyle={{ background: "rgba(20,20,20,0.9)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px" }} /><Legend iconType="circle" /><Bar dataKey="productive" name="Productive" fill="#10b981" radius={[4, 4, 0, 0]} /><Bar dataKey="waste" name="Time Waste" fill="#ef4444" radius={[4, 4, 0, 0]} /></BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-panel p-8">
          <h3 className="text-xl font-bold mb-6">Weekly Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={weeklyData}><defs><linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" /><XAxis dataKey="date" stroke="#94a3b8" fontSize={12} /><YAxis stroke="#94a3b8" fontSize={12} /><Tooltip contentStyle={{ background: "rgba(20,20,20,0.9)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px" }} /><Legend iconType="circle" /><Area type="monotone" dataKey="productive" name="Productive" stroke="#10b981" fillOpacity={1} fill="url(#colorProd)" strokeWidth={3} /><Area type="monotone" dataKey="waste" name="Time Waste" stroke="#ef4444" fillOpacity={0} strokeWidth={3} strokeDasharray="5 5" /></AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-panel p-8 flex flex-col items-center">
        <h3 className="text-xl font-bold mb-6 w-full">Task Mix</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">{pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip contentStyle={{ background: "rgba(20,20,20,0.9)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px" }} /><Legend /></PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
