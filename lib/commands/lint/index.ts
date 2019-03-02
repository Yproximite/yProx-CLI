import { dirname } from 'path';
import { Entry } from '../../../types/entry';
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
              api.logger.error(`${linter} (lint) :: ${err.message}`);
              process.exit(1);
            })
        );
      });

      return Promise.all(promises);
    }
  );
};

export async function lintEntry(api: API, entry: Entry, args: CLIArgs): Promise<any> {
  const linter = entry.handler;
  const normalizedEntry = normalizeEntry(entry);

  if (!(linter in linters) || normalizedEntry.skip_lint === true || normalizedEntry.src.length === 0) {
    return;
  }

  return (linters as any)[linter]()(api, args, normalizedEntry.src);
}

function normalizeEntry(e: Entry) {
  const entry = { ...e };

  if (entry.handler === 'rollup') {
    entry.src = entry.src.map((src: string) => {
      if (src.endsWith('index.js')) {
        return `${dirname(src)}/**/*.{js,vue}`;
      }

      return src;
    });
  }

  entry.src = entry.src.filter((src: string) => !/node_modules/.test(src));

  return entry;
}
