const { CLIEngine } = require('eslint');

module.exports = (cli, args, files) => {
  const config = {
    cwd: cli.context,
    fix: !!args.fix || false,
    extensions: ['.js', '.vue'],
  };

  cli.logger.log(`js (lint) :: linting ${JSON.stringify(files, null, 2)}`);

  return new Promise((resolve, reject) => {
    const engine = new CLIEngine(config);
    const report = engine.executeOnFiles(files);
    const formatter = engine.getFormatter(args.format || 'codeframe');

    if (config.fix) {
      CLIEngine.outputFixes(report);
    }

    if (report.errorCount > 0 || report.warningCount > 0) {
      console.log(formatter(report.results));
      return reject(new Error('Your JS is not clean, stopping.'));
    }

    cli.logger.info('Your JS is clean ✨');
    return resolve();
  });
};
