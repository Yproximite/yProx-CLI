const gulp = require('gulp');
const sass = require('gulp-sass');
const gulpIf = require('gulp-if');
const concat = require('gulp-concat');
const postcss = require('gulp-postcss');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const tildeImporter = require('node-sass-tilde-importer');

module.exports = (cli, entry, args) => {
  const sassOptions = Object.assign({
    importer: tildeImporter,
  }, cli.projectOptions.sass);

  const postcssPlugins = [
    autoprefixer(cli.projectOptions.autoprefixer),
  ];

  if (cli.mode === 'production') {
    postcssPlugins.push(cssnano(cli.projectOptions.cssnano));
  }

  cli.logger.info(`sass :: start bundling "${entry.src}"`);

  let stream = gulp.src(entry.src)
    .on('end', () => cli.logger.info(`sass :: finished bundle "${entry.src}"`));

  if (entry.concat) {
    stream = stream.pipe(concat(entry.concat));
  }

  return stream.pipe(gulpIf(cli.mode === 'production', sourcemaps.init()))
    .pipe(sass(sassOptions).on('error', sass.logError))
    .pipe(postcss(postcssPlugins))
    .pipe(gulpIf(cli.mode === 'production', sourcemaps.write('.')))
    .pipe(gulp.dest(entry.dest));
};
