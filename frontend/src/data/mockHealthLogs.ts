export type HealthMood = "happy" | "calm" | "tired" | "stressed" | "sad";

export type HealthSymptom =
  | "cramps"
  | "headache"
  | "acne"
  | "bloating"
  | "fatigue"
  | "nausea"
  | "mood_swings";

export interface HealthLogEntry {
  id: string;
  date: string;
  mood: HealthMood;
  symptoms: HealthSymptom[];
  sleepHours: number;
  waterIntake: number;
  weight: number;
  notes?: string;
}

export const HEALTH_MOOD_OPTIONS: Array<{ value: HealthMood; label: string }> = [
  { value: "happy", label: "Happy" },
  { value: "calm", label: "Calm" },
  { value: "tired", label: "Tired" },
  { value: "stressed", label: "Stressed" },
  { value: "sad", label: "Sad" },
];

export const HEALTH_SYMPTOM_OPTIONS: Array<{ value: HealthSymptom; label: string }> = [
  { value: "cramps", label: "Cramps" },
  { value: "headache", label: "Headache" },
  { value: "acne", label: "Acne" },
  { value: "bloating", label: "Bloating" },
  { value: "fatigue", label: "Fatigue" },
  { value: "nausea", label: "Nausea" },
  { value: "mood_swings", label: "Mood swings" },
];

export const MOCK_HEALTH_LOGS: HealthLogEntry[] = [
  {
    id: "health-log-2026-05-27",
    date: "2026-05-27",
    mood: "calm",
    symptoms: ["fatigue", "bloating"],
    sleepHours: 7.5,
    waterIntake: 2100,
    weight: 63.5,
    notes: "Light walk helped with bloating. Energy was steady by evening.",
  },
  {
    id: "health-log-2026-05-26",
    date: "2026-05-26",
    mood: "tired",
    symptoms: ["cramps", "fatigue"],
    sleepHours: 6.8,
    waterIntake: 1800,
    weight: 63.7,
    notes: "Mild cramps after lunch. Used heating pad.",
  },
  {
    id: "health-log-2026-05-25",
    date: "2026-05-25",
    mood: "happy",
    symptoms: ["acne"],
    sleepHours: 8.1,
    waterIntake: 2400,
    weight: 63.4,
    notes: "Good sleep and low stress day.",
  },
  {
    id: "health-log-2026-05-24",
    date: "2026-05-24",
    mood: "stressed",
    symptoms: ["headache", "mood_swings"],
    sleepHours: 6.2,
    waterIntake: 1500,
    weight: 63.9,
    notes: "Long workday. Headache eased after hydration.",
  },
  {
    id: "health-log-2026-05-23",
    date: "2026-05-23",
    mood: "calm",
    symptoms: ["nausea", "bloating"],
    sleepHours: 7.2,
    waterIntake: 2000,
    weight: 63.6,
    notes: "Kept meals simple. Felt better at night.",
  },
];
