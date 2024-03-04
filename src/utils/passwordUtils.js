const crypto = require('crypto');

const generateRandomPassword = () => {
  return crypto.randomBytes(8).toString('hex'); // Generates a 16-character hex string
};

module.exports = {
  generateRandomPassword
};