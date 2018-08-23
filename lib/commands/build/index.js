const { readAssets } = require('../../utils/assets');
const handle = require('./handle');
const watch = require('./watch');

module.exports = (cli, args) => {
  return new Promise(() => {
    const assets = readAssets(cli);

    assets.forEach(entry => {
      if (args.watch) {
        watch(cli, entry, args)(handle);
      } else {
        handle(cli, entry, args);
      }
    });
  });
};
