const readEntryFile = (api, entryName, entries) => {
  if (typeof entries === 'string') {
    entries = require(api.resolve(entries));
  }
  if (typeof entries === 'function') {
    entries = entries(api, api.projectOptions);
  }

  return entries.map(entry => {
      entry._name = entryName;
      entry.dest = api.resolve(entry.dest);

      return entry;
    });
};

module.exports.readAssets = (api, args) => {
  let assets = [];

  Object
    .entries(api.projectOptions.assets)
    .forEach(([entryName, entryFile]) => {
      assets = assets.concat(readEntryFile(api, entryName, entryFile));
    });

  Object
    .entries(args)
    .filter(([argKey, argValue]) => argKey.startsWith('filter:'))
    .forEach(([argKey, argValue]) => {
      const attrToFilter = argKey.split(':')[1];

      if (Array.isArray(argValue)) {
        api.logger.log(`Filtering assets where \`['${argValue.join("', '")}'].includes(asset.${attrToFilter})\``);
      } else {
        api.logger.log(`Filtering assets where \`asset.${attrToFilter} === '${argValue}'\``);
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
