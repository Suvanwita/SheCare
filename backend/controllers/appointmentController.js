const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Notification = require('../models/Notification');
const asyncHandler = require('../middleware/asyncHandler');
const { successResponse } = require('../utils/apiResponse');

const activeStatuses = ['pending', 'confirmed'];
const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const validateObjectId = (id, resource = 'Appointment') => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError(`${resource} not found`, 404);
  }
};

const parseAppointmentDate = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw createError('Appointment date is invalid', 400);
  }

  date.setHours(0, 0, 0, 0);
  return date;
};

const createAppointmentNotification = (userId, appointment, title, message, action) => {
  return Notification.create({
    user: userId,
    title,
    message,
    type: 'appointment',
    metadata: {
      action,
      appointmentId: appointment._id,
      doctorId: appointment.doctor?._id || appointment.doctor,
      date: appointment.date,
      slot: appointment.slot,
      status: appointment.status
    }
  });
};

const getDoctorForUser = async (userId) => {
  return Doctor.findOne({ user: userId });
};

const canManageAppointment = async (user, appointment) => {
  if (user.role === 'admin') {
    return true;
  }

  if (user.role !== 'doctor') {
    return false;
  }

  const doctor = await getDoctorForUser(user._id);
  return Boolean(doctor && appointment.doctor._id.toString() === doctor._id.toString());
};

const createAppointment = asyncHandler(async (req, res) => {
  const { doctor: doctorId, date, slot, appointmentType, reason, notes } = req.body;

  if (!doctorId) {
    throw createError('Doctor is required', 400);
  }

  validateObjectId(doctorId, 'Doctor');

  if (!date) {
    throw createError('Appointment date is required', 400);
  }

  if (!slot) {
    throw createError('Slot is required', 400);
  }

  if (!appointmentType) {
    throw createError('Appointment type is required', 400);
  }

  const doctor = await Doctor.findById(doctorId);

  if (!doctor) {
    throw createError('Doctor not found', 404);
  }

  if (!doctor.availableSlots.includes(slot)) {
    throw createError('Selected slot is not available for this doctor', 400);
  }

  const appointmentDate = parseAppointmentDate(date);
  const existingAppointment = await Appointment.findOne({
    doctor: doctor._id,
    date: appointmentDate,
    slot,
    status: { $in: activeStatuses }
  });

  if (existingAppointment) {
    throw createError('This doctor is already booked for the selected date and slot', 409);
  }

  const appointment = await Appointment.create({
    user: req.user._id,
    doctor: doctor._id,
    date: appointmentDate,
    slot,
    appointmentType,
    reason,
    notes
  });

  const populatedAppointment = await appointment.populate('doctor');

  await createAppointmentNotification(
    req.user._id,
    populatedAppointment,
    'Appointment booked',
    `Your appointment with ${doctor.name} is pending confirmation.`,
    'booked'
  );

  return successResponse(res, 201, 'Appointment booked successfully', {
    appointment: populatedAppointment
  });
});

const getMyAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({ user: req.user._id })
    .populate('doctor')
    .sort({ date: -1, slot: -1, createdAt: -1 });

  return successResponse(res, 200, 'Appointments fetched successfully', {
    appointments
  });
});

const getAppointmentById = asyncHandler(async (req, res) => {
  validateObjectId(req.params.id);

  const appointment = await Appointment.findById(req.params.id).populate('doctor');

  if (!appointment) {
    throw createError('Appointment not found', 404);
  }

  const ownsAppointment = appointment.user.toString() === req.user._id.toString();
  const canManage = await canManageAppointment(req.user, appointment);

  if (!ownsAppointment && !canManage) {
    throw createError('Appointment not found', 404);
  }

  return successResponse(res, 200, 'Appointment fetched successfully', {
    appointment
  });
});

const updateAppointmentStatus = asyncHandler(async (req, res) => {
  validateObjectId(req.params.id);

  const { status } = req.body;

  if (!validStatuses.includes(status)) {
    throw createError('Status is invalid', 400);
  }

  const appointment = await Appointment.findById(req.params.id).populate('doctor');

  if (!appointment) {
    throw createError('Appointment not found', 404);
  }

  const ownsAppointment = appointment.user.toString() === req.user._id.toString();
  const canManage = await canManageAppointment(req.user, appointment);

  if (!canManage && !(ownsAppointment && status === 'cancelled')) {
    throw createError('Not authorized to update this appointment', 403);
  }

  appointment.status = status;
  await appointment.save();

  await createAppointmentNotification(
    appointment.user,
    appointment,
    status === 'cancelled' ? 'Appointment cancelled' : 'Appointment updated',
    `Your appointment with ${appointment.doctor.name} is now ${status}.`,
    'status_updated'
  );

  return successResponse(res, 200, 'Appointment status updated successfully', {
    appointment
  });
});

const deleteAppointment = asyncHandler(async (req, res) => {
  validateObjectId(req.params.id);

  const appointment = await Appointment.findById(req.params.id).populate('doctor');

  if (!appointment) {
    throw createError('Appointment not found', 404);
  }

  const ownsAppointment = appointment.user.toString() === req.user._id.toString();
  const canManage = await canManageAppointment(req.user, appointment);

  if (!ownsAppointment && !canManage) {
    throw createError('Appointment not found', 404);
  }

  await appointment.deleteOne();

  return successResponse(res, 200, 'Appointment deleted successfully', {
    id: req.params.id
  });
});

module.exports = {
  createAppointment,
  getMyAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  deleteAppointment
};
