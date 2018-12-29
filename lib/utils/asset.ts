import API from '../API';

export function readAssetDef(api: API, assetName: string, assetDef: Asset) {
  if (typeof assetDef === 'string') {
    assetDef = require(api.resolve(assetDef));
  }
  if (typeof assetDef === 'function') {
    assetDef = assetDef(api, api.projectOptions);
  }

  const entries = assetDef as Entry[];

  return entries.map(entry => {
    entry._name = assetName;
    entry.src = Array.isArray(entry.src) ? entry.src : [entry.src];
    entry.dest = api.resolve(entry.dest);

    return entry;
  });
}
