const gulp = require('gulp');

module.exports = (api, entry, args) => {
  return gulp.src(entry.src)
    .pipe(gulp.dest(entry.dest));
};
