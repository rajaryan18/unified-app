"use client";

import { motion } from "framer-motion";
import { Trash2, ArrowRight, ArrowLeft, CheckCircle2, Play, ListTodo } from "lucide-react";

type TimeSegment = "Before breakfast" | "Before lunch" | "Before gym" | "Before dinner" | "Before sleep";
type GoalStatus = "todo" | "in_progress" | "completed";

interface Goal {
  goalId: string;
  text: string;
  segment: TimeSegment;
  status: GoalStatus;
  isCompleted: boolean;
}

const SEGMENT_ICONS: Record<TimeSegment, string> = {
  "Before breakfast": "🌅",
  "Before lunch": "☀️",
  "Before gym": "💪",
  "Before dinner": "🌙",
  "Before sleep": "💤"
};

const SEGMENT_COLORS: Record<TimeSegment, string> = {
  "Before breakfast": "#f59e0b",
  "Before lunch": "#3b82f6",
  "Before gym": "#10b981",
  "Before dinner": "#8b5cf6",
  "Before sleep": "#6366f1"
};

interface GoalCardProps {
  goal: Goal;
  onUpdateStatus: (goalId: string, newStatus: GoalStatus) => void;
  onDelete: (goalId: string) => void;
  isDeleting: boolean;
  setDeletingId: (id: string | null) => void;
  isClassifying: boolean;
}

export default function GoalCard({ 
  goal, 
  onUpdateStatus, 
  onDelete, 
  isDeleting, 
  setDeletingId,
  isClassifying 
}: GoalCardProps) {
  const getNextStatus = (current: GoalStatus): GoalStatus | null => {
    if (current === "todo") return "in_progress";
    if (current === "in_progress") return "completed";
    return null;
  };

  const getPrevStatus = (current: GoalStatus): GoalStatus | null => {
    if (current === "in_progress") return "todo";
    if (current === "completed") return "in_progress";
    return null;
  };

  const nextStatus = getNextStatus(goal.status);
  const prevStatus = getPrevStatus(goal.status);

  return (
    <motion.div
      layoutId={goal.goalId}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`glass-panel p-4 mb-3 border-l-[6px] transition-all hover:shadow-lg group ${isClassifying ? 'ring-2 ring-emerald-400/50' : ''}`}
      style={{ borderLeftColor: SEGMENT_COLORS[goal.segment], background: "rgba(255, 255, 255, 0.03)" }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl drop-shadow-sm" title={goal.segment}>{SEGMENT_ICONS[goal.segment]}</span>
            <span className="text-[10px] font-black uppercase tracking-[0.15em] opacity-40 group-hover:opacity-60 transition-opacity" style={{ color: SEGMENT_COLORS[goal.segment] }}>
              {goal.segment.split(' ')[1] || goal.segment}
            </span>
          </div>
          <p className={`text-[15px] font-semibold tracking-tight leading-relaxed ${goal.status === 'completed' ? 'line-through opacity-40' : 'text-zinc-100'}`}>
            {goal.text}
          </p>
        </div>
        <button 
          onClick={() => setDeletingId(goal.goalId)}
          className="text-zinc-600 hover:text-red-400 transition-colors p-1"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {isDeleting ? (
        <div className="flex items-center gap-2 mt-2 animate-in fade-in slide-in-from-top-1">
          <span className="text-[10px] font-bold text-red-400">DELETE?</span>
          <button onClick={() => onDelete(goal.goalId)} className="bg-red-500 text-white text-[10px] px-2 py-1 rounded font-bold">YES</button>
          <button onClick={() => setDeletingId(null)} className="bg-white/10 text-zinc-400 text-[10px] px-2 py-1 rounded font-bold">NO</button>
        </div>
      ) : (
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
          <div className="flex gap-1">
            {prevStatus && (
              <button 
                onClick={() => onUpdateStatus(goal.goalId, prevStatus)}
                className="p-1.5 rounded-lg bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
                title={`Move to ${prevStatus.replace('_', ' ')}`}
              >
                <ArrowLeft size={14} />
              </button>
            )}
          </div>
          <div className="flex gap-1">
            {nextStatus && (
              <button 
                onClick={() => onUpdateStatus(goal.goalId, nextStatus)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  nextStatus === 'completed' 
                    ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white' 
                    : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white'
                }`}
              >
                {nextStatus === 'in_progress' ? <Play size={12} fill="currentColor" /> : <CheckCircle2 size={12} />}
                {nextStatus === 'in_progress' ? 'START' : 'DONE'}
                <ArrowRight size={12} />
              </button>
            )}
            {goal.status === 'completed' && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-500/60 cursor-default">
                <CheckCircle2 size={12} /> COMPLETED
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
