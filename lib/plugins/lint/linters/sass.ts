import chalk from 'chalk';
import { dirname } from 'path';
import stylelintFormatter from 'stylelint-formatter-pretty';
import API from '../../../API';
import { isPackageInstalled } from '../../../utils/package';

export default (api: API, args: CLIArgs, files: string[]): Promise<void> => {
  const config = {
    files: files.map(file => `${dirname(file)}/**/*.{scss,sass}`),
    formatter: stylelintFormatter,
    fix: !!args.fix,
  };

  return new Promise((resolve, reject) => {
    if (!isPackageInstalled('stylelint')) {
      api.logger.info('Linting Sass requires to install "stylelint" dependency.');
      return resolve();
    }

    const { lint, LinterResult } = require('stylelint');
    api.logger.log(`sass (lint) :: linting ${JSON.stringify(config.files, null, 2)}`);

    // @ts-ignore
    return lint(config).then((res: LinterResult) => {
      if (!res.errored) {
        api.logger.info('Your Sass is clean ✨');
        resolve();
        return;
      }

      console.log(res.output);
      api.logger.info(chalk`Some errors can be automatically fixed with "{blue.bold --fix}" flag`);
      reject(new Error('Your Sass is not clean, stopping.'));
    });
  });
};
