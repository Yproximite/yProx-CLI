const gulp = require('gulp');
const gulpIf = require('gulp-if');
const concat = require('gulp-concat');
const terser = require('gulp-terser');
const sourcemaps = require('gulp-sourcemaps');

module.exports = (api, entry, args) => {
  let stream = gulp.src(entry.src)
    .on('end', () => api.logger.info(`js :: finished bundle "${entry.src}"`));

  api.logger.info(`js :: start bundling "${entry.src}"`);

  if (entry.concat) {
    stream = stream.pipe(concat(entry.concat));
  }

  stream = stream
    .pipe(gulpIf(api.isProduction(), sourcemaps.init()))
    .pipe(gulpIf(entry.uglify && api.isProduction(), uglify(api.projectOptions.uglify)))
    .pipe(gulpIf(api.isProduction(), sourcemaps.write('.')))
    .pipe(gulp.dest(entry.dest))
  ;

  return stream;
};
