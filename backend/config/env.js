const isProduction = process.env.NODE_ENV === 'production';

const parseCsv = (value) =>
  String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const getAllowedOrigins = () => {
  const origins = new Set([
    process.env.CLIENT_URL || 'http://localhost:3000',
    ...parseCsv(process.env.CLIENT_URLS)
  ]);

  if (!isProduction) {
    origins.add('http://localhost:3000');
  }

  return origins;
};

const getRequiredEnvVars = () => [
  'MONGO_URI',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'REDIS_URL',
  'KAFKA_BROKERS'
];

const validateSecret = (name, value, errors) => {
  if (!value) {
    errors.push(`${name} must be set to a real secret.`);
    return;
  }

  if (isProduction && value.startsWith('your_')) {
    errors.push(`${name} must be set to a real secret in production.`);
  }

  if (isProduction && value.length < 32) {
    errors.push(`${name} must be at least 32 characters in production.`);
  }
};

const validateEnv = () => {
  const errors = [];

  for (const name of getRequiredEnvVars()) {
    if (!process.env[name]) {
      errors.push(`${name} is required.`);
    }
  }

  validateSecret('JWT_ACCESS_SECRET', process.env.JWT_ACCESS_SECRET, errors);
  validateSecret('JWT_REFRESH_SECRET', process.env.JWT_REFRESH_SECRET, errors);

  if (isProduction && process.env.JWT_ACCESS_SECRET === process.env.JWT_REFRESH_SECRET) {
    errors.push('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different in production.');
  }

  if (isProduction && !process.env.CLIENT_URL && !process.env.CLIENT_URLS) {
    errors.push('CLIENT_URL or CLIENT_URLS is required in production.');
  }

  if (errors.length) {
    throw new Error(`Invalid environment configuration:\n- ${errors.join('\n- ')}`);
  }
};

module.exports = {
  getAllowedOrigins,
  isProduction,
  parseCsv,
  validateEnv
};
