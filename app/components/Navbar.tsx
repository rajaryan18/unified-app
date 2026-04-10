"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { Dumbbell, ClipboardList, Briefcase, LogOut, User, LayoutDashboard, Calendar } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/gym", label: "Gym", icon: Dumbbell },
  { href: "/productivity", label: "Productivity", icon: ClipboardList },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/jobs", label: "Job Tracker", icon: Briefcase },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1e293b]/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo + Nav Links */}
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-black gradient-text tracking-tight">
              Unified App
            </Link>
            <div className="flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || 
                  (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-white/10 text-white"
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon size={16} />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <div className="h-7 w-7 bg-white/10 rounded-full flex items-center justify-center">
                  <User size={14} className="text-zinc-400" />
                </div>
                <span className="text-zinc-300 font-medium">{user.name || user.email}</span>
              </div>
            )}
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 text-red-400 rounded-lg text-sm font-semibold hover:bg-white/10 transition-all"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
