import { NavItem, CyclePhase } from "../types";

export const LANDING_NAV_ITEMS = [
  { title: "Features", href: "/#features" },
  { title: "How It Works", href: "/#how-it-works" },
  { title: "Privacy", href: "/#privacy" },
  { title: "Dashboard", href: "/dashboard" },
];

export const NAVIGATION_ITEMS: NavItem[] = [
  { title: "Overview", href: "/dashboard", iconName: "LayoutDashboard" },
  { title: "Cycle Analytics", href: "/dashboard#cycle-analytics", iconName: "CalendarDays" },
  { title: "Wellness Logs", href: "/dashboard#wellness-logs", iconName: "HeartPulse" },
  { title: "AI Assistant", href: "/dashboard#ai-assistant", iconName: "Sparkles" },
];

export interface PhaseDetail {
  name: string;
  description: string;
  badgeColor: string;
  textColor: string;
  bgGradient: string;
  exerciseRec: string;
  dietRec: string;
}

export const CYCLE_PHASES_DETAILS: Record<CyclePhase, PhaseDetail> = {
  Menstrual: {
    name: "Menstrual Phase",
    description: "Your cycle has begun. Focus on rest, renewal, and warm, nourishing foods.",
    badgeColor: "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900",
    textColor: "text-rose-600 dark:text-rose-400",
    bgGradient: "from-rose-500/20 to-pink-500/20",
    exerciseRec: "Gentle walks, yin yoga, stretching",
    dietRec: "Iron-rich foods, ginger tea, warm stews",
  },
  Follicular: {
    name: "Follicular Phase",
    description: "Estrogen is rising. Energy and creativity are increasing. Great time for learning new skills.",
    badgeColor: "bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900",
    textColor: "text-indigo-600 dark:text-indigo-400",
    bgGradient: "from-indigo-500/20 to-violet-500/20",
    exerciseRec: "Light jogging, dynamic vinyasa yoga, strength training",
    dietRec: "Probiotic-rich foods, fresh salads, lean proteins",
  },
  Ovulatory: {
    name: "Ovulatory Phase",
    description: "Estrogen and LH peak. You are at your most social, energetic, and fertile phase.",
    badgeColor: "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900",
    textColor: "text-purple-600 dark:text-purple-400",
    bgGradient: "from-purple-500/20 to-fuchsia-500/20",
    exerciseRec: "High-intensity interval training (HIIT), spinning, heavy lifts",
    dietRec: "Raw veggies, fruits, anti-inflammatory crucifers",
  },
  Luteal: {
    name: "Luteal Phase",
    description: "Progesterone dominates. Slow down, focus on self-care, and nesting routines.",
    badgeColor: "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900",
    textColor: "text-amber-600 dark:text-amber-400",
    bgGradient: "from-amber-500/20 to-orange-500/20",
    exerciseRec: "Pilates, moderate walking, swimming",
    dietRec: "Complex carbs, magnesium-rich foods (dark chocolate), herbal tea",
  },
};

export const SYMPTOM_OPTIONS = [
  { id: "cramps", label: "Cramps" },
  { id: "headache", label: "Headache" },
  { id: "bloating", label: "Bloating" },
  { id: "fatigue", label: "Fatigue" },
  { id: "mood_swings", label: "Mood Swings" },
  { id: "nausea", label: "Nausea" },
  { id: "acne", label: "Acne Breakouts" },
  { id: "backache", label: "Lower Back Pain" },
];

export const MOOD_OPTIONS = [
  { id: "happy", label: "Happy", emoji: "😊" },
  { id: "calm", label: "Calm", emoji: "😌" },
  { id: "energetic", label: "Energetic", emoji: "⚡" },
  { id: "tired", label: "Tired", emoji: "😴" },
  { id: "anxious", label: "Anxious", emoji: "😰" },
  { id: "irritable", label: "Irritable", emoji: "😠" },
  { id: "sad", label: "Sad", emoji: "😢" },
];
