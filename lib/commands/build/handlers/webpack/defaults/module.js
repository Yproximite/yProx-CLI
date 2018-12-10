const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

module.exports = (api, entry, args) => {
  return (config) => {
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
  };
};
