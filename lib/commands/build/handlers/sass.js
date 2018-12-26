const gulp = require('gulp');
const sass = require('gulp-sass');
const gulpIf = require('gulp-if');
const concat = require('gulp-concat');
const postcss = require('gulp-postcss');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const tildeImporter = require('node-sass-tilde-importer');

module.exports = (api, entry, args) => {
  const sassOptions = Object.assign({
    importer: tildeImporter,
  }, api.projectOptions.sass);

  const postcssPlugins = [
    autoprefixer(api.projectOptions.autoprefixer),
  ];

  if (api.mode === 'production') {
    postcssPlugins.push(cssnano(api.projectOptions.cssnano));
  }

  const src = entry.src[0];
  api.logger.info(`sass :: start bundling "${src}"`);

  let stream = gulp.src(src)
    .on('end', () => api.logger.info(`sass :: finished bundle "${src}"`));

  if (entry.concat) {
    stream = stream.pipe(concat(entry.concat));
  }

  return stream.pipe(gulpIf(api.mode === 'production', sourcemaps.init()))
    .pipe(sass(sassOptions).on('error', sass.logError))
    .pipe(postcss(postcssPlugins))
    .pipe(gulpIf(api.mode === 'production', sourcemaps.write('.')))
    .pipe(gulp.dest(entry.dest));
};
