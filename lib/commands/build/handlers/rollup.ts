import { rollup, RollupSingleFileBuild } from 'rollup';
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

export default (api: API, entry: EntryRollup, args: CLIArgs) => {
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
    if (typeof api.projectOptions.buble === 'object') plugins.push(buble(api.projectOptions.buble));

    plugins.push(replace({
      ...Object.entries(api.getSafeEnvVars()).reduce((acc: { [k: string]: string }, [key, value]) => {
        acc[`process.env.${key}`] = JSON.stringify(value);
        return acc;
      }, {}),
    }));

    if (api.isProduction()) {
      plugins.push(terser(api.projectOptions.terser));
    }

    return {
      plugins,
      input: entry.src[0],
      external: Object.keys(rollupOptions.shims),
    };
  };

  const getOutputOptions = () => ({
    file: `${entry.dest}/${entry.destFile || entry.concat}`,
    format: entry.format || 'umd',
    name: entry.name,
    sourcemap: api.isProduction(),
    globals: rollupOptions.shims,
  });

  const writeBundle = (bundle: RollupSingleFileBuild) => bundle.write(getOutputOptions());

  const build = () => {
    api.logger.info(`rollup :: start bundling "${getEntryName(entry)}"`);

    return rollup(getInputOptions())
      .then(bundle => writeBundle(bundle))
      .then(() => {
        api.logger.info(`rollup :: finished bundle "${getEntryName(entry)}"`);
      })
      .catch(err => {
        api.logger.error(err.message);
        if (err.loc) api.logger.error(err.loc);
        if (err.snippet) api.logger.error(err.snippet);

        console.log(err);

        if (!args.watch) {
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

    const watcher = rollup.watch(watchOptions);

    watcher.on('event', (e) => {
      const { code } = e;

      if (code === 'BUNDLE_START') {
        api.logger.info(`rollup (watch) :: start bundling "${getEntryName(entry)}"`);
      } else if (code === 'BUNDLE_END') {
        api.logger.info(`rollup (watch) :: finished bundle "${getEntryName(entry)}"`);
      } else if (['ERROR', 'FATAL'].includes(code)) {
        api.logger.error(`rollup (watch) :: something wrong happens`);
        api.logger.error(e);
      }
    });
  };

  return args.watch ? watch() : build();
}
