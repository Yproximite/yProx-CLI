import stylelint, { LinterResult } from 'stylelint';
import stylelintFormatter from 'stylelint-formatter-pretty';
import API from '../../../API';

export default (api: API, args: CLIArgs, files: string[]): Promise<any> => {
  const config = {
    files,
    formatter: stylelintFormatter,
    fix: !!args.fix,
  };

  api.logger.log(`css (lint) :: linting ${JSON.stringify(config.files, null, 2)}`);

  return new Promise((resolve, reject) => {
    // @ts-ignore
    stylelint.lint(config).then((res: LinterResult) => {
      if (!res.errored) {
        api.logger.info('Your CSS is clean ✨');
        return resolve();
      }

      console.log(res.output);
      api.logger.info('Some errors can be automatically fixed with "\x1b[1;34m--fix\x1b[0m" flag');
      reject(new Error('Your CSS is not clean, stopping.'));
    });
  });
};
