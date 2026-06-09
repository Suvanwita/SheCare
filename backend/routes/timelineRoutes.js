const express = require('express');
const { getTimeline } = require('../controllers/timelineController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getTimeline);

module.exports = router;
