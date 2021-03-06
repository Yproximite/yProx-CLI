import { Entry } from '../../types/entry';
import API from '../API';
import { readAssetDef } from './asset';

export function getEntryName(entry: Entry): string {
  return entry.name || entry.destFile || entry.concat || entry.src.join(', ');
}

export function readEntries(api: API, args: CLIArgs): Entry[] {
  let entries: Entry[] = [];

  if (typeof api.projectOptions.assets === 'undefined') {
    api.logger.error('No assets have been configured.');
    api.logger.error('See the documentation (https://yprox-cli.netlify.com/configuration.html#configuration) to know to do it!');
    process.exit(1);
    // @ts-ignore
    return [];
  }

  Object.entries(api.projectOptions.assets).forEach(([assetName, assetDef]) => {
    entries = entries.concat(readAssetDef(api, assetName, assetDef));
  });

  Object.entries(args)
    .filter(([argKey]) => argKey.startsWith('filter:'))
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
