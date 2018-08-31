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
      buble: {
        objectAssign: 'ObjectAssign',
      },
      string: {
        include: '**/*.graphql',
      },
      external: [
        'app',
        'app-front',
        'lodash',
        'routing',
        'translator',
        'google',
        'js-marker-clusterer',
      ],
      globals: {
        app: 'App',
        'app-front': 'AppFront',
        lodash: '_',
        routing: 'Routing',
        translator: 'Translator',
        google: 'google',
        'js-marker-clusterer': 'MarkerClusterer',
      }
    }
  },
};
