import gulp from 'gulp';

export default (api: API, entry: Entry, args: Args) => {
  return gulp.src(entry.src)
    .pipe(gulp.dest(entry.dest));
}
