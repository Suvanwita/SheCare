import { CycleStatus, WellnessVitals, WellnessTip } from "../types";

export const MOCK_CYCLE_STATUS: CycleStatus = {
  phase: "Luteal",
  cycleDay: 22,
  totalCycleLength: 28,
  periodDuration: 5,
  daysUntilNext: 6,
  nextPeriodDate: "2026-06-02",
  ovulationWindow: false,
};

export const MOCK_WELLNESS_VITALS: WellnessVitals = {
  sleepScore: 82,
  sleepHours: 7.5,
  stressLevel: 4,
  hydrationMl: 1800,
  hydrationGoalMl: 2500,
  steps: 8430,
  stepsGoal: 10000,
};

export const MOCK_WELLNESS_HISTORY = [
  { day: "Wed", sleepScore: 75, sleepHours: 6.8, stressLevel: 6, hydrationMl: 1500, steps: 6200 },
  { day: "Thu", sleepScore: 80, sleepHours: 7.2, stressLevel: 5, hydrationMl: 2000, steps: 8900 },
  { day: "Fri", sleepScore: 68, sleepHours: 5.9, stressLevel: 7, hydrationMl: 1200, steps: 5100 },
  { day: "Sat", sleepScore: 92, sleepHours: 8.5, stressLevel: 2, hydrationMl: 2400, steps: 11200 },
  { day: "Sun", sleepScore: 88, sleepHours: 8.0, stressLevel: 3, hydrationMl: 2100, steps: 9400 },
  { day: "Mon", sleepScore: 81, sleepHours: 7.4, stressLevel: 4, hydrationMl: 1800, steps: 7800 },
  { day: "Tue", sleepScore: 82, sleepHours: 7.5, stressLevel: 4, hydrationMl: 1950, steps: 8430 },
];

export const MOCK_WELLNESS_TIPS: WellnessTip[] = [
  {
    id: "tip-1",
    category: "Cycle Aligning",
    title: "Luteal Phase Activity Sync",
    content: "Since you are in the Luteal phase, your body shifts from burning carbs to fats. Swap high-intensity HIIT for strength building or fluid Pilates. Be gentle with your body as core temperature rises.",
  },
  {
    id: "tip-2",
    category: "Nutrition",
    title: "Magnesium for Muscle Relief",
    content: "Adding pumpkin seeds, spinach, and high-quality dark chocolate (70%+) to your diet now can alleviate potential luteal cramps and boost your mood via magnesium enrichment.",
  },
  {
    id: "tip-3",
    category: "Sleep",
    title: "Optimize Luteal Sleep Hygiene",
    content: "Progesterone spikes in the late luteal phase, which can raise your body temperature. Keep your bedroom slightly cooler tonight (around 65-68°F / 18-20°C) to support uninterrupted REM sleep.",
  },
  {
    id: "tip-4",
    category: "Mental Health",
    title: "Quiet Mindfulness & Journaling",
    content: "Luteal energy is naturally reflective. Set aside 10 minutes tonight to journal. Write down any stress triggers you felt today to release their weight before rest.",
  },
];
