const express = require('express');
const {
  uploadReport,
  getReports,
  getReportById,
  deleteReport
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { reportUpload } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(protect);

router.post('/upload', reportUpload.single('file'), uploadReport);
router.get('/', getReports);
router.get('/:id', getReportById);
router.delete('/:id', deleteReport);

module.exports = router;
