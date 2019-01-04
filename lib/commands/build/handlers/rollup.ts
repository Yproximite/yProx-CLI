import * as rollup from 'rollup';
import buble from 'rollup-plugin-buble';
import commonjs from 'rollup-plugin-commonjs';
import graphql from 'rollup-plugin-graphql';
import json from 'rollup-plugin-json';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';
import nodeResolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import { terser } from 'rollup-plugin-terser';
import vue from 'rollup-plugin-vue';
import API from '../../../API';
import { getEntryName } from '../../../utils/entry';

export default (api: API, entry: EntryCSS, args: CLIArgs): Promise<any> => {
  const rollupOptions = api.projectOptions.handlers.rollup;
  const getInputOptions = () => {
    const plugins = [];

    plugins.push(builtins());
    if (typeof rollupOptions.nodeResolve === 'object') plugins.push(nodeResolve(rollupOptions.nodeResolve));
    if (typeof rollupOptions.commonjs === 'object') plugins.push(commonjs(rollupOptions.commonjs));
    plugins.push(graphql());
    if (typeof rollupOptions.json === 'object') plugins.push(json(rollupOptions.json));
    plugins.push(globals());
    if (typeof rollupOptions.vue === 'object') plugins.push(vue(rollupOptions.vue));
    if (typeof api.projectOptions.buble === 'object') {
      plugins.push(
        buble({
          ...api.projectOptions.buble,
          exclude: ['**/node_modules/**'],
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
      plugins.push(terser(api.projectOptions.terser));
    }

    return {
      plugins,
      input: entry.src[0],
      external: Object.keys(rollupOptions.shims),
      acorn: {
        ecmaVersion: 9,
      },
    };
  };

  const getOutputOptions = () => ({
    file: `${entry.dest}/${entry.destFile || entry.concat}`,
    format: entry.format || 'umd',
    name: entry.name,
    sourcemap: api.isProduction(),
    globals: rollupOptions.shims,
  });

  const writeBundle = (bundle: rollup.RollupBuild) => bundle.write(getOutputOptions());

  const build = (resolve: (v?: any) => void, reject: (err?: Error) => void) => {
    api.logger.info(`rollup :: start bundling "${getEntryName(entry)}"`);

    return rollup
      .rollup(getInputOptions())
      .then(bundle => writeBundle(bundle))
      .then(() => {
        api.logger.info(`rollup :: finished bundling "${getEntryName(entry)}"`);
        resolve();
      })
      .catch((err: rollup.RollupError) => {
        api.logger.error(err.message);
        if (err.loc) api.logger.error(JSON.stringify(err.loc, null, 2));
        // @ts-ignore
        if (err.snippet) api.logger.error(JSON.stringify(err.snippet, null, 2));

        console.error(err);

        if (!args.watch) {
          reject();
          process.exit(1);
        }
      });
  };

  const watch = () => {
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
    const watcher = rollup.watch(watchOptions);

    watcher.on('event', e => {
      const { code } = e;

      if (code === 'BUNDLE_START') {
        api.logger.info(`rollup (watch) :: start bundling "${getEntryName(entry)}"`);
      } else if (code === 'BUNDLE_END') {
        api.logger.info(`rollup (watch) :: finished bundling "${getEntryName(entry)}"`);
      } else if (['ERROR', 'FATAL'].includes(code)) {
        api.logger.error('rollup (watch) :: something wrong happens');
        console.error(e);
      }
    });
  };

  return new Promise((resolve, reject) => {
    return args.watch ? watch() : build(resolve, reject);
  });
};
