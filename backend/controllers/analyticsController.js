const HealthLog = require('../models/HealthLog');
const Cycle = require('../models/Cycle');
const Reminder = require('../models/Reminder');
const Appointment = require('../models/Appointment');
const PCOSAssessment = require('../models/PCOSAssessment');
const asyncHandler = require('../middleware/asyncHandler');
const { successResponse } = require('../utils/apiResponse');

const getAverage = (values) => {
  const validValues = values.filter((value) => typeof value === 'number' && !Number.isNaN(value));

  if (validValues.length === 0) {
    return 0;
  }

  return Number((validValues.reduce((sum, value) => sum + value, 0) / validValues.length).toFixed(1));
};

const getMostCommonSymptoms = (healthLogs) => {
  const symptomCounts = new Map();

  healthLogs.forEach((log) => {
    (log.symptoms || []).forEach((symptom) => {
      symptomCounts.set(symptom, (symptomCounts.get(symptom) || 0) + 1);
    });
  });

  return Array.from(symptomCounts.entries())
    .map(([symptom, count]) => ({ symptom, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
};

const getHealthTrend = (healthLogs) => {
  return [...healthLogs]
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(-14)
    .map((log) => ({
      date: log.date,
      label: log.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      sleepHours: log.sleepHours || 0,
      waterIntake: log.waterIntake || 0,
      painLevel: log.painLevel || 0,
      stressLevel: log.stressLevel || 0
    }));
};

const getCycleSummary = (cycles) => {
  const sortedCycles = [...cycles].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  const latestCycle = sortedCycles[sortedCycles.length - 1];

  return {
    averageCycleLength: getAverage(cycles.map((cycle) => cycle.cycleLength)),
    irregularCycleCount: cycles.filter((cycle) => cycle.isIrregular).length,
    predictedNextPeriod: latestCycle?.predictedNextPeriod || null,
    cycleLengthTrend: sortedCycles.map((cycle) => ({
      cycleId: cycle._id,
      startDate: cycle.startDate,
      label: cycle.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      cycleLength: cycle.cycleLength || 0,
      isIrregular: cycle.isIrregular
    }))
  };
};

const getReminderSummary = (reminders) => {
  const totalReminders = reminders.length;
  const completedReminders = reminders.filter((reminder) => reminder.status === 'completed').length;
  const missedReminders = reminders.filter((reminder) => reminder.status === 'missed').length;
  const actionableReminders = completedReminders + missedReminders;
  const adherencePercentage = actionableReminders
    ? Math.round((completedReminders / actionableReminders) * 100)
    : 0;

  return {
    totalReminders,
    completedReminders,
    missedReminders,
    adherencePercentage
  };
};

const getAppointmentSummary = (appointments) => {
  return {
    upcomingAppointments: appointments.filter((appointment) =>
      ['pending', 'confirmed'].includes(appointment.status)
    ).length,
    completedAppointments: appointments.filter((appointment) => appointment.status === 'completed').length
  };
};

const getPcosSummary = (assessments) => {
  const latestAssessment = assessments[0];

  return {
    latestRiskLevel: latestAssessment?.result?.risk_level || null,
    latestProbability: latestAssessment?.result?.probability || null,
    assessmentCount: assessments.length
  };
};

const getAnalyticsSummary = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [healthLogs, cycles, reminders, appointments, pcosAssessments] = await Promise.all([
    HealthLog.find({ user: userId }).sort({ date: -1 }),
    Cycle.find({ user: userId }).sort({ startDate: -1 }),
    Reminder.find({ user: userId }),
    Appointment.find({ user: userId }),
    PCOSAssessment.find({ user: userId }).sort({ createdAt: -1 })
  ]);

  const healthSummary = {
    averageSleep: getAverage(healthLogs.map((log) => log.sleepHours)),
    averageWaterIntake: getAverage(healthLogs.map((log) => log.waterIntake)),
    averagePainLevel: getAverage(healthLogs.map((log) => log.painLevel)),
    averageStressLevel: getAverage(healthLogs.map((log) => log.stressLevel)),
    mostCommonSymptoms: getMostCommonSymptoms(healthLogs)
  };

  return successResponse(res, 200, 'Analytics summary fetched successfully', {
    healthSummary,
    cycleSummary: getCycleSummary(cycles),
    reminderSummary: getReminderSummary(reminders),
    appointmentSummary: getAppointmentSummary(appointments),
    pcosSummary: getPcosSummary(pcosAssessments),
    chartData: {
      healthTrend: getHealthTrend(healthLogs)
    }
  });
});

module.exports = {
  getAnalyticsSummary
};
