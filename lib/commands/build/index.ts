import { readAssets } from '../../utils/assets';
import handle from './handle';
import watch from './watch';

export default api => {
  api.registerCommand('build', {
    description: 'build files',
    usage: 'yprox-cli build [options]',
    options: {
      '--watch': 'enable watch mode',
      '--lint': 'lint before build, if lint fails, files will not be build',
      ...require('../commonOptions'),
    },
  }, args => {
    return new Promise(() => {
      const assets = readAssets(api, args);

      assets.forEach(entry => {
        if (args.watch && !['rollup'].includes(entry.handler)) { // we gonna use their own watcher
          watch(api, entry, args)(handle);
        } else {
          handle(api, entry, args);
        }
      });
    });
  });
}
