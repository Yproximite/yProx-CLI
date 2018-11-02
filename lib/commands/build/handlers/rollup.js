const rollup = require('rollup');
const builtins = require('rollup-plugin-node-builtins');
const nodeResolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const string = require('rollup-plugin-string');
const json = require('rollup-plugin-json');
const globals = require('rollup-plugin-node-globals');
const replace = require('rollup-plugin-replace');
const vue = require('rollup-plugin-vue').default;
const buble = require('rollup-plugin-buble');
const { terser } = require('rollup-plugin-terser');

module.exports = (api, entry, args) => {
  const rollupOptions = api.projectOptions.handlers.rollup;

  const getInputOptions = () => {
    const plugins = [];

    plugins.push(builtins());
    if (rollupOptions.nodeResolve !== false) plugins.push(nodeResolve(rollupOptions.nodeResolve));
    if (rollupOptions.commonjs !== false) plugins.push(commonjs(rollupOptions.commonjs));
    if (rollupOptions.string !== false) plugins.push(string(rollupOptions.string));
    if (rollupOptions.json !== false) plugins.push(json(rollupOptions.json));
    plugins.push(globals());
    if (rollupOptions.vue !== false) plugins.push(vue(rollupOptions.vue));
    if (rollupOptions.buble !== false) plugins.push(buble(rollupOptions.buble));

    plugins.push(replace({
      'process.env.NODE_ENV': JSON.stringify(api.mode),
    }));

    if (api.mode === 'production') {
      plugins.push(terser(api.projectOptions.uglify));
    }

    return {
      plugins,
      input: entry.src,
      external: Object.keys(rollupOptions.shims),
    };
  };

  const getOutputOptions = () => ({
    file: `${entry.dest}/${entry.concat}`,
    format: entry.format || 'umd',
    name: entry.name,
    sourcemap: api.mode === 'production',
    globals: rollupOptions.shims,
  });

  const writeBundle = (bundle) => bundle.write(getOutputOptions());

  const build = () => {
    api.logger.info(`rollup :: start bundling "${entry.src}"`);

    return rollup.rollup(getInputOptions())
      .then(bundle => {
        api.logger.info(`rollup :: finished bundle "${entry.src}"`);
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
        api.logger.info(`rollup (watch) :: start bundling "${entry.src}"`);
      } else if (code === 'BUNDLE_END') {
        api.logger.info(`rollup (watch) :: finished bundle "${entry.src}"`);
      } else if (['ERROR', 'FATAL'].includes(code)) {
        api.logger.error(`rollup (watch) :: something wrong happens`);
        api.logger.error(e);
      }
    });
  };

  return args.watch ? watch() : build();
};
