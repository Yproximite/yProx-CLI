const gulp = require('gulp');
const gulpIf = require('gulp-if');
const concat = require('gulp-concat');
const postcss = require('gulp-postcss');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

module.exports = (cli, entry, args) => {
  let stream = gulp.src(entry.src);

  if (entry.concat) {
    stream = stream.pipe(concat(entry.concat));
  }

  const postcssPlugins = [
    autoprefixer(cli.projectOptions.autoprefixer),
  ];

  if (cli.mode === 'production') {
    postcssPlugins.push(cssnano(cli.projectOptions.cssnano));
  }

  stream = stream
    .pipe(gulpIf(cli.mode === 'production', sourcemaps.init()))
    .pipe(postcss(postcssPlugins))
    .pipe(gulpIf(cli.mode === 'production', sourcemaps.write('.')))
    .pipe(gulp.dest(entry.dest))
  ;

  return stream;
}
