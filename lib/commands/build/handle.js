const handlers = require('./handlers');

module.exports = (cli, entry, args) => {
  return handlers[entry.handler](cli, entry, args);
};
