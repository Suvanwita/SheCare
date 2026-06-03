const fs = require('fs');
const path = require('path');
const multer = require('multer');

const reportsUploadDir = path.join(__dirname, '..', 'uploads', 'reports');
const allowedMimeTypes = new Set(['application/pdf', 'image/jpeg', 'image/png']);
const allowedExtensions = new Set(['.pdf', '.jpg', '.jpeg', '.png']);

fs.mkdirSync(reportsUploadDir, { recursive: true });

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const storage = multer.diskStorage({
  destination(_req, _file, callback) {
    callback(null, reportsUploadDir);
  },
  filename(_req, file, callback) {
    const extension = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
    callback(null, uniqueName);
  }
});

const fileFilter = (_req, file, callback) => {
  const extension = path.extname(file.originalname).toLowerCase();

  if (!allowedMimeTypes.has(file.mimetype) || !allowedExtensions.has(extension)) {
    callback(createError('Only PDF, JPG, and PNG files are supported', 400));
    return;
  }

  callback(null, true);
};

const reportUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

module.exports = {
  reportUpload,
  reportsUploadDir
};
