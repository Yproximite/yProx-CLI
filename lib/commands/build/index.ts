import API from '../../API';
import { readEntries } from '../../utils/entry';
import handle from './handle';
import watch from './watch';

export default (api: API) => {
  api.registerCommand(
    'build',
    {
      description: 'build files',
      usage: 'yprox-cli build [options]',
      options: {
        '--watch': 'enable watch mode',
        '--lint': 'lint before build, if lint fails, files will not be build',
        ...require('../commonOptions'),
      },
    },
    async (args: CLIArgs) => {
      const entries = readEntries(api, args);
      const promises = entries.map(entry => {
        if (args.watch && !['rollup'].includes(entry.handler)) {
          // we gonna use their own watcher
          return watch(api, entry, args)(handle);
        }

        return handle(api, entry, args);
      });

      return await Promise.all(promises);
    }
  );
};
