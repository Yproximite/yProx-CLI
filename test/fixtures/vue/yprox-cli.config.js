// This file will be removed in next versions

module.exports = {
  assets: {
    app: [
      {
        handler: 'js',
        src: 'src/button/index.js',
        dest: 'dist',
        concat: 'button.js'
      },
    ],
  },
  handlers: {
    javascript: {
      babel: {
        exclude: 'node_modules/**',
        runtimeHelpers: true
      }
    }
  },
};
