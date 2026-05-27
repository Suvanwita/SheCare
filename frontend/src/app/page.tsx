"use client";

import React, { useState, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import {
  Sparkles,
  Sun,
  Moon,
  Menu,
  X,
  Heart,
  Droplet,
  ClipboardList,
  Bell,
  CalendarCheck,
  FileText,
  BrainCircuit,
  ArrowRight,
  ShieldCheck,
  Lock,
  UserCheck,
  ShieldAlert,
  HeartHandshake
} from "lucide-react";
import { LANDING_NAV_ITEMS } from "../constants";
import { cn } from "../lib/utils";

const subscribeToMount = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export default function LandingPage() {
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const mounted = useSyncExternalStore(
    subscribeToMount,
    getClientSnapshot,
    getServerSnapshot
  );

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 15 } }
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const featureCards = [
    {
      icon: Heart,
      color: "text-rose-500 bg-rose-500/10",
      title: "Cycle & Menstrual Tracking",
      description: "Log cycle dates, visualize phases (Menstrual, Follicular, Ovulatory, Luteal) in a circular radial calendar, and get future flow predictions."
    },
    {
      icon: ClipboardList,
      color: "text-violet-500 bg-violet-500/10",
      title: "Daily Symptom Journaling",
      description: "Log symptoms, severity, and mental states using Zod-validated schemas. Trace triggers, cramps, fatigue, and log historical self-care steps."
    },
    {
      icon: Bell,
      color: "text-amber-500 bg-amber-500/10",
      title: "Medication & Pill Reminders",
      description: "Never miss vitamins, supplements, or prescriptions with structured schedule notifications custom-synced to your active cycle phases."
    },
    {
      icon: CalendarCheck,
      color: "text-sky-500 bg-sky-500/10",
      title: "Doctor Appointments Manager",
      description: "Store schedules, list notes for consults, and keep appointment timelines synced directly to prevent forgotten visits."
    },
    {
      icon: FileText,
      color: "text-pink-500 bg-pink-500/10",
      title: "Structured Medical Reports",
      description: "Save health documents, lab parameters, and scan reviews securely in a digital format for rapid reference during checkups."
    },
    {
      icon: BrainCircuit,
      color: "text-emerald-500 bg-emerald-500/10",
      title: "Intelligent PCOS Risk insights",
      description: "Gain self-assessment predictions, track clinical markers, and obtain educational guidelines to identify early potential signs of PCOS."
    }
  ];

  const steps = [
    {
      num: "01",
      title: "Log Daily Health Vitals",
      desc: "Record sleep quality, mood, hydration levels, activity metrics, and localized physical indicators."
    },
    {
      num: "02",
      title: "Get Smart Scheduling Reminders",
      desc: "Receive prompt alerts for clinical checks, daily prescriptions, physical workouts, and hydration targets."
    },
    {
      num: "03",
      title: "Visualize Cycle Trends",
      desc: "Observe detailed Recharts analysis charts correlating cycle phases with your sleep quality and stress levels."
    },
    {
      num: "04",
      title: "Check Health Risk Insights",
      desc: "Analyze symptoms to predict health anomalies and sync reports for preventative consultations."
    }
  ];

  const privacyFeatures = [
    {
      icon: ShieldCheck,
      title: "Encrypted Secure Records",
      desc: "Your records, logs, and notes are encrypted at rest and in transit using bank-grade cryptographic protocols."
    },
    {
      icon: UserCheck,
      title: "Role-Based Access Delegation",
      desc: "Explicitly share specific reports or logs with your gynecologist while keeping other personal files locked."
    },
    {
      icon: Lock,
      title: "Complete User Data Ownership",
      desc: "No selling of your personal health data. Export all reports or delete your entire database instantly."
    },
    {
      icon: HeartHandshake,
      title: "HIPAA-Friendly Architecture",
      desc: "Built from the ground up to respect federal healthcare confidentiality rules, prioritizing private health safety."
    }
  ];

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background font-sans transition-colors duration-200">
      
      {/* Dynamic light glowing background effects */}
      <div className="absolute top-0 right-0 -z-10 h-[600px] w-[600px] rounded-full blur-3xl opacity-20 bg-gradient-to-tr from-primary/30 to-secondary/30" />
      <div className="absolute top-[800px] left-0 -z-10 h-[500px] w-[500px] rounded-full blur-3xl opacity-15 bg-gradient-to-br from-secondary/20 to-primary/20" />

      {/* 1. HEADER / NAVIGATION */}
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300 border-b border-transparent",
          scrolled
            ? "bg-background/80 backdrop-blur-md border-border/40 shadow-sm"
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo Branding */}
          <Link href="/" className="flex items-center gap-2" aria-label="SheCare home">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-secondary text-white shadow-md shadow-primary/20">
              <Sparkles className="h-5 w-5 fill-white/20" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              SheCare
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-muted-foreground">
            {LANDING_NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover:text-foreground transition-colors duration-150"
              >
                {item.title}
              </Link>
            ))}
          </nav>

          {/* Action Bar (Theme and CTA) */}
          <div className="hidden md:flex items-center gap-3">
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card hover:bg-muted text-foreground transition-all cursor-pointer"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5 text-indigo-600" />}
              </button>
            )}

            <Link
              href="/dashboard"
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-foreground text-background hover:opacity-90 shadow-md transition-all active:scale-97 cursor-pointer"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Hamburguer menu */}
          <div className="flex items-center gap-2 md:hidden">
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-foreground"
              >
                {theme === "dark" ? <Sun className="h-4.5 w-4.5 text-amber-500" /> : <Moon className="h-4.5 w-4.5 text-indigo-600" />}
              </button>
            )}
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-b border-border bg-card px-4 py-4 space-y-3.5 flex flex-col md:hidden text-sm font-semibold text-muted-foreground"
            >
              {LANDING_NAV_ITEMS.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "hover:text-foreground py-1",
                    index === LANDING_NAV_ITEMS.length - 1 && "border-t border-border pt-3.5"
                  )}
                >
                  {item.title}
                </Link>
              ))}
              
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-foreground text-background text-center flex items-center justify-center"
              >
                Get Started
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-24 md:pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Column */}
          <motion.div
            initial={{ opacity: 0, x: -35 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 space-y-6 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/15 shadow-sm">
              <Sparkles className="h-4 w-4 fill-primary/10 animate-pulse" /> Unified Wellness Ecosystem
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight font-display leading-[1.1] text-foreground">
              Personalized women’s health tracking,{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                reminders, and risk insights.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0">
              SheCare is a comprehensive self-care partner. Securely trace your menstrual cycle phases, map symptoms, trigger smart medical and prescription reminders, coordinate appointments, and receive intelligent assessment analytics for PCOS risk markers.
            </p>

            {/* CTA Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-primary to-secondary text-white hover:opacity-95 shadow-md shadow-primary/15 flex items-center justify-center gap-2 group transition-all"
              >
                Start Tracking
                <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-1" />
              </Link>
              
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl font-bold text-sm border border-border bg-card text-foreground hover:bg-muted/50 flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                View Demo Dashboard
              </Link>
            </div>
          </motion.div>

          {/* Right Hero Column (Floating visual cards stack representing app stats) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 35 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="lg:col-span-5 relative h-[360px] sm:h-[420px] flex items-center justify-center select-none"
          >
            {/* Ambient glowing radial blur */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-primary/10 via-secondary/15 to-transparent rounded-full blur-3xl scale-90" />

            {/* Float Card 1: Cycle Tracker Dial Widget */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="absolute top-4 left-4 w-72 glass-card rounded-3xl p-5 border border-border/50 shadow-xl z-20"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-rose-500 font-bold uppercase tracking-wider bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/15">
                  Luteal Phase
                </span>
                <span className="text-[10px] text-muted-foreground font-medium">Day 22 of 28</span>
              </div>
              <div className="mt-4 flex items-center gap-4">
                <div className="h-14 w-14 shrink-0 rounded-full border-4 border-dashed border-primary flex items-center justify-center bg-primary/5 text-primary text-xs font-black shadow-inner shadow-primary/5">
                  22
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-foreground">6 Days Remaining</h4>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">Swap heavy workouts for soft Pilates today.</p>
                </div>
              </div>
            </motion.div>

            {/* Float Card 2: Hydration Analytics Mini Card */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
              className="absolute bottom-6 right-2 w-64 glass-card rounded-2xl p-4 border border-border/50 shadow-xl z-10"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/10 text-sky-500">
                    <Droplet className="h-4 w-4 fill-sky-500/10" />
                  </div>
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide">Hydration</span>
                </div>
                <span className="text-[9px] text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded-md uppercase">72% Done</span>
              </div>
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span>1.8L</span>
                  <span className="text-muted-foreground font-medium text-[10px]">Goal: 2.5L</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500 rounded-full" style={{ width: "72%" }} />
                </div>
              </div>
            </motion.div>

            {/* Float Card 3: Prescriptions / Reminders Mini Widget */}
            <motion.div
              animate={{ x: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="absolute right-6 top-1/3 w-60 glass-card rounded-2xl p-3.5 border border-border/50 shadow-lg z-0"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-6.5 w-6.5 items-center justify-center rounded-md bg-amber-500/10 text-amber-500">
                  <Bell className="h-3.5 w-3.5" />
                </div>
                <div className="text-[10px]">
                  <p className="font-bold">Vitamin D3 + Magnesium</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">Alert set for 8:00 PM</p>
                </div>
              </div>
            </motion.div>

          </motion.div>

        </div>
      </section>

      {/* 3. FEATURE SECTION */}
      <section id="features" className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-muted/20 border-y border-border/30">
        <div className="max-w-7xl mx-auto space-y-16">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-primary uppercase tracking-widest block">Core Ecosystem</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display text-foreground">
              Designed with complete modularity for your health.
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
              Every detail is meticulously crafted to support medical logs, predictions, tracking patterns, and confidential reminders.
            </p>
          </div>

          {/* Cards Grid */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {featureCards.map((feat, index) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="glass-card rounded-3xl p-6 border border-border/50 hover:border-primary/25 hover:shadow-lg transition-all duration-300 group flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl text-foreground shadow-sm transition-transform duration-300 group-hover:scale-105", feat.color)}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-lg font-bold text-foreground/90 font-sans group-hover:text-primary transition-colors duration-200">
                        {feat.title}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {feat.description}
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 flex items-center text-[11px] text-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    Learn more <ArrowRight className="h-3 w-3 ml-1" />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

        </div>
      </section>

      {/* 4. HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-20 md:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-16">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-secondary uppercase tracking-widest block font-sans">Methodology</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display text-foreground font-sans">
              Continuous care in four simple steps.
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
              How SheCare syncs parameters to construct self-care predictions, schedules, and reports.
            </p>
          </div>

          {/* Steps Timeline Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="relative space-y-3 p-5 rounded-2xl border border-border/40 bg-card hover:bg-muted/10 transition-colors"
              >
                {/* Horizontal connector line on desktop */}
                {idx < 3 && (
                  <div className="hidden lg:block absolute top-10 left-full w-full h-[1px] bg-gradient-to-r from-border to-transparent -z-10" />
                )}

                <span className="text-4xl font-black bg-gradient-to-br from-primary/20 to-secondary/35 bg-clip-text text-transparent block font-display">
                  {step.num}
                </span>
                <h3 className="text-sm font-extrabold text-foreground/90">{step.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* 5. PRIVACY & SECURITY SECTION */}
      <section id="privacy" className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-muted/20 border-y border-border/30">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Grid: Trust Branding */}
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5 space-y-6"
          >
            <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/15 uppercase tracking-wide">
              <ShieldCheck className="h-4 w-4" /> Military-Grade Secrecy
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display text-foreground leading-tight">
              Confidentiality is not an option. It is our core commitment.
            </h2>
            
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              We understand that reproductive health files and parameters represent the most private details. SheCare ensures your entries are sealed away, keeping you in complete control of whom you share them with.
            </p>

            <div className="p-4 rounded-2xl bg-card border border-border/80 flex items-start gap-3.5 shadow-sm">
              <ShieldAlert className="h-6 w-6 text-primary mt-0.5 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-foreground">Zero Health-Data Commercialization</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                  Unlike conventional period trackers, SheCare guarantees that your details will never be sold, packaged, or shared with commercial marketers.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Grid: Security Cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5 select-none">
            {privacyFeatures.map((pf, idx) => {
              const Icon = pf.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="p-5 rounded-2xl border border-border bg-card space-y-3.5 hover:shadow-md transition-shadow"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <h4 className="text-xs font-bold text-foreground">{pf.title}</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{pf.desc}</p>
                </motion.div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 6. CALL TO ACTION CONTAINER */}
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        {/* Glow behind */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 -z-10 h-72 w-full rounded-full blur-3xl opacity-10 bg-gradient-to-r from-primary via-secondary to-transparent" />

        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-display text-foreground leading-[1.15]">
            Take charge of your wellness journey today.
          </h2>
          <p className="text-xs sm:text-base text-muted-foreground leading-relaxed max-w-xl mx-auto">
            Get instant cycle predictions, log schedules, securely save diagnostic files, and check clinical PCOS risk assessments immediately.
          </p>

          <div className="flex items-center justify-center">
            <Link
              href="/dashboard"
              className="px-8 py-4 rounded-2xl font-bold text-xs bg-foreground text-background hover:opacity-90 shadow-lg active:scale-97 flex items-center gap-2 group transition-all"
            >
              Start Your Free Sync
              <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="border-t border-border bg-card px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1: Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-primary to-secondary text-white shadow-sm">
                <Heart className="h-4.5 w-4.5 fill-white/20" />
              </div>
              <span className="text-base font-bold text-foreground">SheCare</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Empowering reproductive health, scheduling reminders, and predictions with absolute security and premium diagnostics.
            </p>
          </div>

          {/* Col 2: Services Links */}
          <div className="space-y-3.5 text-xs">
            <h4 className="font-bold text-foreground">Ecosystem</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link href="/dashboard" className="hover:text-foreground">Cycle Tracker</Link></li>
              <li><Link href="/dashboard" className="hover:text-foreground">Symptom Journal</Link></li>
              <li><Link href="/dashboard" className="hover:text-foreground">Risk Insights</Link></li>
              <li><Link href="/dashboard" className="hover:text-foreground">Reminders</Link></li>
            </ul>
          </div>

          {/* Col 3: Resources Links */}
          <div className="space-y-3.5 text-xs">
            <h4 className="font-bold text-foreground">Resources</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#features" className="hover:text-foreground">Features Catalog</a></li>
              <li><a href="#how-it-works" className="hover:text-foreground">How It Works</a></li>
              <li><a href="#privacy" className="hover:text-foreground">Confidentiality Policy</a></li>
              <li><Link href="/dashboard" className="hover:text-foreground">Vitals Demo</Link></li>
            </ul>
          </div>

          {/* Col 4: Platform Rules */}
          <div className="space-y-3.5 text-xs">
            <h4 className="font-bold text-foreground">Security Compliance</h4>
            <p className="text-muted-foreground leading-relaxed">
              We encrypt 100% of cycle diaries. We strictly conform to CCPA privacy models, ensuring your self-care timeline belongs solely to you.
            </p>
          </div>

        </div>

        {/* Legal copyrights */}
        <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <p>© 2026 SheCare Technologies Inc. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-foreground cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-foreground cursor-pointer">Privacy Charter</span>
            <span>•</span>
            <span className="hover:text-foreground cursor-pointer">CCPA Opt-Out</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
