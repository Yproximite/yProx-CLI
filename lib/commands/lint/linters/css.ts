import chalk from 'chalk';
import stylelintFormatter from 'stylelint-formatter-pretty';
import API from '../../../API';
import { isPackageInstalled } from '../../../utils/package';

export default (api: API, args: CLIArgs, files: string[]): Promise<any> => {
  const config = {
    files,
    formatter: stylelintFormatter,
    fix: !!args.fix,
  };

  return new Promise((resolve, reject) => {
    if (!isPackageInstalled('stylelint', api)) {
      api.logger.info('Linting CSS requires to install "stylelint" dependency.');
      return resolve();
    }

    const { lint, LinterResult } = require('stylelint');
    api.logger.log(`css (lint) :: linting ${JSON.stringify(config.files, null, 2)}`);

    // @ts-ignore
    lint(config).then((res: LinterResult) => {
      if (!res.errored) {
        api.logger.info('Your CSS is clean ✨');
        return resolve();
      }

      console.log(res.output);
      api.logger.info(chalk`Some errors can be automatically fixed with "{blue.bold --fix}" flag`);
      reject(new Error('Your CSS is not clean, stopping.'));
    });
  });
};
