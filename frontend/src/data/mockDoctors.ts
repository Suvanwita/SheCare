export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience: number;
  rating: number;
  location: string;
  availableSlots: string[];
  consultationFee: number;
  avatarInitials: string;
}

export const MOCK_DOCTORS: Doctor[] = [
  {
    id: "doc-anjali-rao",
    name: "Dr. Anjali Rao",
    specialization: "Gynecologist",
    experience: 12,
    rating: 4.9,
    location: "Bengaluru",
    availableSlots: ["09:30", "11:00", "16:30"],
    consultationFee: 1200,
    avatarInitials: "AR",
  },
  {
    id: "doc-meera-shah",
    name: "Dr. Meera Shah",
    specialization: "PCOS Specialist",
    experience: 9,
    rating: 4.8,
    location: "Mumbai",
    availableSlots: ["10:00", "13:30", "18:00"],
    consultationFee: 1500,
    avatarInitials: "MS",
  },
  {
    id: "doc-nisha-iyer",
    name: "Dr. Nisha Iyer",
    specialization: "Endocrinologist",
    experience: 15,
    rating: 4.7,
    location: "Chennai",
    availableSlots: ["08:45", "12:15"],
    consultationFee: 1800,
    avatarInitials: "NI",
  },
  {
    id: "doc-priya-menon",
    name: "Dr. Priya Menon",
    specialization: "Nutritionist",
    experience: 7,
    rating: 4.6,
    location: "Kochi",
    availableSlots: ["14:00", "17:30", "19:00"],
    consultationFee: 900,
    avatarInitials: "PM",
  },
  {
    id: "doc-kavya-sen",
    name: "Dr. Kavya Sen",
    specialization: "Reproductive Health",
    experience: 11,
    rating: 4.9,
    location: "Delhi",
    availableSlots: ["09:00", "15:00"],
    consultationFee: 1600,
    avatarInitials: "KS",
  },
];
