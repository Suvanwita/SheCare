const express = require('express');
const {
  createCycle,
  getCycles,
  getCycleAnalytics,
  getCycleById,
  updateCycle,
  deleteCycle
} = require('../controllers/cycleController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/').post(createCycle).get(getCycles);
router.get('/analytics', getCycleAnalytics);
router.route('/:id').get(getCycleById).patch(updateCycle).delete(deleteCycle);

module.exports = router;
