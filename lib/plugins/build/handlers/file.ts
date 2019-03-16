import gulp from 'gulp';
import { EntryFile } from '../../../../types/entry';
import API from '../../../API';
import { getEntryName } from '../../../utils/entry';

export default (api: API, entry: EntryFile, args: CLIArgs): Promise<any> => {
  return new Promise((resolve, reject) => {
    api.logger.info(`file :: start copying "${getEntryName(entry)}"`);

    return gulp
      .src(entry.src)
      .on('error', reject)
      .pipe(gulp.dest(entry.dest))
      .on('end', () => {
        api.logger.info(`file :: done copying "${getEntryName(entry)}"`);
        resolve();
      });
  });
};
