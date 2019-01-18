import { Transform } from 'readable-stream';
import applySourceMap from 'vinyl-sourcemaps-apply';
import PluginError from 'plugin-error';
import { transform as transformBuble } from 'buble';
import { ProjectOptions } from '../../../types';

export const buble = (options: ProjectOptions['buble'] = {}) => {
  return new Transform({
    objectMode: true,
    transform(file, enc, cb) {
      if (file.isNull()) {
        cb(undefined, file);
        return;
      }
      if (file.isStream()) {
        cb(new PluginError('gulp-buble', 'Streaming not supported'));
        return;
      }

      options.file = file.path;
      options.source = file.path;
      options.includeContent = true;

      let result;
      try {
        result = transformBuble(file.contents.toString(), options);
      } catch (e) {
        cb(new PluginError('gulp-buble', e.toString()));
        return;
      }

      file.contents = new Buffer(result.code);

      if (file.sourceMap) {
        applySourceMap(file, result.map);
      }

      cb(undefined, file);
    },
  });
};
