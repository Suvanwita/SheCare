const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const isDuplicateKey = err.code === 11000;
  const isMulterFileSizeError = err.code === 'LIMIT_FILE_SIZE';
  const statusCode = isDuplicateKey ? 409 : isMulterFileSizeError ? 400 : err.statusCode || 500;
  const message = isDuplicateKey
    ? 'Email is already registered'
    : isMulterFileSizeError
    ? 'File size must be 5MB or less'
    : err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    error: message
  });
};

module.exports = {
  notFound,
  errorHandler
};
