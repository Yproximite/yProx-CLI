import { CLIEngine } from 'eslint';
import API from '../../../API';

export default (api: API, args: CLIArgs, files: string[]): Promise<any> => {
  const config = {
    cwd: api.context,
    fix: !!args.fix || false,
    extensions: ['.js', '.vue'],
  };

  api.logger.log(`js (lint) :: linting ${JSON.stringify(files, null, 2)}`);

  return new Promise((resolve, reject) => {
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
