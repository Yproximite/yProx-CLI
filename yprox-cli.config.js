module.exports = {
  assets: {
    app: './test-app/assets/app.js',
    themes: './test-app/assets/themes.js',
    vendor: './test-app/assets/vendor.js',
  },
  path: {
    js: './test-app/public/js',
    css: './test-app/public/css',
    img: './test-app/public/img',
    plugins: './test-app/public/plugins',
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
