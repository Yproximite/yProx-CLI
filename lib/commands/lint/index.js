const { dirname } = require('path');
const { chain } = require('lodash');
const { readAssets } = require('../../utils/assets');
const linters = require('./linters');

const normalizeEntrySrc = (entry) => {
  entry.src = Array.isArray(entry.src) ? entry.src : [entry.src];

  if (entry.handler === 'rollup') {
    entry.src = entry.src.map(src => !src.endsWith('index.js') ? src : `${dirname(src)}/**/*.{js,vue}`);
  }

  return entry;
};

module.exports = (cli, args) => {
  return new Promise((resolve, reject) => {
    const files = chain(readAssets(cli, args))
      .filter(({ handler }) => ['rollup', 'sass'].includes(handler))
      .map(normalizeEntrySrc)
      .groupBy('handler')
      .value();

    Object.entries(files).forEach(([linter, entries]) => {
      if (!(linter in linters)) {
        throw new Error(`Linter "${linter} do not exists.`);
      }

      const filesToLint = chain(entries)
        .map(entry => entry.src)
        .flatten()
        .value();

      return linters[linter](cli, args, filesToLint)
        .then(() => resolve())
        .catch(err => reject(err));
    });
  });
};
