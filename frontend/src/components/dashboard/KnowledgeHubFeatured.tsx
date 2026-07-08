"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Search, ArrowUpRight, GraduationCap } from "lucide-react";

interface GuideItem {
  id: string;
  title: string;
  category: string;
  readTime: string;
  slug: string;
}

export default function KnowledgeHubFeatured() {
  const guides: GuideItem[] = [
    {
      id: "1",
      title: "Hydration Goals for Hormone Health",
      category: "Nutrition",
      readTime: "4 min read",
      slug: "hydration-goals-for-hormone-health"
    },
    {
      id: "2",
      title: "Mindfulness for Cycle Stress and Anxiety",
      category: "Mental Health",
      readTime: "4 min read",
      slug: "mindfulness-for-cycle-stress"
    },
    {
      id: "3",
      title: "Sleep Quality and Fertility: Deep Rest Cycles",
      category: "Lifestyle",
      readTime: "5 min read",
      slug: "sleep-quality-and-fertility"
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="glass-card rounded-3xl p-6 flex flex-col justify-between h-full relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full blur-3xl opacity-10 bg-gradient-to-tr from-secondary/40 to-primary/40" />

      {/* Header and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40 z-10">
        <div>
          <span className="text-xs font-semibold text-muted-foreground tracking-wider">
            Educational Guides
          </span>
          <h3 className="text-xl font-bold mt-0.5 text-foreground font-sans flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" /> Health & Care Library
          </h3>
        </div>

        {/* Quick Search Input */}
        <div className="relative flex items-center bg-muted/60 border border-border/50 rounded-2xl px-3 py-1.5 shrink-0 sm:w-56">
          <Search className="h-3.5 w-3.5 text-muted-foreground mr-2" />
          <input
            type="text"
            placeholder="Search health topics..."
            className="w-full bg-transparent text-xs outline-none text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Featured list */}
      <div className="flex-1 my-5 space-y-4 z-10">
        {guides.map((guide) => (
          <Link
            key={guide.id}
            href={`/dashboard/knowledge/${guide.slug}`}
            className="group flex items-center justify-between border border-border/60 hover:border-primary/20 hover:bg-muted/40 p-3.5 rounded-2xl cursor-pointer transition-all duration-300"
          >
            <div className="space-y-1 pr-4">
              <div className="flex items-center gap-2">
                <span className="text-[9px] bg-primary/10 text-primary border border-primary/20 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {guide.category}
                </span>
                <span className="text-[10px] text-muted-foreground font-semibold">
                  {guide.readTime}
                </span>
              </div>
              <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-relaxed">
                {guide.title}
              </h4>
            </div>

            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-card border border-border/50 text-muted-foreground group-hover:bg-primary group-hover:text-white group-hover:border-transparent transition-all duration-300">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </Link>
        ))}
      </div>

      {/* Bottom shortcut links */}
      <div className="mt-4 pt-4 border-t border-border/40 z-10 flex items-center justify-between text-xs text-muted-foreground font-semibold">
        <Link href="/dashboard/knowledge" className="flex items-center gap-1.5 hover:text-foreground cursor-pointer transition-colors">
          <GraduationCap className="h-4.5 w-4.5 text-primary" /> Browse all Knowledge Hub articles
        </Link>
      </div>
    </motion.div>
  );
}
