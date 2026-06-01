const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

const hashPassword = (password) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

const comparePassword = (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

module.exports = {
  hashPassword,
  comparePassword
};
