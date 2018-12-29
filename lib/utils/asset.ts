import { Asset } from '../../types';
import API from '../API';

export function readAssetDef(api: API, assetName: string, asset: Asset) {
  let entries = asset;

  if (typeof entries === 'string') {
    entries = require(api.resolve(entries));
  }
  if (typeof entries === 'function') {
    entries = entries(api, api.projectOptions);
  }
  entries = entries as Entry[];

  return entries.map((entry) => {
    entry._name = assetName;
    entry.src = Array.isArray(entry.src) ? entry.src : [entry.src];
    entry.dest = api.resolve(entry.dest);

    return entry;
  });
}
