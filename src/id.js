const crypto = require('crypto');

module.exports = (length = 16) => {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(length, (err, buf) => {
      if (err) return reject(err);
      resolve(buf.toString('hex').toUpperCase());
    });
  })
};
