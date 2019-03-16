import graphql from '@kocal/rollup-plugin-graphql';
import chalk from 'chalk';
import { InputOption, InputOptions, OutputOptions, rollup, RollupBuild, RollupError, RollupOutput, watch } from 'rollup';
import buble from 'rollup-plugin-buble';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';
import nodeResolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import { terser } from 'rollup-plugin-terser';
import { EntryRollup } from '../../../../types/entry';
import API from '../../../API';
import { getEntryName } from '../../../utils/entry';
import { isPackageInstalled } from '../../../utils/package';

interface WatchEvent {
  code?: string;
  duration?: number;
  error?: RollupError | Error;
  input?: InputOption;
  output?: string[];
  result?: RollupBuild;
}

function handleError(err: RollupError, api: API): void {
  let description = err.message || err;
  if (err.name) description = `${err.name}: ${description}`;
  let message = err.message || '';

  if (err.plugin) {
    message = `(${err.plugin} plugin) ${description}`;
  } else if (description) {
    message = description as string;
  }

  console.error(chalk`{bold.red [!] ${message.toString()}}`);

  if (err.loc) {
    console.error(`${(err.loc.file || err.id || '').replace(api.context, '')} (${err.loc.line}:${err.loc.column})`);
  } else if (err.id) {
    console.error(err.id.replace(api.context, ''));
  }

  if (err.frame) {
    console.error(chalk.dim(err.frame));
  }

  if (err.stack) {
    console.error(chalk.dim(err.stack));
  }

  const file = (err.loc && err.loc.file) || err.id || '';
  if (/\.vue$/.test(file)) {
    api.logger.info(chalk`If you try to building Vue code, try to run {blue.bold yarn add -D vue-template-compiler}.`);
  }

  console.error('');
}

export default (api: API, entry: EntryRollup, args: CLIArgs): Promise<any> => {
  const rollupOptions = { ...api.projectOptions.handlers.rollup };
  const getInputOptions = (): InputOptions => {
    const plugins = [];

    plugins.push(builtins());
    if (typeof rollupOptions.nodeResolve === 'object') plugins.push(nodeResolve({ ...rollupOptions.nodeResolve }));
    if (typeof rollupOptions.commonjs === 'object') plugins.push(commonjs({ ...rollupOptions.commonjs }));
    if (typeof rollupOptions.json === 'object') plugins.push(json({ ...rollupOptions.json }));
    plugins.push(graphql());
    plugins.push(globals());

    if (typeof rollupOptions.vue === 'object') {
      if (isPackageInstalled('vue-template-compiler')) {
        const vue = require('rollup-plugin-vue');
        plugins.push(vue({ ...rollupOptions.vue }));
      }
    }

    if (typeof api.projectOptions.buble === 'object') {
      plugins.push(
        buble({
          ...api.projectOptions.buble,
          exclude: [/node_modules/],
        })
      );
    }

    plugins.push(
      replace({
        ...Object.entries(api.getSafeEnvVars()).reduce((acc: { [k: string]: string }, [key, value]) => {
          acc[`process.env.${key}`] = JSON.stringify(value);
          return acc;
        }, {}),
      })
    );

    if (api.isProduction()) {
      plugins.push(terser({ ...api.projectOptions.terser }));
    }

    return {
      plugins,
      input: entry.src[0],
      external: Object.keys(rollupOptions.shims),
    };
  };

  const getOutputOptions = (): OutputOptions => ({
    file: `${entry.dest}/${entry.destFile || entry.concat}`,
    format: entry.format || 'umd',
    name: entry.name,
    sourcemap: api.isProduction(),
    globals: rollupOptions.shims,
  });

  const writeBundle = (bundle: RollupBuild): Promise<RollupOutput> => bundle.write(getOutputOptions());

  const build = (resolve: (v?: any) => void, reject: (err?: Error) => void): Promise<void> => {
    api.logger.info(`rollup :: start bundling "${getEntryName(entry)}"`);

    return rollup(getInputOptions())
      .then(bundle => writeBundle(bundle))
      .then(() => {
        api.logger.info(`rollup :: finished bundling "${getEntryName(entry)}"`);
        resolve();
      })
      .catch((err: RollupError) => {
        handleError(err, api);

        if (!args.watch) {
          reject();
          process.exit(1);
        }
      });
  };

  const buildWatcher = (): void => {
    const watchOptions = Object.assign({}, getInputOptions(), {
      output: getOutputOptions(),
      watch: {
        chokidar: {
          usePolling: true,
          ignored: ['**/node_modules/**'],
        },
        exclude: '**/node_modules/**',
      },
    });

    // @ts-ignore
    const watcher = watch(watchOptions);

    watcher.on('event', (e: WatchEvent) => {
      const { code } = e;

      if (code === 'BUNDLE_START') {
        api.logger.info(`rollup (watch) :: start bundling "${getEntryName(entry)}"`);
      } else if (code === 'BUNDLE_END') {
        api.logger.info(`rollup (watch) :: finished bundling "${getEntryName(entry)}"`);
      } else if (['ERROR', 'FATAL'].includes(code as string)) {
        handleError(e.error as RollupError, api);
      }
    });
  };

  return new Promise((resolve, reject) => {
    return args.watch ? buildWatcher() : build(resolve, reject);
  });
};
