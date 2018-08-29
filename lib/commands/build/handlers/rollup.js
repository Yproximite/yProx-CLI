const rollup = require('rollup');
const builtins = require('rollup-plugin-node-builtins');
const nodeResolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const replace = require('rollup-plugin-replace');
const vue = require('rollup-plugin-vue').default;
const babel = require('rollup-plugin-babel');
const { uglify } = require('rollup-plugin-uglify');
const log = require('fancy-log');

module.exports = (cli, entry, args) => {
  const getInputOptions = () => {
    const plugins = [];

    plugins.push(builtins());
    plugins.push(nodeResolve(cli.projectOptions.handlers.rollup.nodeResolve));
    plugins.push(commonjs(cli.projectOptions.handlers.rollup.commonjs));
    plugins.push(vue(cli.projectOptions.handlers.rollup.vue));
    plugins.push(replace({
      'process.env.NODE_ENV': JSON.stringify(cli.mode),
    }));

    if (!args.hasOwnProperty('babelify') || args.babelify) { // --no-babelify
      plugins.push(babel(cli.projectOptions.handlers.rollup.babel));
    }

    if (cli.mode === 'production') {
      plugins.push(uglify(cli.projectOptions.uglify));
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
  });

  const build = () => {
    log.info(`Rollup: start bundling "${entry.src}"`);

    return rollup.rollup(getInputOptions()).then(bundle => writeBundle(bundle));
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
