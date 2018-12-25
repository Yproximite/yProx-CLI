module.exports = {
  assets: {
    app: './assets/app.js',
    vendor: './assets/vendor.js',
    themes: (cli, config) => ([
      {
        handler: 'sass',
        src: './themes/_containers/containers.scss',
        dest: config.path.css,
      },
    ]),
    themesSimplyArrayEntries: [
      {
        handler: 'sass',
        src: './themes/_containers/containers.scss',
        dest: './public/css',
        concat: 'containers.simple-array-entries.css',
      },
    ],
  },
  path: {
    js: './public/js',
    css: './public/css',
    img: './public/img',
    plugins: './public/plugins',
  },
  buble: {
    objectAssign: 'Object.assign',
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
