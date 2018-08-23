const gulp = require('gulp');
const gulpIf = require('gulp-if');
const watchify = require('watchify');
const uglify = require('gulp-uglify-es').default;
const buffer = require('vinyl-buffer');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const sourcemaps = require('gulp-sourcemaps');
const log = require('fancy-log');

const errorMessage = (error) => `${error.message}\n${error.codeFrame}`;

module.exports = (cli, entry, args) => {
  const rebundle = (bundler) => {
    return bundler
      .bundle()
      .on('error', msg => log.error(`Browserify: ${errorMessage(msg)}`))
      .on('end', () => log.info(`Browserify: ${entry.dest}/${entry.concat}`))
      .pipe(source(entry.concat))
      .pipe(buffer())
      .pipe(gulpIf(cli.mode === 'production', sourcemaps.init()))
      .pipe(gulpIf(cli.mode === 'production', uglify(cli.projectOptions.uglify)))
      .pipe(gulpIf(cli.mode === 'production', sourcemaps.write('.')))
      .pipe(gulp.dest(entry.dest));
  };

  let options = {
    entries: entry.src,
    debug: cli.mode === 'development',
  };

  if (args.watch) {
    options = { ...watchify.args, ...options };
  }

  const bundler = browserify(options);
  bundler.transform('vueify');
  bundler.transform('babelify');
  bundler.transform('envify', { NODE_ENV: cli.mode });
  bundler.transform('browserify-shim');

  if (args.watch) {
    bundler.on('update', () => rebundle(bundler));
    bundler.plugin(watchify, {
      poll: true,
      ignoreWatch: ['**/node_modules/**'],
    });
  }

  return rebundle(bundler);
};
