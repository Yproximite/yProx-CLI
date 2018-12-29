import gulp from 'gulp';
import API from '../../../API';

export default (api: API, entry: EntryFile, args: CLIArgs) => {
  return gulp.src(entry.src)
    .pipe(gulp.dest(entry.dest));
};
