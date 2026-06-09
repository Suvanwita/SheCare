const { randomUUID } = require('crypto');
const { isProduction } = require('../config/env');

const requestId = (req, res, next) => {
  req.id = req.headers['x-request-id'] || randomUUID();
  res.setHeader('X-Request-Id', req.id);
  next();
};

const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const isDuplicateKey = err.code === 11000;
  const isMulterFileSizeError = err.code === 'LIMIT_FILE_SIZE';
  const statusCode = isDuplicateKey ? 409 : isMulterFileSizeError ? 400 : err.statusCode || 500;
  const rawMessage = isDuplicateKey
    ? 'Email is already registered'
    : isMulterFileSizeError
    ? 'File size must be 5MB or less'
    : err.message || 'Internal Server Error';
  const message = isProduction && statusCode >= 500 ? 'Internal Server Error' : rawMessage;

  if (statusCode >= 500) {
    console.error(`Request ${req.id || 'unknown'} failed: ${rawMessage}`);
  }

  res.status(statusCode).json({
    success: false,
    message,
    error: message,
    requestId: req.id
  });
};

module.exports = {
  requestId,
  notFound,
  errorHandler
};
