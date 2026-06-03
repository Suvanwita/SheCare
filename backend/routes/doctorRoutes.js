const express = require('express');
const {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor
} = require('../controllers/doctorController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getDoctors);
router.get('/:id', getDoctorById);
router.post('/', protect, createDoctor);
router.patch('/:id', protect, updateDoctor);
router.delete('/:id', protect, deleteDoctor);

module.exports = router;
