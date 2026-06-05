const AuditLog = require('../models/AuditLog');
const mongoose = require('mongoose');

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    next(createError('Admin access required', 403));
    return;
  }

  next();
};

const auditAdminWrites = (req, res, next) => {
  const writeMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

  if (!writeMethods.has(req.method)) {
    next();
    return;
  }

  res.on('finish', () => {
    if (res.statusCode >= 400) {
      return;
    }

    const pathSegments = req.originalUrl
      .split('?')[0]
      .replace(/^\/api\//, '')
      .split('/')
      .filter(Boolean);
    const entity = pathSegments.slice(0, 2).join('/') || 'admin';

    AuditLog.create({
      user: req.user?._id,
      action: `admin:${req.method.toLowerCase()}`,
      entity,
      entityId: mongoose.Types.ObjectId.isValid(req.params?.id)
        ? req.params.id
        : undefined,
      metadata: {
        path: req.originalUrl,
        params: req.params,
        query: req.query
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    }).catch((error) => {
      console.error(`Admin audit log failed: ${error.message}`);
    });
  });

  next();
};

const createAdminToolRateLimit = ({
  windowMs = 60 * 1000,
  max = 12
} = {}) => {
  const hitsByKey = new Map();

  return (req, res, next) => {
    const key = `${req.user?._id || req.ip}:${req.path}`;
    const now = Date.now();
    const current = hitsByKey.get(key) || {
      count: 0,
      resetAt: now + windowMs
    };

    if (current.resetAt <= now) {
      current.count = 0;
      current.resetAt = now + windowMs;
    }

    current.count += 1;
    hitsByKey.set(key, current);

    if (current.count > max) {
      next(createError('Too many admin tool requests. Please wait and try again.', 429));
      return;
    }

    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader('X-RateLimit-Remaining', String(Math.max(max - current.count, 0)));
    res.setHeader('X-RateLimit-Reset', String(Math.ceil(current.resetAt / 1000)));

    next();
  };
};

module.exports = {
  adminOnly,
  auditAdminWrites,
  createAdminToolRateLimit
};
