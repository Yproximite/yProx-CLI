// This file will be removed in next versions

module.exports = {
  assets: {
    app: [
      {
        name: 'files to copy',
        handler: 'file',
        src: [
          'src/lorem.txt',
          'node_modules/udhr/data/udhr-txt/udhr_eng.txt'
        ],
        dest: 'dist/'
      },
    ],
  },
};
