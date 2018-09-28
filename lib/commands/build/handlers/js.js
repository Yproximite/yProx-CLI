const gulp = require('gulp');
const gulpIf = require('gulp-if');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const sourcemaps = require('gulp-sourcemaps');

module.exports = (cli, entry, args) => {
  let stream = gulp.src(entry.src)
    .on('end', () => cli.logger.info(`js :: finished bundle "${entry.src}"`));

  cli.logger.info(`js :: start bundling "${entry.src}"`);

  if (entry.concat) {
    stream = stream.pipe(concat(entry.concat));
  }

  stream = stream
    .pipe(gulpIf(cli.mode === 'production', sourcemaps.init()))
    .pipe(gulpIf(entry.uglify && cli.mode === 'production', uglify(cli.projectOptions.uglify)))
    .pipe(gulpIf(cli.mode === 'production', sourcemaps.write('.')))
    .pipe(gulp.dest(entry.dest))
  ;

  return stream;
};
