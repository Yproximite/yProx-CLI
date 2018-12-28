import gulp from 'gulp';
import gulpIf from 'gulp-if';
import imagemin from 'gulp-imagemin';

export default (api, entry, args) => {
  const imageminPlugins = [
    imagemin.gifsicle(api.projectOptions.gifsicle),
    imagemin.jpegtran(api.projectOptions.jpegtran),
    imagemin.optipng(api.projectOptions.optipng),
    imagemin.svgo(api.projectOptions.svgo),
  ];

  return gulp.src(entry.src)
    .pipe(gulpIf(api.isProduction(), imagemin(imageminPlugins)))
    .pipe(gulp.dest(entry.dest));
}
