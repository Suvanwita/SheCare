const express = require('express');
const {
  createReminder,
  getReminders,
  updateReminder,
  deleteReminder,
  completeReminder
} = require('../controllers/reminderController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/').post(createReminder).get(getReminders);
router.patch('/:id/complete', completeReminder);
router.route('/:id').patch(updateReminder).delete(deleteReminder);

module.exports = router;
