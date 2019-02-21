import { readFixture } from '../../../fixtures';
import { createFakeEnv } from '../../fake-env';

const files = {
  'package.json': readFixture('modern-project/package.json'),
  'yarn.lock': readFixture('modern-project/yarn.lock'),
  '.eslintignore': readFixture('modern-project/.eslintignore'),
  '.eslintrc': readFixture('modern-project/.eslintrc'),
  '.stylelintrc': readFixture('modern-project/.stylelintrc'),
  // rollup
  'src/components/button/Button.vue': readFixture('modern-project/src/components/button/Button.vue'),
  'src/components/button/index.js': readFixture('modern-project/src/components/button/index.js'),
  // js
  'src/js/bar.js': readFixture('modern-project/src/js/bar.js'),
  'src/js/foo.js': readFixture('modern-project/src/js/foo.js'),
  // images
  'src/images/guts-white-hair.png': readFixture('modern-project/src/images/guts-white-hair.png', null),
  'src/images/jax.jpg': readFixture('modern-project/src/images/jax.jpg', null),
  'src/images/golfer.gif': readFixture('modern-project/src/images/golfer.gif', null),
  'src/images/uk.svg': readFixture('modern-project/src/images/uk.svg', null),
};

describe('command: lint', () => {
  let oldEnv = process.env;
  beforeEach(() => {
    oldEnv = process.env;
    console.log = jest.fn();
    console.info = jest.fn();
    console.error = jest.fn();
    // @ts-ignore
    process.exit = jest.fn();
  });
  afterEach(() => {
    process.env = oldEnv;
    // @ts-ignore
    console.log.mockRestore();
    // @ts-ignore
    console.info.mockRestore();
    // @ts-ignore
    console.error.mockRestore();
    // @ts-ignore
    process.exit.mockRestore();
  });

  describe('lint (but not fix)', () => {
    it('should lint entries and fails', async () => {
      const { api, run, writeFile, cleanup } = await createFakeEnv({ files });

      await run('yarn install --frozen-lockfile');
      await api.executeCommand('lint');

      // The first entry handled by yprox-cli is a `rollup` entry.
      // Since we lint files grouped by handlers, it means that we are linting `rollup` files first
      expect(console.error).toHaveBeenCalledWith('[08:30:00] error :: rollup (lint) :: Your JavaScript is not clean, stopping.');
      expect(process.exit).toHaveBeenCalledWith(1);

      // But if we fix the incriminated file...
      await writeFile('src/components/button/index.js', "console.log('ESLint will not fails here.')");
      await api.executeCommand('lint');

      // Then it's another linter which fails
      expect(console.error).toHaveBeenCalledWith('[08:30:00] error :: js (lint) :: Your JavaScript is not clean, stopping.');
      expect(process.exit).toHaveBeenCalledWith(1);

      await cleanup();
    }, 10000);

    it('should lint Rollup entries only and fails', async () => {
      const { api, run, cleanup } = await createFakeEnv({ files });

      await run('yarn install --frozen-lockfile');
      await api.executeCommand('lint', {
        'filter:handler': 'rollup',
      });

      expect(console.error).toHaveBeenCalledWith('[08:30:00] error :: rollup (lint) :: Your JavaScript is not clean, stopping.');
      expect(process.exit).toHaveBeenCalledWith(1);

      await cleanup();
    }, 10000);

    it('should lint JS entries only and fails', async () => {
      const { api, run, cleanup } = await createFakeEnv({ files });

      await run('yarn install --frozen-lockfile');
      await api.executeCommand('lint', {
        'filter:handler': 'js',
      });

      expect(console.error).toHaveBeenCalledWith('[08:30:00] error :: js (lint) :: Your JavaScript is not clean, stopping.');
      expect(process.exit).toHaveBeenCalledWith(1);

      await cleanup();
    }, 10000);
  });

  describe('lint (and fix)', () => {
    it('should lint and fix entries', async () => {
      const { api, run, cleanup } = await createFakeEnv({ files });

      await run('yarn install --frozen-lockfile');
      await api.executeCommand('lint', {
        fix: true,
      });

      expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: Your JavaScript is clean ✨');
      expect(console.error).not.toHaveBeenCalledWith('[08:30:00] error :: rollup (lint) :: Your JavaScript is not clean, stopping.');
      expect(process.exit).not.toHaveBeenCalledWith(1);

      await cleanup();
    }, 10000);

    it('should lint and fix Rollup entries only', async () => {
      const { api, run, cleanup, readFile } = await createFakeEnv({ files });

      const fileContent = await readFile('src/components/button/index.js');
      expect(fileContent).toMatchSnapshot('button/index.js before lint');

      await run('yarn install --frozen-lockfile');
      await api.executeCommand('lint', {
        'filter:handler': 'rollup',
        fix: true,
      });

      expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: Your JavaScript is clean ✨');
      expect(console.error).not.toHaveBeenCalledWith('[08:30:00] error :: rollup (lint) :: Your JavaScript is not clean, stopping.');
      expect(process.exit).not.toHaveBeenCalledWith(1);

      const newFileContent = await readFile('src/components/button/index.js');
      expect(newFileContent).toMatchSnapshot('button/index.js after lint');
      expect(fileContent).not.toBe(newFileContent);

      await cleanup();
    }, 10000);

    it('should lint and fix JS entries only', async () => {
      const { api, run, cleanup, readFile } = await createFakeEnv({ files });

      const fileContent = await readFile('src/js/bar.js');
      expect(fileContent).toMatchSnapshot('js/bar.js before lint');

      await run('yarn install --frozen-lockfile');
      await api.executeCommand('lint', {
        'filter:handler': 'js',
        fix: true,
      });

      expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: Your JavaScript is clean ✨');
      expect(console.error).not.toHaveBeenCalledWith('[08:30:00] error :: js (lint) :: Your JavaScript is not clean, stopping.');
      expect(process.exit).not.toHaveBeenCalledWith(1);

      const newFileContent = await readFile('src/js/bar.js');
      expect(newFileContent).toMatchSnapshot('js/bar.js after lint');
      expect(fileContent).not.toBe(newFileContent);

      await cleanup();
    }, 10000);
  });
});
