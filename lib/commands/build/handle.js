const handlers = require('./handlers');
const { lintEntry } = require('../lint');

module.exports = async (api, entry, args) => {
  if (!(entry.handler in handlers)) {
    throw new Error(`Handler "${entry.handler} do not exists.`);
  }

  if (args.lint) {
    try {
      await lintEntry(api, entry, args);
    } catch(err) {
      return api.logger.error(err.message);
    }
  }

  if (args.hookBeforeBuild && typeof args.hookBeforeBuild === 'function') {
    try {
      api.logger.log('hook: before "beforeBuild"');
      await args.hookBeforeBuild();
      api.logger.log('hook: after "beforeBuild"');
    } catch (err) {
      return api.logger.error(err.message);
    }
  }

  return handlers[entry.handler]()(api, entry, args)
};
