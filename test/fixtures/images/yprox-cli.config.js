// This file will be removed in next versions

module.exports = {
  assets: {
    app: [
      {
        name: 'images to optimize',
        handler: 'image',
        src: 'src/*',
        dest: 'dist'
      },
    ],
  },
  gifsicle: {
    optimizationLevel: 3,
    colors: 16
  }
};
