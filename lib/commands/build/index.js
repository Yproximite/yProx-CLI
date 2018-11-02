const { readAssets } = require('../../utils/assets');
const handle = require('./handle');
const watch = require('./watch');

module.exports = build = (api, args) => {
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
};
