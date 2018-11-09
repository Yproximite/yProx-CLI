const { resolve } = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (api, entry, args) => {
  // console.log({ api, entry, args });

  const getConfig = () => {
    const entryWebpackConfig = entry.config;

    if (!entryWebpackConfig.output || !entryWebpackConfig.output.path) {
      api.logger.error('You must define "output.name" in the following entry:');
      api.logger.error(JSON.stringify(entry, null, 2));
      throw new Error('Invalid "output.name" configuration.');
    }
    entryWebpackConfig.output.path = resolve(api.context, entryWebpackConfig.output.path);

    return merge({
      mode: api.mode,
      context: api.context,
      target: 'web',
      output: {
        filename: '[name].js',
      },
      resolve: {
        extensions: ['.js', '.json', '.vue'],
        modules: [
          resolve(__dirname, '../../../../node_modules'),
          resolve(api.context, 'node_modules'),
        ],
      },
      optimization: {
        minimizer: [new TerserPlugin()],
      },
      watchOptions: {
        poll: 1000,
        ignored: /node_modules/,
      },
      stats: {
        chunks: false,
        colors: true,
      },
      module: {
        rules: [
          {
            test: /\.js$/,
            loader: 'buble-loader',
            options: api.projectOptions.buble,
          },
          {
            test: /\.vue$/,
            loader: 'vue-loader',
          },
        ],
      },
      plugins: [
        new VueLoaderPlugin(),
      ],
    }, entryWebpackConfig, api.projectOptions.handlers.webpack);
  };

  const config = getConfig();
  api.logger.info(`webpack :: start bundling:\n${JSON.stringify(config.entry, null, 2)}`);

  const compiler = webpack(config);

  compiler.run((err, stats) => {
    if (err) {
      api.logger.error(err.stack || err);
      if (err.details) {
        api.logger.error(err.details);
      }
      return;
    }

    api.logger.info(`webpack :: done bundling:\n${JSON.stringify(config.entry, null, 2)}`);

    console.log(stats.toString());
  });
};
