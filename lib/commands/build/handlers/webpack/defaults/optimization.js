const TerserPlugin = require('terser-webpack-plugin');

module.exports = (api, entry, args) => {
  return (config) => {
    config.optimization
      .minimizer('minimizer')
      .use(TerserPlugin, [{
        cache: true,
        parallel: true,
      }])
      .end()
      .runtimeChunk({
        name: 'manifest',
      })
      .splitChunks({
        cacheGroups: {
          vendors: {
            name: 'vendor',
            test: /[\\\/]node_modules[\\\/]/,
            priority: -10,
            chunks: 'initial',
          },
          common: {
            name: 'common',
            minChunks: 2,
            priority: -20,
            chunks: 'initial',
            reuseExistingChunk: true,
          },
        },
      });
  };
};
