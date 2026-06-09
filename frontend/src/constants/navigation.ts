import {
  Activity,
  BarChart3,
  Bell,
  CalendarCheck,
  CalendarDays,
  ClipboardList,
  BookOpen,
  FileText,
  History,
  LayoutDashboard,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";

export interface DashboardNavigationItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export const DASHBOARD_NAVIGATION: DashboardNavigationItem[] = [
  { title: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { title: "Cycle Tracker", href: "/dashboard/cycle", icon: CalendarDays },
  { title: "Health Logs", href: "/dashboard/health-logs", icon: ClipboardList },
  { title: "Knowledge Hub", href: "/dashboard/knowledge", icon: BookOpen },
  { title: "Reminders", href: "/dashboard/reminders", icon: Bell },
  { title: "Appointments", href: "/dashboard/appointments", icon: CalendarCheck },
  { title: "Reports", href: "/dashboard/reports", icon: FileText },
  { title: "Timeline", href: "/dashboard/timeline", icon: History },
  { title: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { title: "PCOS Risk", href: "/dashboard/pcos-risk", icon: ShieldAlert },
];

export const DASHBOARD_FALLBACK_TITLE = "Dashboard";

export function getDashboardPageTitle(pathname: string) {
  return (
    DASHBOARD_NAVIGATION.find((item) => item.href === pathname)?.title ??
    DASHBOARD_FALLBACK_TITLE
  );
}

export const DASHBOARD_ROUTE_SUMMARIES: Record<string, { title: string; description: string; icon: LucideIcon }> = {
  "/dashboard/cycle": {
    title: "Cycle Tracker",
    description: "Review menstrual phases, predicted dates, fertility windows, and phase-aware care prompts.",
    icon: CalendarDays,
  },
  "/dashboard/health-logs": {
    title: "Health Logs",
    description: "Capture symptoms, mood, hydration, sleep, and notes for daily wellness patterns.",
    icon: ClipboardList,
  },
  "/dashboard/knowledge": {
    title: "Knowledge Hub",
    description: "Read cycle, hormone, PCOS, and wellness education with smart article suggestions.",
    icon: BookOpen,
  },
  "/dashboard/reminders": {
    title: "Reminders",
    description: "Plan medication, supplement, hydration, workout, and appointment reminders.",
    icon: Bell,
  },
  "/dashboard/appointments": {
    title: "Appointments",
    description: "Track upcoming consultations, doctor notes, visit history, and preparation tasks.",
    icon: CalendarCheck,
  },
  "/dashboard/reports": {
    title: "Reports",
    description: "Organize medical files, lab summaries, scan notes, and share-ready health records.",
    icon: FileText,
  },
  "/dashboard/analytics": {
    title: "Analytics",
    description: "Explore cycle, symptom, sleep, activity, and stress trends across time.",
    icon: BarChart3,
  },
  "/dashboard/timeline": {
    title: "Timeline",
    description: "Review your recent health activity across appointments, reminders, reports, and education.",
    icon: History,
  },
  "/dashboard/pcos-risk": {
    title: "PCOS Risk",
    description: "Review educational risk signals and prepare observations for clinical discussion.",
    icon: Activity,
  },
};
