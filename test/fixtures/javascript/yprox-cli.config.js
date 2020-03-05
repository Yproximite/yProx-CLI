// This file will be removed in next versions

module.exports = {
  assets: {
    app: [
      {
        handler: 'js',
        src: [
          'src/hello-world.js',
          'src/es6.js',
        ],
        dest: 'dist',
        concat: 'scripts.js',
      },
    ],
  },
  handlers: {
    javascript: {
      babel: {
        exclude: [
          '/node_modules/**',
          /\/core-js\//, // see https://github.com/rollup/rollup-plugin-babel/issues/254
        ],
        runtimeHelpers: true
      }
    }
  },
};
