import { restoreEnv, saveEnv } from '../../../node-env';
import { mockLogger, unmockLogger } from '../../../logger';
import { createFakeEnv } from '../../fake-env';

xdescribe('command: lint', () => {
  beforeEach(() => {
    saveEnv();
    mockLogger();
    // @ts-ignore
    process.exit = jest.fn();
  });
  afterEach(() => {
    restoreEnv();
    unmockLogger();
    // @ts-ignore
    process.exit.mockRestore();
  });

  describe('lint, but not fix linting issues', () => {
    it('should lint entries and fails', async () => {
      const { api, run, cleanup } = await createFakeEnv({ files: 'js' });

      await run('yarn install eslint');
      await api.executeCommand('lint');

      // The first entry handled by yprox-cli is a `rollup` entry.
      // Since we lint files grouped by handlers, it means that we are linting `rollup` files first
      expect(api.logger.error).toHaveBeenCalledWith('js (lint) :: Your JavaScript is not clean, stopping.');
      expect(process.exit).toHaveBeenCalledWith(1);

      await cleanup();
    }, 10000);

    it('should lint Rollup entries only and fails', async () => {
      const { api, run, cleanup } = await createFakeEnv({ files: 'js' });

      await run('yarn install --frozen-lockfile');
      await api.executeCommand('lint', {
        'filter:handler': 'rollup',
      });

      expect(api.logger.error).toHaveBeenCalledWith('js (lint) :: Your JavaScript is not clean, stopping.');
      expect(process.exit).toHaveBeenCalledWith(1);

      await cleanup();
    }, 10000);
  });

  describe('lint (and fix)', () => {
    it('should lint and fix entries', async () => {
      const { api, run, cleanup } = await createFakeEnv({ files: 'js' });

      await run('yarn install --frozen-lockfile');
      await api.executeCommand('lint', {
        fix: true,
      });

      expect(api.logger.info).toHaveBeenCalledWith('Your JavaScript is clean ✨');
      expect(api.logger.error).not.toHaveBeenCalledWith('rollup (lint) :: Your JavaScript is not clean, stopping.');
      expect(process.exit).not.toHaveBeenCalledWith(1);

      await cleanup();
    }, 10000);

    it('should lint and fix Rollup entries only', async () => {
      const { api, run, cleanup, readFile } = await createFakeEnv({ files: 'js' });

      const fileContent = await readFile('src/components/button/index.js');
      expect(fileContent).toMatchSnapshot('button/index.js before lint');

      await run('yarn install --frozen-lockfile');
      await api.executeCommand('lint', {
        'filter:handler': 'rollup',
        fix: true,
      });

      expect(api.logger.info).toHaveBeenCalledWith('Your JavaScript is clean ✨');
      expect(api.logger.error).not.toHaveBeenCalledWith('rollup (lint) :: Your JavaScript is not clean, stopping.');
      expect(process.exit).not.toHaveBeenCalledWith(1);

      const newFileContent = await readFile('src/components/button/index.js');
      expect(newFileContent).toMatchSnapshot('button/index.js after lint');
      expect(fileContent).not.toBe(newFileContent);

      await cleanup();
    }, 10000);
  });
});
