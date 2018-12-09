const webpack = require('webpack');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (api, entry, args) => {
  return (config) => {
    config.plugin('plugin-define')
      .use(webpack.EnvironmentPlugin, [Object.keys(api.getSafeEnvVars())]);

    config.plugin('plugin-vue-loader')
      .use(VueLoaderPlugin, [{
        productionMode: api.mode === 'production',
        compilerOptions: {
          preserveWhitespace: false,
        }
      }]);

    config.plugin('plugin-mini-css-extract')
      .use(MiniCssExtractPlugin, [{
        filename: '[name].css',
      }]);

    config.plugin('plugin-friendly-errors')
      .use(FriendlyErrorsWebpackPlugin, [{
        clearConsole: false
      }]);
  };
};
