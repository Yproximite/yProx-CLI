import gulp from 'gulp';
import imagemin from 'gulp-imagemin';
import API from '../../../API';
import { getEntryName } from '../../../utils/entry';

export default (api: API, entry: EntryCSS, args: CLIArgs): Promise<any> => {
  const imageminPlugins = [
    imagemin.gifsicle(api.projectOptions.gifsicle),
    imagemin.jpegtran(api.projectOptions.jpegtran),
    imagemin.optipng(api.projectOptions.optipng),
    imagemin.svgo(api.projectOptions.svgo),
  ];

  return new Promise((resolve, reject) => {
    api.logger.info(`image :: start optimizing "${getEntryName(entry)}"`);

    return gulp
      .src(entry.src)
      .on('error', reject)
      .pipe(imagemin(imageminPlugins))
      .pipe(gulp.dest(entry.dest))
      .on('end', () => {
        api.logger.info(`image :: done optimizing "${getEntryName(entry)}"`);
        resolve();
      });
  });
};
