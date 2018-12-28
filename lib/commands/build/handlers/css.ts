import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import gulp from 'gulp';
import concat from 'gulp-concat';
import gulpIf from 'gulp-if';
import postcss from 'gulp-postcss';
import sourcemaps from 'gulp-sourcemaps';

export default (api, entry, args) => {
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
};
