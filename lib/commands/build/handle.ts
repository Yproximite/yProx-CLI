import API from '../../API';
import { lintEntry } from '../lint';
import handlers from './handlers';

export default async (api: API, entry: EntryJS, args: CLIArgs) => {
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

  return handlers[entry.handler]()(api, entry, args);
}
