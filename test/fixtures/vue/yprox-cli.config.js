// This file will be removed in next versions

module.exports = {
  assets: {
    app: [
      {
        handler: 'rollup',
        src: 'src/button/index.js',
        dest: 'dist',
        concat: 'button.js'
      },
    ],
  },
  handlers: {
    rollup: {
      babel: {
        exclude: 'node_modules/**',
        runtimeHelpers: true
      }
    }
  },
};
