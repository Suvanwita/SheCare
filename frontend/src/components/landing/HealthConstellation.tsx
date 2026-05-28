"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  BedDouble,
  Droplets,
  Dumbbell,
  FileText,
  HeartPulse,
  MoonStar,
  ShieldAlert,
} from "lucide-react";
import { cn } from "../../lib/utils";

const nodes = [
  {
    id: "cycle",
    label: "Cycle",
    tooltip: "Track patterns over time.",
    x: 50,
    y: 18,
    icon: MoonStar,
    tone: "text-rose-500 bg-rose-500/12",
  },
  {
    id: "sleep",
    label: "Sleep",
    tooltip: "See how rest affects symptoms.",
    x: 22,
    y: 32,
    icon: BedDouble,
    tone: "text-sky-500 bg-sky-500/12",
  },
  {
    id: "mood",
    label: "Mood",
    tooltip: "Notice emotional trends across your cycle.",
    x: 76,
    y: 34,
    icon: HeartPulse,
    tone: "text-pink-500 bg-pink-500/12",
  },
  {
    id: "hydration",
    label: "Hydration",
    tooltip: "Connect water intake with daily wellbeing.",
    x: 34,
    y: 56,
    icon: Droplets,
    tone: "text-cyan-500 bg-cyan-500/12",
  },
  {
    id: "symptoms",
    label: "Symptoms",
    tooltip: "Log pain, flow, energy, and recurring signals.",
    x: 62,
    y: 56,
    icon: Activity,
    tone: "text-violet-500 bg-violet-500/12",
  },
  {
    id: "exercise",
    label: "Exercise",
    tooltip: "Understand movement habits beside cycle changes.",
    x: 18,
    y: 76,
    icon: Dumbbell,
    tone: "text-emerald-500 bg-emerald-500/12",
  },
  {
    id: "reports",
    label: "Reports",
    tooltip: "Keep clinical context close to your timeline.",
    x: 82,
    y: 76,
    icon: FileText,
    tone: "text-amber-500 bg-amber-500/12",
  },
  {
    id: "pcos-risk",
    label: "PCOS Risk",
    tooltip: "Estimate risk using health indicators.",
    x: 50,
    y: 84,
    icon: ShieldAlert,
    tone: "text-fuchsia-500 bg-fuchsia-500/12",
  },
];

const links = [
  ["cycle", "sleep"],
  ["cycle", "mood"],
  ["cycle", "symptoms"],
  ["sleep", "hydration"],
  ["sleep", "exercise"],
  ["mood", "symptoms"],
  ["hydration", "symptoms"],
  ["hydration", "exercise"],
  ["symptoms", "reports"],
  ["symptoms", "pcos-risk"],
  ["reports", "pcos-risk"],
  ["exercise", "pcos-risk"],
];

type NodeId = (typeof nodes)[number]["id"];

export default function HealthConstellation() {
  const [activeNode, setActiveNode] = useState<NodeId | null>(null);
  const nodeMap = useMemo(() => new Map(nodes.map((node) => [node.id, node])), []);
  const connectedNodeIds = useMemo(() => {
    if (!activeNode) return new Set<NodeId>();

    return new Set(
      links
        .filter(([from, to]) => from === activeNode || to === activeNode)
        .flat()
    );
  }, [activeNode]);

  const isHighlightedLink = (from: string, to: string) => {
    if (!activeNode) return false;
    return from === activeNode || to === activeNode;
  };

  return (
    <section className="relative overflow-hidden border-y border-border/60 bg-muted/20 px-4 py-20 sm:px-6 lg:px-8">
      <motion.div
        aria-hidden="true"
        animate={{ opacity: [0.18, 0.34, 0.18], scale: [1, 1.08, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-1/2 top-20 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/18 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="text-xs font-black uppercase text-secondary">Health Constellation</p>
          <h2 className="mt-3 font-display text-3xl font-black text-foreground sm:text-4xl">
            Your health signals are connected, not isolated.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Explore how cycle patterns, rest, symptoms, movement, reports, and risk indicators can live in one connected view.
          </p>
        </motion.div>

        <div className="mx-auto mt-10 hidden max-w-6xl rounded-[2rem] border border-white/45 bg-white/55 p-4 shadow-2xl shadow-primary/10 backdrop-blur-2xl dark:border-white/10 dark:bg-white/10 md:block">
          <div className="relative h-[560px] overflow-hidden rounded-[1.5rem] border border-border/70 bg-background/80">
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="constellation-line" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.15" />
                  <stop offset="50%" stopColor="hsl(var(--secondary))" stopOpacity="0.65" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.15" />
                </linearGradient>
              </defs>
              {links.map(([from, to], index) => {
                const start = nodeMap.get(from);
                const end = nodeMap.get(to);
                if (!start || !end) return null;
                const highlighted = isHighlightedLink(from, to);

                return (
                  <motion.line
                    key={`${from}-${to}`}
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke="url(#constellation-line)"
                    strokeWidth={highlighted ? 0.42 : 0.22}
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    whileInView={{ pathLength: 1, opacity: highlighted ? 1 : 0.62 }}
                    viewport={{ once: true, margin: "-80px" }}
                    animate={{
                      strokeDashoffset: [0, -18],
                      opacity: highlighted ? [0.72, 1, 0.72] : [0.32, 0.62, 0.32],
                    }}
                    transition={{
                      pathLength: { duration: 0.8, delay: index * 0.04 },
                      strokeDashoffset: { duration: 2.6, repeat: Infinity, ease: "linear" },
                      opacity: { duration: 2.8, repeat: Infinity, ease: "easeInOut" },
                    }}
                    strokeDasharray="5 6"
                  />
                );
              })}
            </svg>

            {nodes.map((node, index) => {
              const Icon = node.icon;
              const active = activeNode === node.id;
              const connected = connectedNodeIds.has(node.id);

              return (
                <motion.button
                  key={node.id}
                  type="button"
                  onMouseEnter={() => setActiveNode(node.id)}
                  onMouseLeave={() => setActiveNode(null)}
                  initial={{ opacity: 0, scale: 0.72 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-80px" }}
                  animate={{
                    scale: active ? 1.18 : connected ? 1.07 : 1,
                    y: [0, -4, 0],
                  }}
                  transition={{
                    opacity: { duration: 0.35, delay: index * 0.06 },
                    scale: { type: "spring", stiffness: 230, damping: 18 },
                    y: { duration: 3.4, delay: index * 0.2, repeat: Infinity, ease: "easeInOut" },
                  }}
                  className="absolute z-10 -translate-x-1/2 -translate-y-1/2 text-left"
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                >
                  <span
                    className={cn(
                      "relative flex h-24 w-24 flex-col items-center justify-center rounded-full border bg-card/86 p-3 text-center shadow-lg backdrop-blur-xl transition",
                      active || connected
                        ? "border-primary/35 shadow-primary/20"
                        : "border-border/70 shadow-foreground/5"
                    )}
                  >
                    <motion.span
                      aria-hidden="true"
                      animate={{ opacity: [0.2, 0.52, 0.2], scale: [1, 1.28, 1] }}
                      transition={{ duration: 2.7, delay: index * 0.18, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute inset-0 rounded-full bg-primary/16 blur-md"
                    />
                    <span className={cn("relative flex h-10 w-10 items-center justify-center rounded-2xl", node.tone)}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="relative mt-2 text-xs font-black text-foreground">{node.label}</span>
                  </span>

                  {active && (
                    <motion.span
                      initial={{ opacity: 0, y: 8, scale: 0.94 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="absolute left-1/2 top-[calc(100%+0.75rem)] z-20 w-48 -translate-x-1/2 rounded-2xl border border-border/70 bg-popover p-3 text-center text-xs font-bold leading-relaxed text-popover-foreground shadow-xl"
                    >
                      {node.tooltip}
                    </motion.span>
                  )}
                </motion.button>
              );
            })}

            <div className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary shadow-[0_0_44px_hsl(var(--primary)/0.26)]">
              <HeartPulse className="h-9 w-9" />
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-3 md:hidden">
          {nodes.map((node, index) => {
            const Icon = node.icon;
            return (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.35, delay: index * 0.04 }}
                className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl", node.tone)}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-black text-foreground">{node.label}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{node.tooltip}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
