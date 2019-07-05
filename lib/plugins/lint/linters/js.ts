import fs from 'fs';
import path from 'path';
import API from '../../../API';
import { isPackageInstalled } from '../../../utils/package';

export default (api: API, args: CLIArgs, files: string[]): Promise<void> => {
  const config = {
    cwd: api.context,
    fix: !!args.fix || false,
    extensions: api.projectOptions.eslint.extensions,
  };

  return new Promise((resolve, reject) => {
    if (!isPackageInstalled('eslint')) {
      api.logger.info('Linting JavaScript requires to install "eslint" dependency.');
      resolve();
      return;
    }

    // import ESLint from end-user node_modules.
    // `require('eslint')` should simply works too, but not in functional tests
    // when requiring a plugin (`require.resolve('eslint-plugin-vue)`), it does not work.
    // We have too many weird issues because it use ESLint from yProx-CLI's node_modules,
    // but `eslint-plugin-vue` is from end-user directory... :(
    let eslintPath = 'node_modules/eslint';
    let eslintPathResolved = api.resolve(eslintPath);
    // Check in parent directory if we don't directly find ESLint (required for yProx apps)
    let maxTries = 15;
    while (!fs.existsSync(eslintPathResolved)) {
      maxTries -= 1;
      eslintPath = path.join('..', eslintPath);
      eslintPathResolved = api.resolve(eslintPath);

      if (maxTries === 0) {
        throw new Error('Unable to locate ESLint.');
      }
    }

    const { CLIEngine } = require(eslintPathResolved);

    api.logger.log(`js (lint) :: linting ${JSON.stringify(files, null, 2)}`);

    const engine = new CLIEngine(config);
    const report = engine.executeOnFiles(files);
    const formatter = engine.getFormatter('codeframe');

    if (config.fix) {
      CLIEngine.outputFixes(report);
    }

    const showErrors = report.errorCount > 0;
    const showWarnings = typeof args['max-warnings'] === 'number' && args['max-warnings'] > -1 && report.warningCount > args['max-warnings'];
    if (showErrors || showWarnings) {
      console.log(formatter(report.results));
      reject(new Error('Your JavaScript is not clean, stopping.'));
      return;
    }

    api.logger.info('Your JavaScript is clean ✨');
    resolve();
  });
};
