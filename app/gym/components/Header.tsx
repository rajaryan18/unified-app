"use client";

import React from "react";
import { Dumbbell, Plus, LogOut, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface HeaderProps {
  onAddSessionClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onAddSessionClick }) => {
  const { user, logout } = useAuth();

  return (
    <header className="mb-2 md:mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-black mb-2 flex items-center gap-3">
            <span className="p-2 bg-black text-white rounded-xl shadow-lg shadow-black/10">
              <Dumbbell size={28} />
            </span>
            Gym Log
          </h1>
          <p className="text-zinc-500 font-medium text-sm md:text-base italic">
            Track your progress, build your legacy.
          </p>
        </div>

        <button
          onClick={onAddSessionClick}
          className="md:hidden flex items-center justify-center p-3 bg-black text-white rounded-2xl shadow-lg shadow-black/10 active:scale-95 transition-all"
          aria-label="Add new session"
        >
          <Plus size={24} />
        </button>
      </div>

      <div className="flex items-center gap-4 self-end sm:self-center">
        {user && (
          <div className="flex flex-col items-end mr-2">
            <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">
              Authenticated
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-black">
                Logged in as {user.name || user.email}
              </span>
              <div className="h-6 w-6 bg-zinc-100 rounded-full flex items-center justify-center border border-zinc-200">
                <User size={12} className="text-zinc-400" />
              </div>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-zinc-200 text-black rounded-xl font-bold text-sm shadow-sm hover:bg-zinc-50 hover:border-zinc-300 active:scale-95 transition-all"
        >
          <LogOut size={16} />
          <span>Log Out</span>
        </button>
      </div>
    </header>
  );
};
