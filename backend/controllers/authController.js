const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Session = require('../models/Session');
const asyncHandler = require('../middleware/asyncHandler');
const { generateAccessToken, generateTokens } = require('../utils/generateTokens');
const { hashPassword, comparePassword } = require('../utils/passwordUtils');
const { successResponse } = require('../utils/apiResponse');
const kafkaTopics = require('../kafka/topics');
const { emitKafkaEventSafely } = require('../kafka/eventPublisher');

const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict'
};

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const sanitizeUser = (user) => {
  const userObject = user.toObject ? user.toObject() : user;
  delete userObject.password;
  return userObject;
};

const getRefreshTokenExpiry = (refreshToken) => {
  const decoded = jwt.decode(refreshToken);

  if (decoded && decoded.exp) {
    return new Date(decoded.exp * 1000);
  }

  const fallbackDays = 7;
  return new Date(Date.now() + fallbackDays * 24 * 60 * 60 * 1000);
};

const hashRefreshToken = (refreshToken) =>
  crypto.createHash('sha256').update(refreshToken).digest('hex');

const saveSession = async (req, user, refreshToken) => {
  return Session.create({
    user: user._id,
    refreshToken: hashRefreshToken(refreshToken),
    userAgent: req.get('user-agent'),
    ipAddress: req.ip,
    expiresAt: getRefreshTokenExpiry(refreshToken)
  });
};

const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie('refreshToken', refreshToken, {
    ...refreshCookieOptions,
    expires: getRefreshTokenExpiry(refreshToken)
  });
};

const getRequestMetadata = (req) => ({
  ipAddress: req.ip,
  userAgent: req.get('user-agent')
});

const validateAuthFields = ({ fullName, email, password, role }, isRegister = false) => {
  if (isRegister && !fullName) {
    throw createError('Full name is required', 400);
  }

  if (!email) {
    throw createError('Email is required', 400);
  }

  if (!password) {
    throw createError('Password is required', 400);
  }

  if (role && !['user', 'doctor', 'admin'].includes(role)) {
    throw createError('Role must be user, doctor, or admin', 400);
  }
};

const register = asyncHandler(async (req, res) => {
  const { fullName, email, password, role } = req.body;

  validateAuthFields({ fullName, email, password, role }, true);

  const existingUser = await User.findOne({ email: email.toLowerCase() });

  if (existingUser) {
    throw createError('Email is already registered', 409);
  }

  const user = await User.create({
    fullName,
    email,
    password: await hashPassword(password),
    role: role || 'user'
  });

  const { accessToken, refreshToken } = generateTokens(user);
  await saveSession(req, user, refreshToken);
  setRefreshTokenCookie(res, refreshToken);
  emitKafkaEventSafely(kafkaTopics.USER_EVENTS, {
    eventType: 'user.registered',
    entityId: user._id,
    userId: user._id,
    role: user.role,
    payload: {
      email: user.email,
      fullName: user.fullName,
      ...getRequestMetadata(req)
    }
  });

  return successResponse(res, 201, 'User registered successfully', {
    user: sanitizeUser(user),
    accessToken,
    refreshToken
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  validateAuthFields({ email, password });

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user || !(await comparePassword(password, user.password))) {
    throw createError('Invalid email or password', 401);
  }

  if (!user.isActive) {
    throw createError('Account is inactive', 403);
  }

  const { accessToken, refreshToken } = generateTokens(user);
  await saveSession(req, user, refreshToken);

  user.lastLoginAt = new Date();
  await user.save();
  setRefreshTokenCookie(res, refreshToken);
  emitKafkaEventSafely(kafkaTopics.USER_EVENTS, {
    eventType: 'user.logged_in',
    entityId: user._id,
    userId: user._id,
    role: user.role,
    payload: getRequestMetadata(req)
  });

  return successResponse(res, 200, 'Login successful', {
    user: sanitizeUser(user),
    accessToken,
    refreshToken
  });
});

const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.body.refreshToken || req.cookies.refreshToken;

  if (!refreshToken) {
    throw createError('Refresh token is required', 400);
  }

  let decoded;

  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    throw createError('Invalid refresh token', 401);
  }

  const session = await Session.findOne({
    refreshToken: hashRefreshToken(refreshToken),
    isRevoked: false,
    expiresAt: { $gt: new Date() }
  }).populate('user');

  if (!session || !session.user || String(session.user._id) !== decoded.userId) {
    throw createError('Refresh token session is invalid', 401);
  }

  if (!session.user.isActive) {
    throw createError('Account is inactive', 403);
  }

  const accessToken = generateAccessToken(session.user);

  return successResponse(res, 200, 'Access token refreshed successfully', {
    accessToken
  });
});

const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.body.refreshToken || req.cookies.refreshToken;
  const decoded = refreshToken ? jwt.decode(refreshToken) : null;

  if (refreshToken) {
    await Session.findOneAndUpdate(
      { refreshToken: hashRefreshToken(refreshToken) },
      { isRevoked: true },
      { new: true }
    );
  }

  res.clearCookie('refreshToken', refreshCookieOptions);
  emitKafkaEventSafely(kafkaTopics.USER_EVENTS, {
    eventType: 'user.logged_out',
    entityId: decoded?.userId,
    userId: decoded?.userId,
    payload: getRequestMetadata(req)
  });

  return successResponse(res, 200, 'Logout successful');
});

const me = asyncHandler(async (req, res) => {
  return successResponse(res, 200, 'Current user fetched successfully', {
    user: req.user
  });
});

module.exports = {
  register,
  login,
  refresh,
  logout,
  me
};
