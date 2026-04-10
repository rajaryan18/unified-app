"use client";

import React from "react";
import { useAuth } from "./context/AuthContext";
import LoginForm from "./auth/LoginForm";
import Link from "next/link";
import { Dumbbell, ClipboardList, Briefcase, ArrowRight } from "lucide-react";

const FEATURES = [
  {
    href: "/gym",
    title: "Gym Log",
    description: "Track your workouts, monitor body weight, and visualize your progress with detailed analytics.",
    icon: Dumbbell,
    color: "from-blue-500 to-cyan-500",
  },
  {
    href: "/productivity",
    title: "Productivity Tracker",
    description: "Manage daily goals, schedule events, and analyze how you spend your time across different segments.",
    icon: ClipboardList,
    color: "from-emerald-500 to-teal-500",
  },
  {
    href: "/jobs",
    title: "Job Application Tracker",
    description: "Track your job applications, manage referrals, and follow up with your network effectively.",
    icon: Briefcase,
    color: "from-violet-500 to-purple-500",
  },
];

export default function Home() {
  const { user } = useAuth();

  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-black gradient-text mb-4">Welcome, {user.name || user.email}</h1>
        <p className="text-zinc-400 text-lg">Your all-in-one dashboard for fitness, productivity, and career growth.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <Link
              key={feature.href}
              href={feature.href}
              className="glass-panel group hover:border-white/20 transition-all hover:-translate-y-1 block"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon size={24} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">{feature.title}</h2>
              <p className="text-zinc-400 text-sm mb-4">{feature.description}</p>
              <div className="flex items-center gap-2 text-sm font-semibold text-zinc-300 group-hover:text-white transition-colors">
                Open <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
