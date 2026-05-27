"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MOCK_WELLNESS_TIPS } from "../../data/mockData";
import { Sparkles, ChevronDown, BookOpen } from "lucide-react";
import { cn } from "../../lib/utils";

export default function WellnessTips() {
  const [expandedId, setExpandedId] = useState<string | null>("tip-1");

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const categoryColors = {
    "Cycle Aligning": "bg-primary/10 border-primary/20 text-primary",
    Nutrition: "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400",
    Sleep: "bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400",
    "Mental Health": "bg-pink-500/10 border-pink-500/20 text-pink-600 dark:text-pink-400",
    Activity: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="glass-card rounded-3xl p-6 flex flex-col justify-between h-full"
    >
      <div className="flex items-center justify-between border-b border-border/40 pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <BookOpen className="h-4.5 w-4.5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Education</span>
            <h3 className="text-xl font-bold mt-0.5 text-foreground font-sans">Self-Care Guide</h3>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/15 px-2.5 py-1 rounded-full">
          <Sparkles className="h-3.5 w-3.5 fill-primary/20" /> Active Sync
        </div>
      </div>

      {/* Accordion container */}
      <div className="mt-5 space-y-3 flex-1">
        {MOCK_WELLNESS_TIPS.map((tip) => {
          const isExpanded = expandedId === tip.id;
          const colorClass = categoryColors[tip.category] || "bg-muted text-muted-foreground border-border";

          return (
            <div
              key={tip.id}
              className={cn(
                "border border-border/60 rounded-2xl overflow-hidden transition-all duration-200",
                isExpanded ? "bg-muted/10 shadow-sm" : "bg-card hover:bg-muted/10"
              )}
            >
              {/* Header Tab clicker */}
              <button
                onClick={() => toggleExpand(tip.id)}
                className="w-full flex items-center justify-between p-4 text-left select-none cursor-pointer"
              >
                <div className="flex flex-col gap-1.5 flex-1 pr-4">
                  <span className={cn("text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border self-start", colorClass)}>
                    {tip.category}
                  </span>
                  <span className="text-xs font-bold text-foreground/90">{tip.title}</span>
                </div>

                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-muted-foreground"
                >
                  <ChevronDown className="h-4 w-4" />
                </motion.div>
              </button>

              {/* Collapsible Content */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-4 pb-4 pt-0 text-xs text-muted-foreground leading-relaxed border-t border-border/20 pt-3">
                      {tip.content}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
