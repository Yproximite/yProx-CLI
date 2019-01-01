import { Asset } from '../../types';
import API from '../API';
import { readAssetDef } from './asset';

export function getEntryName(entry: Entry) {
  return entry.name || entry.destFile || entry.concat || entry.src.join(', ');
}

export function readEntries(api: API, args: CLIArgs) {
  let entries: Entry[] = [];

  Object.entries(api.projectOptions.assets as { [k: string]: Asset }).forEach(([assetName, assetDef]) => {
    entries = entries.concat(readAssetDef(api, assetName, assetDef));
  });

  Object.entries(args)
    .filter(([argKey, argValue]) => argKey.startsWith('filter:'))
    .forEach(([argKey, argValue]) => {
      const attrToFilter = argKey.split(':')[1];

      if (Array.isArray(argValue)) {
        api.logger.log(`Filtering assets where \`['${argValue.join("', '")}'].includes(asset.${attrToFilter})\``);
      } else {
        api.logger.log(`Filtering assets where \`asset.${attrToFilter} === '${argValue}'\``);
      }

      entries = entries.filter(entry => {
        const valueToFilter: any = entry[attrToFilter];

        if (Array.isArray(argValue)) {
          return argValue.includes(valueToFilter);
        }

        return valueToFilter === argValue;
      });
    });

  return entries;
}
