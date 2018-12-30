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
    (args: CLIArgs) => {
      return new Promise(() => {
        const entries = readEntries(api, args);

        entries.forEach(entry => {
          if (args.watch && !['rollup'].includes(entry.handler)) {
            // we gonna use their own watcher
            watch(api, entry, args)(handle);
          } else {
            handle(api, entry, args);
          }
        });
      });
    }
  );
};
