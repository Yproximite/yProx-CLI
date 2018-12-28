import rollup from 'rollup';
import builtins from 'rollup-plugin-node-builtins';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import graphql from 'rollup-plugin-graphql/dist/rollup-plugin-graphql.cjs';
import json from 'rollup-plugin-json';
import globals from 'rollup-plugin-node-globals';
import replace from 'rollup-plugin-replace';
import vue from 'rollup-plugin-vue';
import buble from 'rollup-plugin-buble';
import { terser } from 'rollup-plugin-terser';
import { getEntryName } from '../../../utils/entry';

export default (api, entry, args) => {
  const rollupOptions = api.projectOptions.handlers.rollup;

  const getInputOptions = () => {
    const plugins = [];

    plugins.push(builtins());
    if (rollupOptions.nodeResolve) plugins.push(nodeResolve(rollupOptions.nodeResolve));
    if (rollupOptions.commonjs) plugins.push(commonjs(rollupOptions.commonjs));
    plugins.push(graphql());
    if (rollupOptions.json) plugins.push(json(rollupOptions.json));
    plugins.push(globals());
    if (rollupOptions.vue) plugins.push(vue(rollupOptions.vue));
    if (api.projectOptions.buble) plugins.push(buble(api.projectOptions.buble));

    plugins.push(replace({
      ...Object.entries(api.getSafeEnvVars()).reduce((acc, [key, value]) => {
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
    file: `${entry.dest}/${entry.concat}`,
    format: entry.format || 'umd',
    name: entry.name,
    sourcemap: api.isProduction(),
    globals: rollupOptions.shims,
  });

  const writeBundle = (bundle) => bundle.write(getOutputOptions());

  const build = () => {
    api.logger.info(`rollup :: start bundling "${getEntryName(entry)}"`);

    return rollup.rollup(getInputOptions())
      .then(bundle => {
        api.logger.info(`rollup :: finished bundle "${getEntryName(entry)}"`);
        writeBundle(bundle);
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
