import gulp from 'gulp';
import concat from 'gulp-concat';
import gulpIf from 'gulp-if';
import sourcemaps from 'gulp-sourcemaps';
import terser from 'gulp-terser';
import API from '../../../API';
import { getEntryName } from '../../../utils/entry';

export default (api: API, entry: EntryJS, args: CLIArgs) => {
  let stream = gulp.src(entry.src)
    .on('end', () => api.logger.info(`js :: finished bundle "${getEntryName(entry)}"`));

  api.logger.info(`js :: start bundling "${getEntryName(entry)}"`);

  if (entry.concat) {
    stream = stream.pipe(concat(entry.concat));
  }

  stream = stream
    .pipe(gulpIf(api.isProduction(), sourcemaps.init()))
    .pipe(gulpIf(api.isProduction(), terser(api.projectOptions.terser)))
    .pipe(gulpIf(api.isProduction(), sourcemaps.write('.')))
    .pipe(gulp.dest(entry.dest))
  ;

  return stream;
}
