module.exports = {
  assets: {
    app: './assets/app.js',
    vendor: './assets/vendor.js',
  },
  path: {
    js: './public/js',
    css: './public/css',
    img: './public/img',
    plugins: './public/plugins',
  },
  handlers: {
    autoprefixer: {
      browsers: ['> 0.25%'],
    },
    rollup: {
      external: [
        'app',
        'app-front',
        'lodash',
        'routing',
        'translator',
        'google',
        'js-marker-clusterer',
      ]
    }
  },
};
