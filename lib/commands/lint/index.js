const { dirname } = require('path');
const { chain } = require('lodash');
const { readAssets } = require('../../utils/assets');
const linters = require('./linters');

module.exports = api => {
  api.registerCommand('lint', {
    description: 'lint source files',
    usage: 'yprox-cli lint [options]',
    options: {
      '--fix': 'automatically fix lint errors',
      ...require('../commonOptions'),
    },
  }, args => {
    return new Promise((resolve, reject) => {
      const files = chain(readAssets(api, args))
        .filter(({ handler }) => Object.keys(linters).includes(handler))
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

        return linters[linter]()(api, args, filesToLint)
          .then(() => resolve())
          .catch(err => reject(err));
      });
    });
  });
};

module.exports.lintEntry = async (api, entry, args) => {
  const linter = entry.handler;
  const normalizedEntry = normalizeEntrySrc(entry);
  const filesToLint = normalizedEntry.src;

  if (!(linter in linters)) {
    return;
  }

  if (filesToLint.length === 0) {
    return;
  }

  return linters[linter]()(api, args, filesToLint);
};

function normalizeEntrySrc(entry) {
  entry = { ...entry };
  entry.src = Array.isArray(entry.src) ? entry.src : [entry.src];

  if (entry.handler === 'rollup') {
    entry.src = entry.src.map(src => !src.endsWith('index.js') ? src : `${dirname(src)}/**/*.{js,vue}`);
  }

  entry.src = entry.src.filter(src => !/node_modules/.test(src));

  return entry;
}
