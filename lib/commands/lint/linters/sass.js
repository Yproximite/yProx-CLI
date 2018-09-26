const { dirname } = require('path');
const stylelint = require('stylelint');
const stylelintFormatter = require('stylelint-formatter-pretty');

module.exports = (cli, args, files) => {
  const config = {
    files: files.map(file => `${dirname(file)}/**/*.{scss,sass}`),
    formatter: stylelintFormatter,
    fix: !!args.fix,
  };

  cli.logger.log(`sass (lint) :: linting ${JSON.stringify(config.files, null, 2)}`);

  stylelint.lint(config)
    .then(res => {
      if (!res.errored) {
        cli.logger.info('Your Sass is clean ✨');
        return;
      }

      console.log(res.output);
      cli.logger.info('Some errors can be automatically fixed with "\x1b[1;34m--fix\x1b[0m\" flag 🙂');
      process.exit(1);
    })
    .catch(err => {
      cli.logger.error(err);
    });
};
