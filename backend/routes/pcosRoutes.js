const express = require('express');
const {
  predictPcos,
  getPcosHistory,
  getPcosAssessmentById
} = require('../controllers/pcosController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/predict', predictPcos);
router.get('/history', getPcosHistory);
router.get('/:id', getPcosAssessmentById);

module.exports = router;
