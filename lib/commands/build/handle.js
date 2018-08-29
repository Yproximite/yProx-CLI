const handlers = require('./handlers');

module.exports = (cli, entry, args) => {
  if (args.hasOwnProperty('handler') && args.handler !== entry.handler) {
    return;
  }

  return handlers[entry.handler](cli, entry, args);
};
