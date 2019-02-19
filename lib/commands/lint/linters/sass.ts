import { dirname } from 'path';
import stylelintFormatter from 'stylelint-formatter-pretty';
import API from '../../../API';
import { isPackageInstalled } from '../../../utils/package';

export default (api: API, args: CLIArgs, files: string[]): Promise<any> => {
  const config = {
    files: files.map(file => `${dirname(file)}/**/*.{scss,sass}`),
    formatter: stylelintFormatter,
    fix: !!args.fix,
  };

  return new Promise((resolve, reject) => {
    if (!isPackageInstalled('stylelint', api)) {
      api.logger.info('Linting Sass requires to install "stylelint" dependency.');
      return resolve();
    }

    const { lint, LinterResult } = require('stylelint');
    api.logger.log(`sass (lint) :: linting ${JSON.stringify(config.files, null, 2)}`);

    // @ts-ignore
    lint(config).then((res: LinterResult) => {
      if (!res.errored) {
        api.logger.info('Your Sass is clean ✨');
        return resolve();
      }

      console.log(res.output);
      api.logger.info('Some errors can be automatically fixed with "\x1b[1;34m--fix\x1b[0m" flag');
      reject(new Error('Your Sass is not clean, stopping.'));
    });
  });
};
