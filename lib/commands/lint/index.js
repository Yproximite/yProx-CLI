const { dirname } = require('path');
const { chain } = require('lodash');
const { readAssets } = require('../../utils/assets');
const linters = require('./linters');

const normalizeEntrySrc = (entry) => {
  entry.src = Array.isArray(entry.src) ? entry.src : [entry.src];

  if (entry.handler === 'rollup') {
    entry.src = entry.src.map(src => `${dirname(src)}/**/*.{js,vue}`);
  }

  return entry;
};

module.exports = (cli, args) => {
  return new Promise((resolve, reject) => {
    const files = chain(readAssets(cli))
      .filter(({ handler }) => ['rollup', 'sass'].includes(handler))
      .map(normalizeEntrySrc)
      .groupBy('handler')
      .value();

    Object.entries(files).forEach(([linter, entries]) => {
      if (!(linter in linters)) {
        throw new Error(`Linter "${linter} do not exists.`);
      }

      if (args.hasOwnProperty('linter') && args.linter !== linter) {
        return resolve();
      }

      const filesToLint = chain(entries)
        .map(entry => entry.src)
        .flatten()
        .value();

      linters[linter](cli, args, filesToLint);
    });
  });
};
