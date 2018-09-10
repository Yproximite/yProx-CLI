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

  console.log(formatter(report.results));

  if (report.errorCount > 0 || report.warningCount > 0) {
    process.exit(1);
  }
};
