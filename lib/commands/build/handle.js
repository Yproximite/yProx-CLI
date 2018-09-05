const handlers = require('./handlers');

module.exports = (cli, entry, args) => {
  if (args.hasOwnProperty('handler') && args.handler !== entry.handler) {
    return;
  }

  if (!(entry.handler in handlers)) {
    throw new Error(`Handler "${entry.handler} do not exists.`);
  }

  return handlers[entry.handler](cli, entry, args);
};
