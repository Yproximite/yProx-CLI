const merge = require('deepmerge');

const config = require(process.cwd() + '/yprox-cli.config.js');
const defaultConfig = {
  mode: null,
  path: {},
  handlers: {
    autoprefixer: {},
    cssnano: {
      safe: true,
      autoprefixer: false,
    },
    uglify: {
      compress: {
        drop_console: true,
      },
    },
    gifsicle: {
      interlaced: true,
    },
    jpegtran: {
      progressive: true,
    },
    optipng: {
      optimizationLevel: 5,
    },
    svgo: {
      plugins: [
        {
          removeViewBox: true,
        },
      ],
    },
  },
};

module.exports = merge(defaultConfig, config);
