import { dirname } from 'path';
import stylelint, { LinterResult } from 'stylelint';
import stylelintFormatter from 'stylelint-formatter-pretty';
import API from '../../../API';

export default (api: API, args: CLIArgs, files: string[]) => {
  const config = {
    files: files.map(file => `${dirname(file)}/**/*.{scss,sass}`),
    formatter: stylelintFormatter,
    fix: !!args.fix,
  };

  api.logger.log(`sass (lint) :: linting ${JSON.stringify(config.files, null, 2)}`);

  // @ts-ignore
  return stylelint.lint(config)
    .then((res: LinterResult) => {
      if (!res.errored) {
        return api.logger.info('Your Sass is clean ✨');
      }

      console.log(res.output);
      api.logger.info(
        'Some errors can be automatically fixed with "\x1b[1;34m--fix\x1b[0m\" flag',
      );
      throw new Error('Your Sass is not clean, stopping.');
    });
};
