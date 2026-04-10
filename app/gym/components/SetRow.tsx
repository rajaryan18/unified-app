"use client";

import React from "react";
import { Trash2 } from "lucide-react";

interface SetRowProps {
  index: number;
  weight: string;
  reps: string;
  onUpdate: (field: "weight" | "reps", value: string) => void;
  onRemove: () => void;
  isOnlySet: boolean;
}

export const SetRow: React.FC<SetRowProps> = ({
  index,
  weight,
  reps,
  onUpdate,
  onRemove,
  isOnlySet,
}) => {
  return (
    <div className="grid grid-cols-12 gap-4 items-center">
      <div className="col-span-1 flex justify-center">
        <span className="w-6 h-6 rounded-full bg-zinc-50 flex items-center justify-center text-xs font-bold text-zinc-400 border border-zinc-100">
          {index + 1}
        </span>
      </div>
      <div className="col-span-5">
        <input
          type="number"
          placeholder="0"
          value={weight}
          onChange={(e) => onUpdate("weight", e.target.value)}
          className="w-full bg-zinc-50/50 border border-zinc-100 rounded-xl px-4 py-3 text-center focus:bg-white focus:border-zinc-300 focus:ring-4 focus:ring-zinc-100 transition-all outline-none"
        />
      </div>
      <div className="col-span-5">
        <input
          type="number"
          placeholder="0"
          value={reps}
          onChange={(e) => onUpdate("reps", e.target.value)}
          className="w-full bg-zinc-50/50 border border-zinc-100 rounded-xl px-4 py-3 text-center focus:bg-white focus:border-zinc-300 focus:ring-4 focus:ring-zinc-100 transition-all outline-none"
        />
      </div>
      <div className="col-span-1 flex justify-end">
        {!isOnlySet && (
          <button
            onClick={onRemove}
            className="text-zinc-200 hover:text-red-400 p-1 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
};
