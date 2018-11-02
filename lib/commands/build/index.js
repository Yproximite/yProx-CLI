const { readAssets } = require('../../utils/assets');
const handle = require('./handle');
const watch = require('./watch');

module.exports = api => {
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
        if (args.watch && entry.handler !== 'rollup') { // we gonna use rollup own watcher
          watch(api, entry, args)(handle);
        } else {
          handle(api, entry, args);
        }
      });
    });
  });
};
