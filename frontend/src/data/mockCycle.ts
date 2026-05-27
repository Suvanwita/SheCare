export type FlowIntensity = "light" | "medium" | "heavy";

export interface CycleEntry {
  id: string;
  startDate: string;
  endDate: string;
  flowIntensity: FlowIntensity;
  notes?: string;
}

export const MOCK_CYCLE_ENTRIES: CycleEntry[] = [
  {
    id: "cycle-2026-05",
    startDate: "2026-05-06",
    endDate: "2026-05-10",
    flowIntensity: "medium",
    notes: "Mild cramps on day 2, normal energy by day 4.",
  },
  {
    id: "cycle-2026-04",
    startDate: "2026-04-08",
    endDate: "2026-04-12",
    flowIntensity: "heavy",
    notes: "Heavier first two days. Used heat therapy.",
  },
  {
    id: "cycle-2026-03",
    startDate: "2026-03-11",
    endDate: "2026-03-15",
    flowIntensity: "medium",
    notes: "Steady flow, light fatigue.",
  },
  {
    id: "cycle-2026-02",
    startDate: "2026-02-12",
    endDate: "2026-02-16",
    flowIntensity: "light",
    notes: "Shorter cycle with lighter flow.",
  },
  {
    id: "cycle-2026-01",
    startDate: "2026-01-15",
    endDate: "2026-01-19",
    flowIntensity: "medium",
    notes: "Typical pattern.",
  },
];

export const FLOW_INTENSITY_VALUES: Record<FlowIntensity, number> = {
  light: 1,
  medium: 2,
  heavy: 3,
};
