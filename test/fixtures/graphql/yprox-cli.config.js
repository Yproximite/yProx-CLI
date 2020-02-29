// This file will be removed in next versions

module.exports = {
  assets: {
    app: [
      {
        name: 'app',
        handler: 'rollup',
        format: 'cjs',
        src: 'src/medias.js',
        dest: 'dist/',
        destFile: 'medias.js'
      },
    ],
  },
};
