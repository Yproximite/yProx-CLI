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
const log = require('fancy-log');

module.exports = (cli, entry, args) => {
  const rollupOptions = cli.projectOptions.handlers.rollup;

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
      'process.env.NODE_ENV': JSON.stringify(cli.mode),
    }));

    if (cli.mode === 'production') {
      plugins.push(terser(cli.projectOptions.uglify));
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
    sourcemap: cli.mode === 'production',
    globals: rollupOptions.shims,
  });

  const writeBundle = (bundle) => bundle.write(getOutputOptions());

  const build = () => {
    log.info(`Rollup: start bundling "${entry.src}"`);

    return rollup.rollup(getInputOptions())
      .then(bundle => writeBundle(bundle))
      .catch(err => {
        log.error(err.message, err.loc, err.snippet);
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
        log.info(`Rollup (watch): start bundling "${entry.src}"`);
      } else if (code === 'BUNDLE_END') {
        log.info(`Rollup (watch): done bundling "${entry.src}"`);
      } else if (['ERROR', 'FATAL'].includes(code)) {
        log.error(`Rollup (watch): something wrong happens`);
        log.error(e);
      }
    });
  };

  return args.watch ? watch() : build();
};
