import API from '../../../API';
import { isPackageInstalled } from '../../../utils/package';

export default (api: API, args: CLIArgs, files: string[]): Promise<any> => {
  const config = {
    cwd: api.context,
    fix: !!args.fix || false,
    extensions: api.projectOptions.eslint.extensions,
  };

  return new Promise((resolve, reject) => {
    if (!isPackageInstalled('eslint', api)) {
      api.logger.info('Linting JavaScript requires to install "eslint" dependency.');
      return resolve();
    }

    const { CLIEngine } = require('eslint');
    api.logger.log(`js (lint) :: linting ${JSON.stringify(files, null, 2)}`);

    const engine = new CLIEngine(config);
    const report = engine.executeOnFiles(files);
    const formatter = engine.getFormatter('codeframe');

    if (config.fix) {
      CLIEngine.outputFixes(report);
    }

    if (report.errorCount > 0 || report.warningCount > 0) {
      console.log(formatter(report.results));
      reject(new Error('Your JavaScript is not clean, stopping.'));
    } else {
      api.logger.info('Your JavaScript is clean ✨');
      resolve();
    }
  });
};
