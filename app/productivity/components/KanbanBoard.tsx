"use client";

import { motion } from "framer-motion";
import StatusColumn from "./StatusColumn";

type GoalStatus = "todo" | "in_progress" | "completed";
type TimeSegment = "Before breakfast" | "Before lunch" | "Before gym" | "Before dinner" | "Before sleep";

interface Goal {
  goalId: string;
  text: string;
  segment: TimeSegment;
  status: GoalStatus;
  isCompleted: boolean;
}

interface KanbanBoardProps {
  goals: Goal[];
  onUpdateStatus: (goalId: string, newStatus: GoalStatus) => void;
  onDeleteGoal: (goalId: string) => void;
  onAddGoal: (text: string, segment: TimeSegment) => void;
  classifyingGoalId: string | null;
  deletingGoalId: string | null;
  setDeletingGoalId: (id: string | null) => void;
}

export default function KanbanBoard({
  goals,
  onUpdateStatus,
  onDeleteGoal,
  onAddGoal,
  classifyingGoalId,
  deletingGoalId,
  setDeletingGoalId,
}: KanbanBoardProps) {
  const columns: { title: string; status: GoalStatus; color: string }[] = [
    { title: "To Do", status: "todo", color: "#94a3b8" },
    { title: "In Progress", status: "in_progress", color: "#3b82f6" },
    { title: "Completed", status: "completed", color: "#10b981" }
  ];

  const getGoalsByStatus = (status: GoalStatus) => goals.filter(g => g.status === status);

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start min-h-[600px] pb-20">
      {columns.map((col) => (
        <StatusColumn
          key={col.status}
          title={col.title}
          status={col.status}
          goals={getGoalsByStatus(col.status)}
          onUpdateStatus={onUpdateStatus}
          onDeleteGoal={onDeleteGoal}
          onAddGoal={col.status === "todo" ? onAddGoal : undefined}
          classifyingGoalId={classifyingGoalId}
          deletingGoalId={deletingGoalId}
          setDeletingGoalId={setDeletingGoalId}
          accentColor={col.color}
        />
      ))}
    </div>
  );
}
