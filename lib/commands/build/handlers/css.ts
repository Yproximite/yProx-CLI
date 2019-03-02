import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import gulp from 'gulp';
import concat from 'gulp-concat';
import gulpIf from 'gulp-if';
import postcss from 'gulp-postcss';
import sourcemaps from 'gulp-sourcemaps';
import { EntryCSS } from '../../../../types/entry';
import API from '../../../API';
import { getEntryName } from '../../../utils/entry';

export default (api: API, entry: EntryCSS, args: CLIArgs): Promise<any> => {
  const postcssPlugins = [autoprefixer({ ...api.projectOptions.autoprefixer })];

  if (api.isProduction()) {
    postcssPlugins.push(cssnano({ ...api.projectOptions.cssnano }));
  }

  return new Promise((resolve, reject) => {
    api.logger.info(`css :: start bundling "${getEntryName(entry)}"`);

    return gulp
      .src(entry.src)
      .on('error', reject)
      .pipe(gulpIf(!!entry.concat, concat(entry.concat as string)))
      .pipe(gulpIf(api.isProduction(), sourcemaps.init()))
      .pipe(postcss(postcssPlugins))
      .pipe(gulpIf(api.isProduction(), sourcemaps.write('.')))
      .pipe(gulp.dest(entry.dest))
      .on('end', () => {
        api.logger.info(`css :: finished bundling "${getEntryName(entry)}"`);
        resolve();
      });
  });
};
