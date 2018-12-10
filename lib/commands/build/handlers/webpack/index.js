const webpack = require('webpack');
const Config = require('webpack-chain');

module.exports = (api, entry, args) => {
  // console.log({ api, entry, args });

  const getConfig = () => {
    const config = new Config();

    [
      './defaults',
      './defaults/module',
      './defaults/optimization',
      './defaults/output',
      './defaults/plugins',
      './defaults/resolve',
    ].forEach(m => require(m)(api, entry, args)(config));

    if (api.projectOptions.handlers.webpack) {
      api.projectOptions.handlers.webpack(config);
    }

    entry.config(config);

    if (!config.output.has('path')) {
      api.logger.error(`You must define output's path in the following webpack entry:\n${JSON.stringify(entry, null, 2)}`);
      throw new Error("Invalid output's path configuration.");
    }

    config.output.path(api.resolve(config.output.get('path')));

    api.logger.log(`Webpack config:\n${config.toString()}`);
    return config.toConfig();
  };

  const config = getConfig();

  const afterBuild = (err, stats) => {
    if (err) {
      api.logger.error(err.stack || err);
      if (err.details) {
        api.logger.error(err.details);
      }
      return;
    }

    console.log(stats.toString(config.stats));
  };

  const compiler = webpack(config);
  if (args.watch) {
    compiler.watch(config.watchOptions, afterBuild);
  } else {
    compiler.run(afterBuild);
  }
};
