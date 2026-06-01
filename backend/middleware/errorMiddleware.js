const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const isDuplicateKey = err.code === 11000;
  const statusCode = isDuplicateKey ? 409 : err.statusCode || 500;
  const message = isDuplicateKey
    ? 'Email is already registered'
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
