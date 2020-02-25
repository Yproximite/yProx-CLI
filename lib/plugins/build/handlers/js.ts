import gulp from 'gulp';
import concat from 'gulp-concat';
import gulpIf from 'gulp-if';
import sourcemaps from 'gulp-sourcemaps';
import terser from 'gulp-terser';
import babel from 'gulp-babel';
import { EntryJS } from '../../../../types/entry';
import API from '../../../API';
import { getEntryName } from '../../../utils/entry';

export default (api: API, entry: EntryJS, args: CLIArgs): Promise<any> => {
  return new Promise((resolve, reject) => {
    api.logger.info(`js :: start bundling "${getEntryName(entry)}"`);

    return gulp
      .src(entry.src)
      .on('error', reject)
      .pipe(gulpIf(!!entry.concat, concat(entry.concat as string)))
      .pipe(gulpIf(entry.sourceMaps, sourcemaps.init()))
      .pipe(gulpIf(api.projectOptions.babel, babel()))
      .pipe(gulpIf(api.isProduction(), terser({ ...api.projectOptions.terser })))
      .pipe(gulpIf(entry.sourceMaps, sourcemaps.write('.')))
      .pipe(gulp.dest(entry.dest))
      .on('end', () => {
        api.logger.info(`js :: finished bundling "${getEntryName(entry)}"`);
        resolve();
      });
  });
};
