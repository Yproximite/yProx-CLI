const gulp = require('gulp');
const gulpIf = require('gulp-if');
const imagemin = require('gulp-imagemin');

module.exports = (cli, entry, args) => {
  const imageminPlugins = [
    imagemin.gifsicle(cli.projectOptions.gifsicle),
    imagemin.jpegtran(cli.projectOptions.jpegtran),
    imagemin.optipng(cli.projectOptions.optipng),
    imagemin.svgo(cli.projectOptions.svgo),
  ];

  return gulp.src(entry.src)
    .pipe(gulpIf(cli.mode === 'production', imagemin(imageminPlugins)))
    .pipe(gulp.dest(entry.dest));
};
