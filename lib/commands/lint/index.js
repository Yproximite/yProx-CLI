const { dirname } = require('path');
const { chain } = require('lodash');
const { readAssets } = require('../../utils/assets');
const linters = require('./linters');

module.exports = (cli, args) => {
  return new Promise((resolve, reject) => {
    const files = chain(readAssets(cli, args))
      .filter(({ handler }) => ['rollup', 'sass'].includes(handler))
      .map(normalizeEntrySrc)
      .groupBy('handler')
      .value();

    Object.entries(files).forEach(([linter, entries]) => {
      if (!(linter in linters)) {
        return;
      }

      const filesToLint = chain(entries)
        .map(entry => entry.src)
        .flatten()
        .value();

      if (filesToLint.length === 0) {
        return;
      }

      return linters[linter]()(cli, args, filesToLint)
        .then(() => resolve())
        .catch(err => reject(err));
    });
  });
};

module.exports.lintEntry = async (cli, entry, args) => {
  const linter = entry.handler;
  const normalizedEntry = normalizeEntrySrc(entry);

  if (!(linter in linters)) {
    return;
  }

  return linters[linter]()(cli, args, normalizedEntry.src);
};

function normalizeEntrySrc(entry) {
  entry = {...entry};
  entry.src = Array.isArray(entry.src) ? entry.src : [entry.src];

  if (entry.handler === 'rollup') {
    entry.src = entry.src.map(src => !src.endsWith('index.js') ? src : `${dirname(src)}/**/*.{js,vue}`);
  }

  entry.src = entry.src.filter(src => !/node_modules/.test(src));

  return entry;
}
