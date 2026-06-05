const AuditLog = require('../models/AuditLog');

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

    AuditLog.create({
      user: req.user?._id,
      action: `admin:${req.method.toLowerCase()}`,
      entity: req.baseUrl.replace(/^\/api\//, '') || 'admin',
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

module.exports = {
  adminOnly,
  auditAdminWrites
};
