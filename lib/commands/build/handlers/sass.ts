import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import gulp from 'gulp';
import concat from 'gulp-concat';
import gulpIf from 'gulp-if';
import postcss from 'gulp-postcss';
import sass from 'gulp-sass';
import sourcemaps from 'gulp-sourcemaps';
import tildeImporter from 'node-sass-tilde-importer';
import API from '../../../API';

import { getEntryName } from '../../../utils/entry';

export default (api: API, entry: EntrySass, args: CLIArgs) => {
  const sassOptions = Object.assign({
    importer: tildeImporter,
  }, api.projectOptions.handlers.sass);

  const postcssPlugins = [
    autoprefixer(api.projectOptions.autoprefixer),
  ];

  if (api.isProduction()) {
    postcssPlugins.push(cssnano(api.projectOptions.cssnano));
  }

  const src = entry.src[0];
  api.logger.info(`sass :: start bundling "${getEntryName(entry)}"`);

  let stream = gulp.src(src)
    .on('end', () => api.logger.info(`sass :: finished bundle "${getEntryName(entry)}"`));

  if (entry.concat) {
    stream = stream.pipe(concat(entry.concat));
  }

  return stream.pipe(gulpIf(api.isProduction(), sourcemaps.init()))
    // @ts-ignore
    .pipe(sass(sassOptions).on('error', sass.logError))
    .pipe(postcss(postcssPlugins))
    .pipe(gulpIf(api.isProduction(), sourcemaps.write('.')))
    .pipe(gulp.dest(entry.dest));
};
