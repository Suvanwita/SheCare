export type AppointmentType = "online" | "clinic";
export type AppointmentStatus = "upcoming" | "completed" | "cancelled";

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  type: AppointmentType;
  status: AppointmentStatus;
  reason: string;
  notes?: string;
}

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: "appointment-1",
    doctorId: "doc-anjali-rao",
    doctorName: "Dr. Anjali Rao",
    date: "2026-06-02",
    time: "11:00",
    type: "clinic",
    status: "upcoming",
    reason: "Cycle irregularity review",
    notes: "Carry recent cycle logs and reports.",
  },
  {
    id: "appointment-2",
    doctorId: "doc-priya-menon",
    doctorName: "Dr. Priya Menon",
    date: "2026-05-18",
    time: "14:00",
    type: "online",
    status: "completed",
    reason: "Luteal phase nutrition plan",
    notes: "Follow up after two weeks.",
  },
  {
    id: "appointment-3",
    doctorId: "doc-nisha-iyer",
    doctorName: "Dr. Nisha Iyer",
    date: "2026-05-12",
    time: "12:15",
    type: "online",
    status: "cancelled",
    reason: "Hormone panel discussion",
  },
];
