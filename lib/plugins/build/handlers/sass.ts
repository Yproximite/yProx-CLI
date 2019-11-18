import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import gulp from 'gulp';
import concat from 'gulp-concat';
import gulpIf from 'gulp-if';
import postcss from 'gulp-postcss';
import sass from 'gulp-sass';
import sourcemaps from 'gulp-sourcemaps';
import tildeImporter from 'node-sass-tilde-importer';
import { EntrySass } from '../../../../types/entry';
import API from '../../../API';

import { getEntryName } from '../../../utils/entry';

export default (api: API, entry: EntrySass, args: CLIArgs): Promise<any> => {
  const sassOptions = {
    importer: tildeImporter,
    ...api.projectOptions.handlers.sass,
  };

  const postcssPlugins = [autoprefixer({ ...api.projectOptions.autoprefixer })];
  if (api.isProduction()) {
    postcssPlugins.push(cssnano({ ...api.projectOptions.cssnano }));
  }

  return new Promise((resolve, reject) => {
    const destFile: string | null = entry.destFile || entry.concat || null;

    if (destFile === null) {
      return reject(new Error(`Entry "${getEntryName(entry)}" does not have destination filename. Specify it with "destFile" parameter.`));
    }

    api.logger.info(`sass :: start bundling "${getEntryName(entry)}"`);

    return gulp
      .src(entry.src[0])
      .on('error', reject)
      .pipe(concat(destFile as string))
      .pipe(gulpIf(entry.sourceMaps, sourcemaps.init()))
      .pipe(
        sass(sassOptions).on('error', function onError(error) {
          // @ts-ignore
          sass.logError.bind(this)(error);
          reject(error);
        })
      )
      .pipe(postcss(postcssPlugins))
      .pipe(gulpIf(entry.sourceMaps, sourcemaps.write('.')))
      .pipe(gulp.dest(entry.dest))
      .on('end', () => {
        api.logger.info(`sass :: finished bundling "${getEntryName(entry)}"`);
        resolve();
      });
  });
};
