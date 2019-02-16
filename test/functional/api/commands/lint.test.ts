import { existsSync, statSync } from 'fs';
import { createFakeEnv } from '../../fake-env';
import { readFile } from '../../read-file';

const readFixture = (filename: string, charset: string | null = 'utf8') => readFile(`${__dirname}/../../../fixtures/modern-project/${filename}`, charset);

const files = {
  'package.json': readFixture('package.json'),
  'yarn.lock': readFixture('yarn.lock'),
  '.eslintignore': readFixture('.eslintignore'),
  '.eslintrc': readFixture('.eslintrc'),
  '.stylelintrc': readFixture('.stylelintrc'),
  // rollup
  'src/components/button/Button.vue': readFixture('src/components/button/Button.vue'),
  'src/components/button/index.js': readFixture('src/components/button/index.js'),
  'src/components/button/foo.graphql': readFixture('src/components/button/foo.graphql'),
  // css
  'src/css/bar.css': readFixture('src/css/bar.css'),
  'src/css/foo.css': readFixture('src/css/foo.css'),
  // js
  'src/js/bar.js': readFixture('src/js/bar.js'),
  'src/js/foo.js': readFixture('src/js/foo.js'),
  // sass
  'src/sass/_form.scss': readFixture('src/sass/_form.scss'),
  'src/sass/style.scss': readFixture('src/sass/style.scss'),
  // files
  'src/lorem.txt': readFixture('src/lorem.txt'),
  'src/udhr.txt': readFixture('src/udhr.txt'),
  // images
  'src/images/guts-white-hair.png': readFixture('src/images/guts-white-hair.png', null),
  'src/images/jax.jpg': readFixture('src/images/jax.jpg', null),
  'src/images/golfer.gif': readFixture('src/images/golfer.gif', null),
  'src/images/uk.svg': readFixture('src/images/uk.svg', null),
};

describe('command: build', () => {
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
      const { api, run, writeInFile, cleanup } = await createFakeEnv(files);

      await run('yarn install --frozen-lockfile');
      await api.executeCommand('lint');

      // The first entry handled by yprox-cli is a `rollup` entry.
      // Since we lint files grouped by handlers, it means that we are linting `rollup` files first
      expect(console.error).toHaveBeenCalledWith('[08:30:00] error :: rollup (lint) :: Your JavaScript is not clean, stopping.');
      expect(process.exit).toHaveBeenCalledWith(1);

      // But if we fix the incriminated file...
      await writeInFile('src/components/button/index.js', "console.log('ESLint will not fails here.')");
      await api.executeCommand('lint');

      // Then it's another linter which fails
      expect(console.error).toHaveBeenCalledWith('[08:30:00] error :: js (lint) :: Your JavaScript is not clean, stopping.');
      expect(process.exit).toHaveBeenCalledWith(1);

      await cleanup();
    });

    it('should lint Rollup entries only and fails', async () => {
      const { api, run, cleanup } = await createFakeEnv(files);

      await run('yarn install --frozen-lockfile');
      await api.executeCommand('lint', {
        'filter:handler': 'rollup',
      });

      expect(console.error).toHaveBeenCalledWith('[08:30:00] error :: rollup (lint) :: Your JavaScript is not clean, stopping.');
      expect(process.exit).toHaveBeenCalledWith(1);

      await cleanup();
    });

    it('should lint JS entries only and fails', async () => {
      const { api, run, cleanup } = await createFakeEnv(files);

      await run('yarn install --frozen-lockfile');
      await api.executeCommand('lint', {
        'filter:handler': 'js',
      });

      expect(console.error).toHaveBeenCalledWith('[08:30:00] error :: js (lint) :: Your JavaScript is not clean, stopping.');
      expect(process.exit).toHaveBeenCalledWith(1);

      await cleanup();
    });

    it('should lint CSS entries only and fails', async () => {
      const { api, run, cleanup } = await createFakeEnv(files);

      await run('yarn install --frozen-lockfile');
      await api.executeCommand('lint', {
        'filter:handler': 'css',
      });

      expect(console.error).toHaveBeenCalledWith('[08:30:00] error :: css (lint) :: Your CSS is not clean, stopping.');
      expect(process.exit).toHaveBeenCalledWith(1);

      await cleanup();
    });

    it('should lint Sass entries only and fails', async () => {
      const { api, run, cleanup } = await createFakeEnv(files);

      await run('yarn install --frozen-lockfile');
      await api.executeCommand('lint', {
        'filter:handler': 'sass',
      });

      expect(console.error).toHaveBeenCalledWith('[08:30:00] error :: sass (lint) :: Your Sass is not clean, stopping.');
      expect(process.exit).toHaveBeenCalledWith(1);

      await cleanup();
    });
  });

  describe('lint (and fix)', () => {
    it('should lint and fix entries', async () => {
      const { api, run, cleanup } = await createFakeEnv(files);

      await run('yarn install --frozen-lockfile');
      await api.executeCommand('lint', {
        fix: true,
      });

      expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: Your JavaScript is clean ✨');
      expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: Your Sass is clean ✨');
      expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: Your CSS is clean ✨');
      expect(console.error).not.toHaveBeenCalledWith('[08:30:00] error :: rollup (lint) :: Your JavaScript is not clean, stopping.');
      expect(process.exit).not.toHaveBeenCalledWith(1);

      await cleanup();
    });

    it('should lint and fix Rollup entries only', async () => {
      const { api, run, cleanup } = await createFakeEnv(files);

      const fileContent = readFile(api.resolve('src/components/button/index.js'));
      expect(fileContent).toMatchSnapshot('button/index.js before lint');

      await run('yarn install --frozen-lockfile');
      await api.executeCommand('lint', {
        'filter:handler': 'rollup',
        fix: true,
      });

      expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: Your JavaScript is clean ✨');
      expect(console.error).not.toHaveBeenCalledWith('[08:30:00] error :: rollup (lint) :: Your JavaScript is not clean, stopping.');
      expect(process.exit).not.toHaveBeenCalledWith(1);

      const newFileContent = readFile(api.resolve('src/components/button/index.js'));
      expect(newFileContent).toMatchSnapshot('button/index.js after lint');
      expect(fileContent).not.toBe(newFileContent);

      await cleanup();
    });

    it('should lint and fix JS entries only', async () => {
      const { api, run, cleanup } = await createFakeEnv(files);

      const fileContent = readFile(api.resolve('src/js/bar.js'));
      expect(fileContent).toMatchSnapshot('js/bar.js before lint');

      await run('yarn install --frozen-lockfile');
      await api.executeCommand('lint', {
        'filter:handler': 'js',
        fix: true,
      });

      expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: Your JavaScript is clean ✨');
      expect(console.error).not.toHaveBeenCalledWith('[08:30:00] error :: js (lint) :: Your JavaScript is not clean, stopping.');
      expect(process.exit).not.toHaveBeenCalledWith(1);

      const newFileContent = readFile(api.resolve('src/js/bar.js'));
      expect(newFileContent).toMatchSnapshot('js/bar.js after lint');
      expect(fileContent).not.toBe(newFileContent);

      await cleanup();
    });

    it('should lint and fix CSS entries only', async () => {
      const { api, run, cleanup } = await createFakeEnv(files);

      const fileContent = readFile(api.resolve('src/css/bar.css'));
      expect(fileContent).toMatchSnapshot('css/bar.css before lint');

      await run('yarn install --frozen-lockfile');
      await api.executeCommand('lint', {
        'filter:handler': 'css',
        fix: true,
      });

      expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: Your CSS is clean ✨');
      expect(console.error).not.toHaveBeenCalledWith('[08:30:00] error :: css (lint) :: Your CSS is not clean, stopping.');
      expect(process.exit).not.toHaveBeenCalledWith(1);

      const newFileContent = readFile(api.resolve('src/css/bar.css'));
      expect(newFileContent).toMatchSnapshot('css/bar.css after lint');
      expect(fileContent).not.toBe(newFileContent);

      await cleanup();
    });

    it('should lint and fix Sass entries only', async () => {
      const { api, run, cleanup } = await createFakeEnv(files);

      const fileContent = readFile(api.resolve('src/sass/style.scss'));
      expect(fileContent).toMatchSnapshot('sass/style.scss before lint');

      await run('yarn install --frozen-lockfile');
      await api.executeCommand('lint', {
        'filter:handler': 'sass',
        fix: true,
      });

      expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: Your Sass is clean ✨');
      expect(console.error).not.toHaveBeenCalledWith('[08:30:00] error :: sass (lint) :: Your Sass is not clean, stopping.');
      expect(process.exit).not.toHaveBeenCalledWith(1);

      const newFileContent = readFile(api.resolve('src/sass/style.scss'));
      expect(newFileContent).toMatchSnapshot('sass/style.scss after lint');
      expect(fileContent).not.toBe(newFileContent);
      expect(fileContent).not.toBe(newFileContent);

      await cleanup();
    });
  });
});
