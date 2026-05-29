export interface CycleIrregularityPayload {
  age: number;
  cycle_length: number;
  period_duration: number;
  stress_level: number;
  sleep_hours: number;
  exercise_frequency: number;
  bmi: number;
  mood_score: number;
  pain_level: number;
  weight_change: number;
  previous_cycle_length: number;
}

export interface CycleContributingFactor {
  factor: string;
  value: number | null;
  impact: number;
  description: string;
}

export interface CycleIrregularityPrediction {
  probability: number;
  cycle_pattern: "Regular" | "Irregular";
  risk_level: "Low" | "Moderate" | "High";
  contributing_factors: CycleContributingFactor[];
  recommendation: string;
  disclaimer: string;
}

const CYCLE_ML_API_URL =
  process.env.NEXT_PUBLIC_CYCLE_ML_API_URL ?? "http://localhost:8001";

export async function predictCycleIrregularity(
  payload: CycleIrregularityPayload
): Promise<CycleIrregularityPrediction> {
  const response = await fetch(
    `${CYCLE_ML_API_URL.replace(/\/$/, "")}/predict-cycle-irregularity`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  const body = await response.json();

  if (!response.ok) {
    throw new Error(body?.detail || "Cycle insight is temporarily unavailable.");
  }

  return body as CycleIrregularityPrediction;
}
