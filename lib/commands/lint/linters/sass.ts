import { dirname } from 'path';
import stylelint, { FormatterType } from 'stylelint';
import stylelintFormatter from 'stylelint-formatter-pretty';

export default (api, args, files) => {
  const config = {
    files: files.map(file => `${dirname(file)}/**/*.{scss,sass}`),
    formatter: stylelintFormatter,
    fix: !!args.fix,
  };

  api.logger.log(`sass (lint) :: linting ${JSON.stringify(config.files, null, 2)}`);

  return stylelint.lint(config)
    .then(res => {
      if (!res.errored) {
        return api.logger.info('Your Sass is clean ✨');
      }

      console.log(res.output);
      api.logger.info('Some errors can be automatically fixed with "\x1b[1;34m--fix\x1b[0m\" flag 🙂');
      throw new Error('Your Sass is not clean, stopping.');
    });
}
