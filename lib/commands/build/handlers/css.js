const gulp = require('gulp');
const gulpIf = require('gulp-if');
const concat = require('gulp-concat');
const postcss = require('gulp-postcss');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

module.exports = (api, entry, args) => {
  let stream = gulp.src(entry.src);

  if (entry.concat) {
    stream = stream.pipe(concat(entry.concat));
  }

  const postcssPlugins = [
    autoprefixer(api.projectOptions.autoprefixer),
  ];

  if (api.isProduction()) {
    postcssPlugins.push(cssnano(api.projectOptions.cssnano));
  }

  stream = stream
    .pipe(gulpIf(api.isProduction(), sourcemaps.init()))
    .pipe(postcss(postcssPlugins))
    .pipe(gulpIf(api.isProduction(), sourcemaps.write('.')))
    .pipe(gulp.dest(entry.dest))
  ;

  return stream;
}
