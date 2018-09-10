const log = require('fancy-log');
const { CLIEngine } = require('eslint');

module.exports = (cli, args, files) => {
  const config = {
    cwd: cli.context,
    fix: !!args.fix || false,
    extensions: ['.js', '.vue'],
  };

  const engine = new CLIEngine(config);
  const report = engine.executeOnFiles(files);
  const formatter = engine.getFormatter(args.format || 'codeframe');

  if (config.fix) {
    CLIEngine.outputFixes(report);
  }

  if (report.errorCount > 0 || report.warningCount > 0) {
    console.log(formatter(report.results));
    process.exit(1);
  } else {
    log.info('Your JS is clean ✨');
  }
};
