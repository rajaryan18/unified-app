"use client";

import { motion, AnimatePresence } from "framer-motion";
import GoalCard from "./GoalCard";
import { Plus } from "lucide-react";
import { useState } from "react";

type GoalStatus = "todo" | "in_progress" | "completed";
type TimeSegment = "Before breakfast" | "Before lunch" | "Before gym" | "Before dinner" | "Before sleep";

interface Goal {
  goalId: string;
  text: string;
  segment: TimeSegment;
  status: GoalStatus;
  isCompleted: boolean;
}

interface StatusColumnProps {
  title: string;
  status: GoalStatus;
  goals: Goal[];
  onUpdateStatus: (goalId: string, newStatus: GoalStatus) => void;
  onDeleteGoal: (goalId: string) => void;
  onAddGoal?: (text: string, segment: TimeSegment) => void;
  classifyingGoalId: string | null;
  deletingGoalId: string | null;
  setDeletingGoalId: (id: string | null) => void;
  accentColor: string;
}

const SEGMENTS: TimeSegment[] = ["Before breakfast", "Before lunch", "Before gym", "Before dinner", "Before sleep"];
const SEGMENT_ICONS: Record<TimeSegment, string> = { "Before breakfast": "🌅", "Before lunch": "☀️", "Before gym": "💪", "Before dinner": "🌙", "Before sleep": "💤" };

export default function StatusColumn({
  title,
  status,
  goals,
  onUpdateStatus,
  onDeleteGoal,
  onAddGoal,
  classifyingGoalId,
  deletingGoalId,
  setDeletingGoalId,
  accentColor
}: StatusColumnProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newGoalText, setNewGoalText] = useState("");
  const [newGoalSegment, setNewGoalSegment] = useState<TimeSegment>("Before breakfast");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGoalText.trim() && onAddGoal) {
      onAddGoal(newGoalText.trim(), newGoalSegment);
      setNewGoalText("");
      setIsAdding(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-w-[320px] max-w-[400px] flex-1">
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }}></div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">{title}</h3>
          <span className="bg-white/5 text-zinc-500 text-[10px] font-black px-2 py-0.5 rounded-full border border-white/5">
            {goals.length}
          </span>
        </div>
        {onAddGoal && (
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            <Plus size={18} />
          </button>
        )}
      </div>

      <div className="flex-1 space-y-3 custom-scrollbar overflow-y-auto min-h-[500px] pb-10 pr-2">
        <AnimatePresence mode="popLayout">
          {isAdding && (
            <motion.form 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onSubmit={handleAdd}
              className="glass-panel p-4 mb-3 border-l-4"
              style={{ background: "rgba(255, 255, 255, 0.05)", borderLeftColor: accentColor }}
            >
              <input 
                autoFocus
                type="text" 
                className="input-field text-sm mb-3" 
                placeholder="What needs to be done?"
                value={newGoalText}
                onChange={(e) => setNewGoalText(e.target.value)}
              />
              
              <div className="flex items-center gap-1 mb-4 bg-black/20 p-1 rounded-xl w-fit">
                {SEGMENTS.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setNewGoalSegment(s)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${newGoalSegment === s ? 'bg-white/10 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                    title={s}
                  >
                    {SEGMENT_ICONS[s]}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <button type="submit" className="primary-button text-xs py-1.5 flex-1">Add Task</button>
                <button 
                  type="button" 
                  onClick={() => setIsAdding(false)} 
                  className="px-3 py-1.5 bg-white/5 text-zinc-400 text-xs rounded-lg hover:bg-white/10"
                >
                  Cancel
                </button>
              </div>
            </motion.form>
          )}

          {goals.map((goal) => (
            <GoalCard 
              key={goal.goalId}
              goal={goal}
              onUpdateStatus={onUpdateStatus}
              onDelete={onDeleteGoal}
              isDeleting={deletingGoalId === goal.goalId}
              setDeletingId={setDeletingGoalId}
              isClassifying={classifyingGoalId === goal.goalId}
            />
          ))}
        </AnimatePresence>

        {goals.length === 0 && !isAdding && (
          <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-2xl text-zinc-600 text-xs italic">
            <span>No tasks in {title.toLowerCase()}</span>
          </div>
        )}
      </div>
    </div>
  );
}
