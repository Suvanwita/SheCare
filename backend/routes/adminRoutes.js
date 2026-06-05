const express = require('express');
const {
  createAdminDoctor,
  deleteAdminDoctor,
  getAdminDoctorAppointments,
  getAdminDoctorById,
  getAdminDoctors,
  getAdminHealth,
  unverifyAdminDoctor,
  updateAdminDoctor,
  verifyAdminDoctor
} = require('../controllers/adminController');
const { adminOnly, auditAdminWrites } = require('../middleware/adminMiddleware');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(adminOnly);
router.use(auditAdminWrites);

router.get('/health', getAdminHealth);
router.get('/doctors', getAdminDoctors);
router.post('/doctors', createAdminDoctor);
router.get('/doctors/:id', getAdminDoctorById);
router.patch('/doctors/:id', updateAdminDoctor);
router.delete('/doctors/:id', deleteAdminDoctor);
router.patch('/doctors/:id/verify', verifyAdminDoctor);
router.patch('/doctors/:id/unverify', unverifyAdminDoctor);
router.get('/doctors/:id/appointments', getAdminDoctorAppointments);

module.exports = router;
