import { EntryJS } from '../../../types/entry';
import API from '../../API';
import { lintEntry } from '../lint';
import handlers from './handlers';

export default async (api: API, entry: EntryJS, args: CLIArgs): Promise<any> => {
  if (!(entry.handler in handlers)) {
    throw new Error(`Handler "${entry.handler}" do not exists.`);
  }

  if (args.lint) {
    try {
      await lintEntry(api, entry, args);
    } catch (err) {
      api.logger.error(err.message);

      if (args.watch) {
        if (api.isProduction()) {
          return;
        }
      } else {
        process.exit(1);
        return;
      }
    }
  }

  return (handlers as any)[entry.handler]()(api, entry, args);
};
