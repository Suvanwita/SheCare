const express = require('express');
const { getAdminHealth } = require('../controllers/adminController');
const { adminOnly, auditAdminWrites } = require('../middleware/adminMiddleware');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(adminOnly);
router.use(auditAdminWrites);

router.get('/health', getAdminHealth);

module.exports = router;
