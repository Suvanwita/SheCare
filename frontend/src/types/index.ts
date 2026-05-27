export type CyclePhase = "Menstrual" | "Follicular" | "Ovulatory" | "Luteal";

export interface CycleStatus {
  phase: CyclePhase;
  cycleDay: number;
  totalCycleLength: number;
  periodDuration: number;
  daysUntilNext: number;
  nextPeriodDate: string;
  ovulationWindow: boolean;
}

export interface WellnessVitals {
  sleepScore: number;       // 0-100
  sleepHours: number;       // hours
  stressLevel: number;      // 1-10
  hydrationMl: number;      // ml consumed
  hydrationGoalMl: number;  // goal in ml
  steps: number;            // steps taken
  stepsGoal: number;        // goal steps
}

export interface SymptomLog {
  id: string;
  date: string;
  severity: "mild" | "moderate" | "severe";
  symptoms: string[];
  notes?: string;
  mood: string;
}

export interface WellnessTip {
  id: string;
  category: "Nutrition" | "Activity" | "Mental Health" | "Sleep" | "Cycle Aligning";
  title: string;
  content: string;
}

export interface NavItem {
  title: string;
  href: string;
  iconName: string;
}
