import { Asset } from '../../types';
import { Entry } from '../../types/entry';
import API from '../API';
import { ensureArray } from './array';

export function readAssetDef(api: API, assetName: string, asset: Asset): Entry[] {
  let entries = asset;

  if (typeof entries === 'string') {
    entries = require(api.resolve(entries));
  }
  if (typeof entries === 'function') {
    entries = entries(api, api.projectOptions);
  }
  entries = entries as Entry[];

  return entries.map(entry => {
    return {
      ...entry,
      _name: assetName,
      src: ensureArray(entry.src).map(src => api.resolve(src)),
      dest: api.resolve(entry.dest),
      sourceMaps: api.isProduction(),
    };
  });
}
