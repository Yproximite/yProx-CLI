const handlers = require('./handlers');

module.exports = async (cli, entry, args) => {
  if (!(entry.handler in handlers)) {
    throw new Error(`Handler "${entry.handler} do not exists.`);
  }

  if (args.hookBeforeBuild && typeof args.hookBeforeBuild === 'function') {
    try {
      cli.logger.log('hook: before "beforeBuild"');
      await args.hookBeforeBuild();
      cli.logger.log('hook: after "beforeBuild"');
    } catch (err) {
      return cli.logger.error(err.message);
    }
  }

  return handlers[entry.handler](cli, entry, args)
};
