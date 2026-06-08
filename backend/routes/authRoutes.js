const express = require('express');
const {
  register,
  login,
  refresh,
  logout,
  me
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.use(authRateLimiter);

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', protect, me);

module.exports = router;
