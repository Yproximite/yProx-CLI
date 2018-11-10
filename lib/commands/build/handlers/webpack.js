const { resolve } = require('path');
const webpack = require('webpack');
const Config = require('webpack-chain');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

module.exports = (api, entry, args) => {
  // console.log({ api, entry, args });

  const getConfig = () => {
    const config = new Config();
    config
      .mode(api.mode)
      .context(api.context)
      .target('web')
      .watchOptions({
        poll: 300,
        ignored: /node_modules/,
      })
      .stats({
        colors: true,
        children: false,
        modules: false,
        version: false,
        hash: false,
      });

    config.output
      .filename('[name].js');

    config.resolve.extensions
      .add('.js')
      .add('.json')
      .add('.vue');

    config.resolve.modules
      .add(api.resolve('node_modules'))
      .add(resolve(__dirname, '../../../../node_modules'));

    config.optimization
      .minimizer('minimizer')
        .use(TerserPlugin, [{
          cache: true,
          parallel: true,
        }]);

    config.plugin('plugin-define')
      .use(webpack.DefinePlugin, [{
        'process.env.NODE_ENV': JSON.stringify(api.mode),
      }]);

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

    config.module.rule('raw')
      .test(/\.(graphql|gql)$/)
      .use('raw-loader')
        .loader('raw-loader');

    config.module.rule('buble')
      .test(/\.js$/)
      .use('buble-loader')
        .loader('buble-loader')
        .options(api.projectOptions.buble);

    config.module.rule('vue')
      .test(/\.vue$/)
      .use('vue-loader')
        .loader('vue-loader');

    config.module.rule('css')
      .test(/\.css$/)
      .use(api.mode === 'production' ? 'mini-css-extract-loader' : 'vue-style-loader')
        .loader(api.mode === 'production' ? MiniCssExtractPlugin.loader : 'vue-style-loader')
        .end()
      .use('css-loader')
        .loader('css-loader')
        .options({ importLoaders: 1 })
        .end()
      .use('postcss-loader')
        .loader('postcss-loader')
        .options({
          plugins: [
            autoprefixer(api.projectOptions.autoprefixer),
            ...(api.mode === 'production' ? [
              cssnano(api.projectOptions.cssnano),
            ] : []),
          ],
        });

    config.module.rule('scss')
      .test(/\.scss$/)
      .use('vue-style-loader')
        .loader('vue-style-loader')
        .end()
      .use('css-loader')
        .loader('css-loader')
        .end()
      .use('sass-loader')
        .loader('sass-loader');

    config.module.rule('sass')
      .test(/\.sass$/)
      .use('vue-style-loader')
        .loader('vue-style-loader')
        .end()
      .use('css-loader')
        .loader('css-loader')
        .end()
      .use('sass-loader')
        .loader('sass-loader')
        .options({ indentedSyntax: true });

    if (api.projectOptions.handlers.webpack) {
      api.projectOptions.handlers.webpack(config);
    }

    entry.config(config);

    if (!config.output.has('path')) {
      api.logger.error(`You must define output's path in the following webpack entry:\n${JSON.stringify(entry, null, 2)}`);
      throw new Error("Invalid output's path configuration.");
    }

    config.output.path(resolve(api.context, config.output.get('path')));

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
