export const ANALYTICS_SUMMARY = {
  averageCycleLength: "28 days",
  averageSleep: "7.3 hrs",
  waterIntakeTrend: "+14%",
  moodScore: "82/100",
  medicationAdherence: 88,
  mostCommonSymptom: "Fatigue",
  overallHealthScore: 86,
};

export const CYCLE_TREND = [
  { month: "Jan", cycleLength: 28 },
  { month: "Feb", cycleLength: 27 },
  { month: "Mar", cycleLength: 28 },
  { month: "Apr", cycleLength: 29 },
  { month: "May", cycleLength: 28 },
  { month: "Jun", cycleLength: 28 },
];

export const SYMPTOM_FREQUENCY = [
  { symptom: "Fatigue", count: 12 },
  { symptom: "Cramps", count: 9 },
  { symptom: "Bloating", count: 8 },
  { symptom: "Headache", count: 5 },
  { symptom: "Acne", count: 4 },
  { symptom: "Nausea", count: 3 },
];

export const MOOD_TREND = [
  { week: "W1", moodScore: 74 },
  { week: "W2", moodScore: 78 },
  { week: "W3", moodScore: 81 },
  { week: "W4", moodScore: 82 },
  { week: "W5", moodScore: 86 },
  { week: "W6", moodScore: 84 },
];

export const SLEEP_WATER_TREND = [
  { day: "Mon", sleepHours: 7.4, waterMl: 1800 },
  { day: "Tue", sleepHours: 7.5, waterMl: 1950 },
  { day: "Wed", sleepHours: 7.8, waterMl: 2200 },
  { day: "Thu", sleepHours: 6.9, waterMl: 1700 },
  { day: "Fri", sleepHours: 7.2, waterMl: 2100 },
  { day: "Sat", sleepHours: 8.1, waterMl: 2400 },
  { day: "Sun", sleepHours: 7.6, waterMl: 2300 },
];

export const MEDICATION_ADHERENCE = [
  { name: "Taken", value: 88, fill: "hsl(var(--primary))" },
  { name: "Missed", value: 12, fill: "hsl(var(--muted))" },
];

export const AI_INSIGHTS = [
  {
    title: "Stable cycle pattern",
    description: "Your cycle has remained stable for 3 months.",
  },
  {
    title: "Sleep and fatigue link",
    description: "Sleep patterns may correlate with fatigue symptoms.",
  },
  {
    title: "Hydration improvement",
    description: "Hydration consistency improved this week.",
  },
];

export const WELLNESS_FACTORS = [
  { label: "Cycle stability", value: 92 },
  { label: "Sleep consistency", value: 78 },
  { label: "Hydration", value: 84 },
  { label: "Medication adherence", value: 88 },
];

export const IMPROVEMENT_SUGGESTIONS = [
  "Keep water intake above 2.2L on high-activity days.",
  "Plan lighter workouts when fatigue and cramps overlap.",
  "Maintain supplement reminders during late luteal phase.",
];
