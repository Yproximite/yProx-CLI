module.exports = {
  assets: {
    app: './assets/app.js',
    themes: './assets/themes.js',
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
        objectAssign: 'Object.assign',
      },
      string: {
        include: '**/*.graphql',
      },
      shims: {
        'app': 'App',
        'app-front': 'AppFront',
        'constants': 'Constants',
        'lodash': '_',
        'underscore': '_',
        'routing': 'Routing',
        'translator': 'Translator',
        'google': 'google',
        'js-marker-clusterer': 'MarkerClusterer',
        'vue-strap': 'VueStrap',
        'jquery': 'jQuery',
        'codemirror': 'CodeMirror',
        'dropzone': 'Dropzone',
      },
    },
  },
};
