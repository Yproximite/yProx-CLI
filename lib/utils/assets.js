const { resolve } = require('path');
const log = require('fancy-log');

const readEntryFile = (cli, entryName, entryFile) => {
  const resolvedEntryFile = resolve(cli.context, entryFile);

  return require(resolvedEntryFile)(cli, cli.projectOptions)
    .map(entry => {
      entry._name = entryName;
      entry.dest = resolve(cli.context, entry.dest);
      return entry;
    });
};

module.exports.readAssets = (cli) => {
  let assets = [];

  Object
    .entries(cli.projectOptions.assets)
    .forEach(([entryName, entryFile]) => {
      assets = assets.concat(readEntryFile(cli, entryName, entryFile));
    });

  return assets;
};
