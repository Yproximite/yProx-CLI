import { dirname } from 'path';
import API from '../../API';
import { flatten, groupBy } from '../../utils/array';
import { readEntries } from '../../utils/entry';
import linters from './linters';

export default (api: API) => {
  api.registerCommand(
    'lint',
    {
      description: 'lint source files',
      usage: 'yprox-cli lint [options]',
      options: {
        '--fix': 'automatically fix lint errors',
        ...require('../commonOptions'),
      },
    },
    args => {
      const entriesByHandler: { [k: string]: Entry[] } = readEntries(api, args)
        .filter(({ handler }) => handler in linters)
        .map(normalizeEntry)
        .reduce(groupBy('handler'), {});

      const promises: Promise<any>[] = [];

      Object.entries(entriesByHandler).forEach(([handler, entries]) => {
        const linter = handler;
        const files = entries
          .filter(entry => !entry.skip_lint)
          .map(entry => entry.src)
          .reduce(flatten(), []);

        if (files.length === 0) {
          return;
        }

        promises.push(
          (linters as any)
            [linter]()(api, args, files)
            .catch((err: Error) => {
              api.logger.error(`lint (${linter}) :: ${err.message}`);
              throw err;
            })
        );
      });

      return Promise.all(promises);
    }
  );
};

export async function lintEntry(api: API, entry: Entry, args: CLIArgs) {
  const linter = entry.handler;
  const normalizedEntry = normalizeEntry(entry);
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

  return (linters as any)[linter]()(api, args, filesToLint);
}

function normalizeEntry(e: Entry) {
  const entry = { ...e };

  if (entry.handler === 'rollup') {
    entry.src = entry.src.map(src => {
      if (src.endsWith('index.js')) {
        return `${dirname(src)}/**/*.{js,vue}`;
      }

      return src;
    });
  }

  entry.src = entry.src.filter(src => !/node_modules/.test(src));

  return entry;
}
