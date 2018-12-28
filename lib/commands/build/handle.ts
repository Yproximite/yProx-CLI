import { lintEntry } from '../lint';
import handlers from './handlers';

export default async (api, entry, args) => {
  if (!(entry.handler in handlers)) {
    throw new Error(`Handler "${ entry.handler }" do not exists.`);
  }

  if (args.lint) {
    try {
      await lintEntry(api, entry, args);
    } catch (err) {
      api.logger.error(err.message);
      return process.exit(1);
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

  return handlers[entry.handler]()(api, entry, args);
}
