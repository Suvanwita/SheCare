"use client";

import React from "react";
import { motion } from "framer-motion";
import { Activity, Calendar, Droplet, Moon, Pill, CheckCircle } from "lucide-react";
import { cn } from "../../lib/utils";

interface ActivityItem {
  id: string;
  title: string;
  description: string;
  time: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

export default function ActivityTimeline() {
  const activities: ActivityItem[] = [
    {
      id: "1",
      title: "Appointment Confirmed",
      description: "Consultation with Dr. Sarah Jenkins (OB/GYN) scheduled.",
      time: "10:30 AM Today",
      icon: Calendar,
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10",
    },
    {
      id: "2",
      title: "Medication Taken",
      description: "Daily multivitamin reminder completed.",
      time: "8:45 AM Today",
      icon: Pill,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      id: "3",
      title: "Hydration Logged",
      description: "Recorded +500ml water intake.",
      time: "7:30 AM Today",
      icon: Droplet,
      color: "text-sky-500",
      bgColor: "bg-sky-500/10",
    },
    {
      id: "4",
      title: "Sleep Tracked",
      description: "Logged 7.5 hours of sleep (Good quality).",
      time: "11:30 PM Yesterday",
      icon: Moon,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="glass-card rounded-3xl p-6 flex flex-col justify-between h-full"
    >
      {/* Header */}
      <div className="pb-4 border-b border-border/40">
        <span className="text-xs font-semibold text-muted-foreground tracking-wider">
          Updates & Actions
        </span>
        <h3 className="text-xl font-bold mt-0.5 text-foreground font-sans flex items-center gap-2">
          <Activity className="h-5 w-5 text-secondary" /> Recent Activity
        </h3>
      </div>

      {/* Activity Timeline List */}
      <div className="flex-1 mt-5 space-y-5 relative pl-4 border-l border-border/60 ml-2.5">
        {activities.map((act, index) => {
          const Icon = act.icon;
          return (
            <div key={act.id} className="relative group">
              {/* Timeline Bullet node */}
              <div
                className={cn(
                  "absolute -left-[27px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full border bg-card transition-transform duration-200 group-hover:scale-110",
                  act.color.replace("text-", "border-")
                )}
              >
                <div className={cn("h-2 w-2 rounded-full", act.color.replace("text-", "bg-"))} />
              </div>

              {/* Text detail */}
              <div className="space-y-1 select-none">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                    {act.title}
                  </span>
                  <span className="text-[10px] font-semibold text-muted-foreground">
                    {act.time}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {act.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Summary Action */}
      <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between text-xs font-bold text-primary hover:text-secondary cursor-pointer transition-colors">
        <span>View Full Activity History</span>
        <CheckCircle className="h-4 w-4" />
      </div>
    </motion.div>
  );
}
