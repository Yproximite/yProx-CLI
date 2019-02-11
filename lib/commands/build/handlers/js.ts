import gulp from 'gulp';
import concat from 'gulp-concat';
import gulpIf from 'gulp-if';
import sourcemaps from 'gulp-sourcemaps';
import terser from 'gulp-terser';
import API from '../../../API';
import { buble } from '../../../plugins/gulp-buble';
import { getEntryName } from '../../../utils/entry';

export default (api: API, entry: EntryCSS, args: CLIArgs): Promise<any> => {
  return new Promise((resolve, reject) => {
    api.logger.info(`js :: start bundling "${getEntryName(entry)}"`);

    return gulp
      .src(entry.src)
      .on('error', reject)
      .pipe(gulpIf(!!entry.concat, concat(entry.concat as string)))
      .pipe(gulpIf(api.isProduction(), sourcemaps.init()))
      .pipe(gulpIf(typeof api.projectOptions.buble === 'object', buble({ ...api.projectOptions.buble })))
      .pipe(gulpIf(api.isProduction(), terser({ ...api.projectOptions.terser })))
      .pipe(gulpIf(api.isProduction(), sourcemaps.write('.')))
      .pipe(gulp.dest(entry.dest))
      .on('end', () => {
        api.logger.info(`js :: finished bundling "${getEntryName(entry)}"`);
        resolve();
      });
  });
};
