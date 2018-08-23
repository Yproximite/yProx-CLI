const gulp = require('gulp');

module.exports = (cli, entry, args) => {
  return gulp.src(entry.src)
    .pipe(gulp.dest(entry.dest));
};
