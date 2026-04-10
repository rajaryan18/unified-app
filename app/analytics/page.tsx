"use client";

import { useEffect, useState, useCallback } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { authenticatedFetch } from "@/lib/api";
import Link from "next/link";

const COLORS = ["#10b981", "#ef4444"];

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try { const response = await authenticatedFetch(`/api/analytics?date=${date}`); if (response.ok) setData(await response.json()); }
    catch (error) { console.error("Failed to fetch analytics:", error); }
    finally { setLoading(false); }
  }, [date]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  if (loading) return <div className="text-center py-20 text-zinc-400">Loading stats...</div>;
  if (!data) return <div className="text-center py-20 text-zinc-400">No data available.</div>;

  const pieData = [{ name: "Completed", value: data.completedGoals }, { name: "Pending", value: data.totalGoals - data.completedGoals }];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-black gradient-text mb-1">Analytics Overview</h2>
          <p className="text-zinc-400">Visualizing your productivity and goals</p>
        </div>
        <div className="flex gap-2">
          <input type="date" className="input-field w-auto" value={date} onChange={(e) => setDate(e.target.value)} />
          <Link href="/productivity" className="primary-button">← Dashboard</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel flex flex-col items-center justify-center min-h-[300px]">
          <h3 className="text-zinc-400 mb-4">Completion Rate</h3>
          <h1 className="text-6xl font-black gradient-text mb-4">{data.completionRate}%</h1>
          <div className="px-5 py-2 bg-white/5 rounded-full text-zinc-400 text-sm">{data.completedGoals} of {data.totalGoals} goals complete</div>
        </div>

        <div className="glass-panel">
          <h3 className="text-center text-white mb-4">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart><Pie data={pieData} innerRadius={70} outerRadius={90} paddingAngle={8} dataKey="value" stroke="none">{pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip contentStyle={{ background: "rgba(18,18,18,0.9)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px" }} itemStyle={{ color: "white" }} /></PieChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-panel md:col-span-2">
          <h3 className="text-white mb-1">Activity by Section</h3>
          <p className="text-zinc-400 text-sm mb-6">Tracking productivity across time periods</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.segmentBreakdown || []} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <XAxis dataKey="segment" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: "rgba(255,255,255,0.03)" }} contentStyle={{ background: "rgba(18,18,18,0.9)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px" }} />
              <Bar dataKey="completed" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} name="Completed" />
              <Bar dataKey="pending" stackId="a" fill="rgba(255,255,255,0.05)" radius={[6, 6, 0, 0]} name="Pending" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
