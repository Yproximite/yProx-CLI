const fs = require('fs');
const dotenv = require('dotenv');

module.exports = path => {
  const config = dotenv.parse(fs.readFileSync(path));

  Object.entries(config).forEach(([key, value]) => {
    if (typeof process.env[key] === 'undefined') {
      process.env[key] = value;
    }
  });
};
