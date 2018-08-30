const rollup = require('rollup');
const builtins = require('rollup-plugin-node-builtins');
const nodeResolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const globals = require('rollup-plugin-node-globals');
const replace = require('rollup-plugin-replace');
const vue = require('rollup-plugin-vue').default;
const buble = require('rollup-plugin-buble');
const { terser } = require('rollup-plugin-terser');
const log = require('fancy-log');

module.exports = (cli, entry, args) => {
  const getInputOptions = () => {
    const plugins = [];

    plugins.push(builtins());
    plugins.push(nodeResolve(cli.projectOptions.handlers.rollup.nodeResolve));
    plugins.push(commonjs(cli.projectOptions.handlers.rollup.commonjs));
    plugins.push(globals());
    plugins.push(vue(cli.projectOptions.handlers.rollup.vue));
    plugins.push(replace({
      'process.env.NODE_ENV': JSON.stringify(cli.mode),
    }));
    plugins.push(buble(cli.projectOptions.handlers.rollup.buble));

    if (cli.mode === 'production') {
      plugins.push(terser(cli.projectOptions.uglify));
    }

    return {
      plugins,
      input: entry.src,
      external: cli.projectOptions.handlers.rollup.external,
    };
  };

  const writeBundle = (bundle) => bundle.write({
    file: `${entry.dest}/${entry.concat}`,
    format: entry.format || 'umd',
    name: entry.name,
    sourcemap: cli.mode === 'production',
    globals: cli.projectOptions.handlers.rollup.globals,
  });

  const build = () => {
    log.info(`Rollup: start bundling "${entry.src}"`);

    return rollup.rollup(getInputOptions())
      .then(bundle => writeBundle(bundle))
      .catch(err => {
        log.error(err.message, err.loc, err.snippet);

        if (!args.watch) {
          process.exit(1);
        }
      });
  };

  const watch = () => {
    const watchOptions = Object.assign({}, getInputOptions(), {
      watch: {
        chokidar: true,
      },
    });

    const watcher = rollup.watch(watchOptions);

    watcher.on('event', (e) => {
      const { code } = e;
      console.log(e);

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
