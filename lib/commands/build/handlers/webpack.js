const webpack = require('webpack');
const merge = require('webpack-merge');

const defaultConfig = () => ({});

module.exports = (api, entry, args) => {
  console.log({ api, entry, args });

  const getConfig = () => {
    const config = () => ({
      mode: api.mode,

    });

    return merge(defaultConfig(), config(), api.projectOptions.handlers.webpack);
  };

  console.log(getConfig());

  webpack(getConfig(), (err, stats) => {
    if (err) {
      console.error(err.stack || err);
      if (err.details) {
        console.error(err.details);
      }
      return;
    }

    const info = stats.toJson();

    if (stats.hasErrors()) {
      api.logger.error(info.errors);
    }

    if (stats.hasWarnings()) {
      api.logger.warn(info.warnings);
    }

  });
};
