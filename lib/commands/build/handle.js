const handlers = require('./handlers');
const { lintEntry } = require('../lint');

module.exports = async (cli, entry, args) => {
  if (!(entry.handler in handlers)) {
    throw new Error(`Handler "${entry.handler} do not exists.`);
  }

  if (args.lint) {
    try {
      await lintEntry(cli, entry, args);
    } catch(err) {
      return cli.logger.error(err.message);
    }
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

  return handlers[entry.handler]()(cli, entry, args)
};
