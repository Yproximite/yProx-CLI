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
};
