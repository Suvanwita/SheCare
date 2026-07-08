"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { CheckSquare, Square, Check, ClipboardList } from "lucide-react";
import { cn } from "../../lib/utils";

interface ChecklistItem {
  id: string;
  task: string;
  category: string;
  done: boolean;
}

export default function DailyChecklist() {
  const [items, setItems] = useState<ChecklistItem[]>([
    { id: "1", task: "Drink 2.5 Liters of Water", category: "Hydration", done: false },
    { id: "2", task: "Log symptoms and mood today", category: "Wellness Logs", done: true },
    { id: "3", task: "Take morning/evening supplements", category: "Medication", done: false },
    { id: "4", task: "Log hours of sleep", category: "Rest", done: false },
    { id: "5", task: "Read a featured wellness guide", category: "Education", done: false },
  ]);

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  const completedCount = items.filter((i) => i.done).length;
  const progressPercent = Math.round((completedCount / items.length) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card rounded-3xl p-6 flex flex-col justify-between h-full relative overflow-hidden"
    >
      {/* Background radial accent light effect */}
      <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-20 bg-gradient-to-br from-primary/30 to-secondary/30" />

      {/* Header Info */}
      <div className="flex items-center justify-between z-10">
        <div>
          <span className="text-xs font-semibold text-muted-foreground tracking-wider">
            Daily Action Items
          </span>
          <h3 className="text-xl font-bold mt-0.5 text-foreground flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" /> Daily Checklist
          </h3>
        </div>
        <span className="text-xs font-bold bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full shadow-sm">
          {progressPercent}% Complete
        </span>
      </div>

      {/* Checklist Progress Bar */}
      <div className="mt-5 mb-4 z-10 space-y-1.5">
        <div className="flex justify-between text-xs text-muted-foreground font-semibold">
          <span>Progress</span>
          <span>
            {completedCount} of {items.length} tasks
          </span>
        </div>
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-secondary"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Tasks List */}
      <div className="flex-1 space-y-3 z-10 my-2">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleItem(item.id)}
            className={cn(
              "group flex items-center justify-between border p-3 rounded-2xl cursor-pointer transition-all duration-200 select-none",
              item.done
                ? "border-emerald-500/20 bg-emerald-500/5 text-muted-foreground"
                : "border-border/60 hover:border-primary/30 hover:bg-muted/30 text-foreground"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="shrink-0 transition-transform duration-200 group-hover:scale-105">
                {item.done ? (
                  <div className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-500 text-white">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                ) : (
                  <Square className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                )}
              </div>
              <div className="text-xs flex flex-col gap-0.5">
                <span className={cn("font-semibold", item.done && "line-through")}>
                  {item.task}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                  {item.category}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
