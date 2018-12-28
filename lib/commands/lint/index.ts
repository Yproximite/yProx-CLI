import { dirname } from 'path';
import { readAssets } from '../../utils/assets';
import { flatten, groupBy } from '../../utils/array';
import linters from './linters';

export default api => {
  api.registerCommand('lint', {
    description: 'lint source files',
    usage: 'yprox-cli lint [options]',
    options: {
      '--fix': 'automatically fix lint errors',
      ...require('../commonOptions'),
    },
  }, args => {
    const entriesByHandler = readAssets(api, args)
      .filter(({ handler }) => Object.keys(linters).includes(handler))
      .map(normalizeEntrySrc)
      .reduce(groupBy('handler'), {});

    const promises = [];

    Object.entries(entriesByHandler).forEach(([handler, entries]) => {
      if (!(handler in linters)) {
        return;
      }
      const linter = handler;

      const files = entries
        .filter(entry => !entry.skip_lint)
        .map(entry => entry.src)
        .reduce(flatten(), []);

      if (files.length === 0) {
        return;
      }

      promises.push(linters[linter]()(api, args, files)
        .catch(err => {
          api.logger.error(`lint (${linter}) :: ${err.message}`);
          throw err;
        }));
    });

    return Promise.all(promises);
  });
}

export async function lintEntry(api, entry, args) {
  const linter = entry.handler;
  const normalizedEntry = normalizeEntrySrc(entry);
  const filesToLint = normalizedEntry.src;

  if (!(linter in linters)) {
    return;
  }

  if (normalizedEntry.skip_lint === true) {
    return;
  }

  if (filesToLint.length === 0) {
    return;
  }

  return linters[linter]()(api, args, filesToLint);
}

function normalizeEntrySrc(entry) {
  entry = { ...entry };

  if (entry.handler === 'rollup') {
    entry.src = entry.src.map(src => !src.endsWith('index.js') ? src : `${dirname(src)}/**/*.{js,vue}`);
  }

  entry.src = entry.src.filter(src => !/node_modules/.test(src));

  return entry;
}
