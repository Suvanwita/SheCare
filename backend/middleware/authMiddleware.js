const jwt = require('jsonwebtoken');
const asyncHandler = require('./asyncHandler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    const error = new Error('Not authorized, access token missing');
    error.statusCode = 401;
    throw error;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user || !user.isActive) {
      const error = new Error('Not authorized, user not found');
      error.statusCode = 401;
      throw error;
    }

    req.user = user;
    next();
  } catch (err) {
    const error = new Error('Not authorized, access token invalid');
    error.statusCode = 401;
    throw error;
  }
});

module.exports = {
  protect
};
