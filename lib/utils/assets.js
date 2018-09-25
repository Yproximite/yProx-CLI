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

module.exports.readAssets = (cli, args) => {
  let assets = [];

  Object
    .entries(cli.projectOptions.assets)
    .forEach(([entryName, entryFile]) => {
      assets = assets.concat(readEntryFile(cli, entryName, entryFile));
    });

  Object
    .entries(args)
    .filter(([argKey, argValue]) => argKey.startsWith('filter:'))
    .forEach(([argKey, argValue]) => {
      const attrToFilter = argKey.split(':')[1];

      if (Array.isArray(argValue)) {
        log.info(`Filtering assets where "${attrToFilter} INCLUDES ${argValue}"`);
      } else {
        log.info(`Filtering assets where "${attrToFilter} = ${argValue}"`);
      }

      assets = assets.filter(asset => {
        const valueToFilter = asset[attrToFilter];

        if (Array.isArray(argValue)) {
          return argValue.includes(valueToFilter);
        }

        return valueToFilter === argValue;
      });
    });

  return assets;
};
