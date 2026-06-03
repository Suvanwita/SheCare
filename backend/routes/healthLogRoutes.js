const express = require('express');
const {
  createHealthLog,
  getHealthLogs,
  getHealthLogById,
  updateHealthLog,
  deleteHealthLog
} = require('../controllers/healthLogController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/').post(createHealthLog).get(getHealthLogs);
router
  .route('/:id')
  .get(getHealthLogById)
  .patch(updateHealthLog)
  .delete(deleteHealthLog);

module.exports = router;
