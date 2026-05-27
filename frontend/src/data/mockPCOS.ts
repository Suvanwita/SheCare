export type PcosRiskLevel = "Low Risk" | "Moderate Risk" | "High Risk";

export interface PcosRiskProfile {
  level: PcosRiskLevel;
  probability: number;
  recommendations: string[];
  nextActions: string[];
}

export const PCOS_RISK_PROFILES: Record<PcosRiskLevel, Omit<PcosRiskProfile, "level" | "probability">> = {
  "Low Risk": {
    recommendations: [
      "Maintain consistent cycle tracking for pattern visibility.",
      "Keep regular movement, hydration, and sleep routines.",
      "Review symptoms monthly and note any new changes.",
    ],
    nextActions: [
      "Continue logging cycles and health symptoms.",
      "Repeat this assessment if symptoms change.",
    ],
  },
  "Moderate Risk": {
    recommendations: [
      "Track irregular periods, acne, hair growth, and weight changes closely.",
      "Prioritize balanced meals, sleep consistency, and moderate exercise.",
      "Consider discussing hormone and metabolic markers with a clinician.",
    ],
    nextActions: [
      "Book a gynecology consultation if symptoms persist.",
      "Prepare recent cycle logs and symptom history for review.",
    ],
  },
  "High Risk": {
    recommendations: [
      "Seek professional evaluation for cycle irregularity and androgen-related symptoms.",
      "Discuss ultrasound, hormone profile, glucose, and insulin markers with a clinician.",
      "Use reminders for follow-up care, nutrition, movement, and sleep routines.",
    ],
    nextActions: [
      "Schedule an appointment with a gynecologist or endocrinologist.",
      "Bring cycle history, health logs, and reports to the consultation.",
    ],
  },
};

export const PCOS_HEALTH_TIPS = [
  "Consistent cycle tracking helps clinicians see irregularity patterns more clearly.",
  "Strength training and regular walks can support insulin sensitivity.",
  "High-quality sleep may help reduce stress-related symptom flare-ups.",
  "Balanced meals with protein and fiber can support energy and cravings.",
];

export const PCOS_BASE_FACTORS = [
  {
    label: "Cycle regularity",
    description: "Cycle length and irregularity signals.",
  },
  {
    label: "Androgen symptoms",
    description: "Hair growth, acne, and skin darkening indicators.",
  },
  {
    label: "Lifestyle load",
    description: "Sleep, stress, fast food, and exercise balance.",
  },
  {
    label: "Body metrics",
    description: "BMI and recent weight-gain indicators.",
  },
];
