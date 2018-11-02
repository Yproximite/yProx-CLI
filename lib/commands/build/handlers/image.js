const gulp = require('gulp');
const gulpIf = require('gulp-if');
const imagemin = require('gulp-imagemin');

module.exports = (api, entry, args) => {
  const imageminPlugins = [
    imagemin.gifsicle(api.projectOptions.gifsicle),
    imagemin.jpegtran(api.projectOptions.jpegtran),
    imagemin.optipng(api.projectOptions.optipng),
    imagemin.svgo(api.projectOptions.svgo),
  ];

  return gulp.src(entry.src)
    .pipe(gulpIf(api.mode === 'production', imagemin(imageminPlugins)))
    .pipe(gulp.dest(entry.dest));
};
