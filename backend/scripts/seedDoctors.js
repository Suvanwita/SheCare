const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Doctor = require('../models/Doctor');

dotenv.config();

const doctors = [
  {
    name: 'Dr. Anjali Rao',
    specialization: 'Gynecologist',
    experienceYears: 12,
    rating: 4.9,
    location: 'Bengaluru',
    consultationFee: 1200,
    availableSlots: ['09:30', '11:00', '16:30'],
    bio: 'Specializes in menstrual health, PCOS care, and preventive gynecology.',
    isVerified: true
  },
  {
    name: 'Dr. Meera Shah',
    specialization: 'Gynecologist',
    experienceYears: 10,
    rating: 4.8,
    location: 'Mumbai',
    consultationFee: 1400,
    availableSlots: ['10:00', '13:30', '18:00'],
    bio: 'Focuses on adolescent gynecology, cycle irregularity, and reproductive wellness.',
    isVerified: true
  },
  {
    name: 'Dr. Simran Varma',
    specialization: 'Gynecologist',
    experienceYears: 9,
    rating: 4.7,
    location: 'Chennai',
    consultationFee: 1300,
    availableSlots: ['09:00', '14:00', '17:00'],
    bio: 'Specializes in PCOS management, fertility counseling, and minimally invasive surgeries.',
    isVerified: true
  },
  {
    name: 'Dr. Nisha Iyer',
    specialization: 'Endocrinologist',
    experienceYears: 15,
    rating: 4.7,
    location: 'Chennai',
    consultationFee: 1800,
    availableSlots: ['08:45', '12:15', '17:00'],
    bio: 'Experienced in hormone health, thyroid care, insulin resistance, and PCOS evaluation.',
    isVerified: true
  },
  {
    name: 'Dr. Kavya Sen',
    specialization: 'Endocrinologist',
    experienceYears: 11,
    rating: 4.8,
    location: 'Delhi',
    consultationFee: 1600,
    availableSlots: ['09:00', '15:00', '19:00'],
    bio: 'Supports metabolic and endocrine care for reproductive-age women.',
    isVerified: true
  },
  {
    name: 'Dr. Divya Nair',
    specialization: 'Endocrinologist',
    experienceYears: 13,
    rating: 4.6,
    location: 'Bengaluru',
    consultationFee: 1700,
    availableSlots: ['10:30', '14:00', '18:00'],
    bio: 'Expert in diabetes management during pregnancy, thyroid disorders, and reproductive endocrinology.',
    isVerified: true
  },
  {
    name: 'Dr. Rhea Kapoor',
    specialization: 'Dermatologist',
    experienceYears: 8,
    rating: 4.7,
    location: 'Pune',
    consultationFee: 1100,
    availableSlots: ['10:30', '14:30', '18:30'],
    bio: 'Treats acne, hair loss, skin darkening, and hormone-linked skin concerns.',
    isVerified: true
  },
  {
    name: 'Dr. Aisha Khan',
    specialization: 'Dermatologist',
    experienceYears: 6,
    rating: 4.5,
    location: 'Mumbai',
    consultationFee: 1200,
    availableSlots: ['11:00', '15:00', '19:00'],
    bio: 'Focuses on laser acne therapy, hormonal skin treatments, and anti-aging dermatology.',
    isVerified: true
  },
  {
    name: 'Dr. Priya Menon',
    specialization: 'Nutritionist',
    experienceYears: 7,
    rating: 4.6,
    location: 'Kochi',
    consultationFee: 900,
    availableSlots: ['09:30', '14:00', '17:30'],
    bio: 'Builds practical nutrition plans for PCOS, cycle health, and energy balance.',
    isVerified: true
  },
  {
    name: 'Dr. Sana Qureshi',
    specialization: 'Nutritionist',
    experienceYears: 9,
    rating: 4.8,
    location: 'Hyderabad',
    consultationFee: 1000,
    availableSlots: ['11:30', '15:30', '19:30'],
    bio: 'Specializes in insulin-friendly meal planning and sustainable lifestyle coaching.',
    isVerified: true
  },
  {
    name: 'Dr. Aditi Verma',
    specialization: 'Mental Wellness Counselor',
    experienceYears: 13,
    rating: 4.9,
    location: 'Remote',
    consultationFee: 1300,
    availableSlots: ['08:30', '13:00', '20:00'],
    bio: 'Provides stress, sleep, body image, and chronic-health emotional support.',
    isVerified: true
  },
  {
    name: 'Dr. Shalini Joshi',
    specialization: 'Mental Wellness Counselor',
    experienceYears: 12,
    rating: 4.8,
    location: 'Remote',
    consultationFee: 1250,
    availableSlots: ['09:30', '14:30', '19:00'],
    bio: 'Specializes in cognitive behavioral therapy (CBT), stress management, and reproductive-stage wellness.',
    isVerified: true
  }
];

const seedDoctors = async ({ manageConnection = true } = {}) => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shecare';
  let openedConnection = false;

  try {
    if (manageConnection && mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
      openedConnection = true;
    }

    await Doctor.deleteMany({
      name: {
        $in: doctors.map((doctor) => doctor.name)
      }
    });
    await Doctor.insertMany(doctors);
    console.log(`Seeded ${doctors.length} doctors.`);

    return {
      count: doctors.length
    };
  } catch (error) {
    console.error(`Doctor seed failed: ${error.message}`);
    if (manageConnection) {
      process.exitCode = 1;
    }

    throw error;
  } finally {
    if (manageConnection && openedConnection) {
      await mongoose.disconnect();
    }
  }
};

if (require.main === module) {
  seedDoctors().catch(() => {});
}

module.exports = {
  doctors,
  seedDoctors
};
