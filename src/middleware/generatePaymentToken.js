const crypto = require('crypto');

function generatePaymentToken() {
  return crypto.randomBytes(32).toString('hex');
}

module.exports = generatePaymentToken;
