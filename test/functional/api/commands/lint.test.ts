import { mockLogger, unmockLogger } from '../../../logger';
import { restoreEnv, saveEnv } from '../../../node-env';
import { createFakeEnv } from '../../fake-env';

describe('command: lint', () => {
  beforeEach(() => {
    saveEnv();
    mockLogger();
    // @ts-ignore
    console.log = jest.fn();
    // @ts-ignore
    process.exit = jest.fn();
  });
  afterEach(() => {
    restoreEnv();
    unmockLogger();
    // @ts-ignore
    console.log.mockRestore();
    // @ts-ignore
    process.exit.mockRestore();
  });

  describe('JavaScript', () => {
    it('should skip linting when ESLint is not installed', async () => {
      const { cleanup, run, installYproxCli } = await createFakeEnv({ files: 'javascript' });

      await run('yarn');
      await installYproxCli();
      const p = await run('yarn yprox-cli lint');

      expect(p.stdout).toContain('Linting JavaScript requires to install "eslint" dependency.');

      await cleanup();
    });

    it('should lint files but fails', async () => {
      const { api, writeFile, cleanup, run } = await createFakeEnv({ files: 'javascript' });

      await run('yarn add -D eslint babel-eslint');
      await writeFile(
        '.eslintrc.js',
        `
        module.exports = {
          rules: { 'no-extra-semi': 'error' },
          parser: 'babel-eslint',
          parserOptions: { ecmaVersion: 6 }
        }`
      );

      await api.executeCommand('lint');

      expect(api.logger.error).toHaveBeenCalledWith('js (lint) :: Your JavaScript is not clean, stopping.');
      expect(process.exit).toHaveBeenCalledWith(1);

      // @ts-ignore
      const eslintOutput = console.log.mock.calls[0][0];
      expect(eslintOutput).toContain('hello-world.js:1:34');
      expect(eslintOutput).toContain('Unnecessary semicolon');
      expect(eslintOutput).toContain("console.log('Hello world from!');;");

      expect(eslintOutput).toContain('es6.js:2:48');
      expect(eslintOutput).toContain('Unnecessary semicolon');
      expect(eslintOutput).toContain('console.log(`The constant value: ${constant}`);;');

      expect(eslintOutput).toContain('2 errors found.');
      expect(eslintOutput).toContain('2 errors potentially fixable with the `--fix` option.');

      await cleanup();
    });

    it('should lint and fix linting issues', async () => {
      const { api, readFile, writeFile, cleanup, run } = await createFakeEnv({ files: 'javascript' });

      await run('yarn add -D eslint babel-eslint');
      await writeFile(
        '.eslintrc.js',
        `
        module.exports = {
          rules: { 'no-extra-semi': 'error' },
          parser: 'babel-eslint',
          parserOptions: { ecmaVersion: 6 }
        }`
      );

      const fileES6BeforeLint = await readFile('src/es6.js');
      expect(fileES6BeforeLint).toMatchSnapshot('src/es6.js before linting');

      const fileHelloWorldBeforeLint = await readFile('src/hello-world.js');
      expect(fileHelloWorldBeforeLint).toMatchSnapshot('src/hello-world.js before linting');

      await api.executeCommand('lint', { fix: true });
      expect(api.logger.info).toHaveBeenCalledWith('Your JavaScript is clean ✨');

      const fileES6AfterLint = await readFile('src/es6.js');
      expect(fileES6AfterLint).toMatchSnapshot('src/es6.js after linting');
      expect(fileES6AfterLint).not.toEqual(fileES6BeforeLint);

      const fileHelloWorldAfterLint = await readFile('src/hello-world.js');
      expect(fileHelloWorldAfterLint).toMatchSnapshot('src/hello-world.js after linting');
      expect(fileHelloWorldAfterLint).not.toEqual(fileHelloWorldBeforeLint);

      // To be sure
      await api.executeCommand('lint');
      expect(api.logger.info).toHaveBeenCalledWith('Your JavaScript is clean ✨');

      await cleanup();
    });

    it('should lint files and fails because of max-warnings arg', async () => {
      const { api, writeFile, cleanup, run } = await createFakeEnv({ files: 'javascript' });

      await run('yarn add -D eslint babel-eslint');
      await writeFile(
        '.eslintrc.js',
        `
        module.exports = {
          rules: { 'no-extra-semi': 'warn' },
          parser: require.resolve('babel-eslint'),
          parserOptions: { ecmaVersion: 6 }
        }`
      );

      await api.executeCommand('lint');
      expect(api.logger.info).toHaveBeenCalledWith('Your JavaScript is clean ✨');
      expect(process.exit).not.toHaveBeenCalled();

      // Will fails because we have 2 warnings
      await api.executeCommand('lint', { 'max-warnings': 1 });
      expect(api.logger.error).toHaveBeenCalledWith('js (lint) :: Your JavaScript is not clean, stopping.');
      expect(process.exit).toHaveBeenCalledWith(1);

      // @ts-ignore
      const eslintOutput = console.log.mock.calls[0][0];

      expect(eslintOutput).toContain('Unnecessary semicolon');
      expect(eslintOutput).toContain('hello-world.js:1:34');
      expect(eslintOutput).toContain("console.log('Hello world from!');;");

      expect(eslintOutput).toContain('Unnecessary semicolon');
      expect(eslintOutput).toContain('es6.js:2:48');
      expect(eslintOutput).toContain('console.log(`The constant value: ${constant}`);;');

      expect(eslintOutput).toContain('2 warnings found.');
      expect(eslintOutput).toContain('2 warnings potentially fixable with the `--fix` option.');

      await cleanup();
    });
  });

  describe('Vue', () => {
    it('should skip linting when ESLint is not installed', async () => {
      const { cleanup, run, installYproxCli } = await createFakeEnv({ files: 'vue' });

      await run('yarn');
      await installYproxCli();
      const p = await run('yarn yprox-cli lint');

      expect(p.stdout).toContain('Linting JavaScript requires to install "eslint" dependency.');

      await cleanup();
    });

    it('should lint files but fails', async () => {
      const { api, writeFile, cleanup, run } = await createFakeEnv({ files: 'vue' });

      await run('yarn');
      await run('yarn add -D eslint babel-eslint eslint-plugin-vue');
      await writeFile(
        '.eslintrc.js',
        `
        module.exports = {
          extends: [ 'plugin:vue/recommended' ],
          parserOptions: { parser: 'babel-eslint', ecmaVersion: 6 },
          rules: { 'no-extra-semi': 'error' },
        }`
      );

      await api.executeCommand('lint');

      expect(api.logger.error).toHaveBeenCalledWith('rollup (lint) :: Your JavaScript is not clean, stopping.');
      expect(process.exit).toHaveBeenCalledWith(1);

      // @ts-ignore
      const eslintOutput = console.log.mock.calls[0][0];
      expect(eslintOutput).toContain('Button.vue:2:11');
      expect(eslintOutput).toContain("'@click' should be on a new line");

      expect(eslintOutput).toContain('Button.vue:2:34');
      expect(eslintOutput).toContain('Expected no line breaks before closing bracket, but 1 line break found');

      expect(eslintOutput).toContain('Button.vue:16:3');
      expect(eslintOutput).toContain('The "props" property should be above the "data" property on line 11');

      expect(eslintOutput).toContain('index.js:6:37');
      expect(eslintOutput).toContain('Unnecessary semicolon');

      expect(eslintOutput).toContain('1 error and 3 warnings found.');
      expect(eslintOutput).toContain('1 error and 3 warnings potentially fixable with the `--fix` option.');

      await cleanup();
    });

    it('should fix linting issues', async () => {
      const { api, readFile, writeFile, cleanup, run } = await createFakeEnv({ files: 'vue' });

      await run('yarn');
      await run('yarn add -D eslint babel-eslint eslint-plugin-vue');
      await writeFile(
        '.eslintrc.js',
        `
        module.exports = {
          extends: [ 'plugin:vue/recommended' ],
          parserOptions: { parser: 'babel-eslint', ecmaVersion: 6 },
          rules: { 'no-extra-semi': 'error' },
        }`
      );

      const fileButtonBeforeLint = await readFile('src/button/Button.vue');
      expect(fileButtonBeforeLint).toMatchSnapshot('src/button/Button.vue before linting');

      const fileIndexBeforeLint = await readFile('src/button/index.js');
      expect(fileIndexBeforeLint).toMatchSnapshot('src/button/index.js before linting');

      await api.executeCommand('lint', { fix: true });

      const fileButtonAfterLint = await readFile('src/button/Button.vue');
      expect(fileButtonAfterLint).toMatchSnapshot('src/button/Button.vue after linting');
      expect(fileButtonAfterLint).not.toEqual(fileButtonBeforeLint);

      const fileIndexAfterLint = await readFile('src/button/index.js');
      expect(fileIndexAfterLint).toMatchSnapshot('src/button/index.js after linting');
      expect(fileIndexAfterLint).not.toEqual(fileIndexBeforeLint);

      // To be sure
      await api.executeCommand('lint');
      expect(api.logger.info).toHaveBeenCalledWith('Your JavaScript is clean ✨');

      await cleanup();
    });
  });

  describe('CSS & Sass', () => {
    it('should skip linting when Stylelint is not installed', async () => {
      const { cleanup, run, installYproxCli } = await createFakeEnv({ files: 'css' });

      await run('yarn install');
      await installYproxCli();

      const { stdout } = await run('yarn yprox-cli lint');

      expect(stdout).toContain('Linting Sass requires to install "stylelint" dependency.');
      expect(stdout).toContain('Linting CSS requires to install "stylelint" dependency.');

      await cleanup();
    });

    it('should lint files but fails', async () => {
      const { api, cleanup, run, writeFile } = await createFakeEnv({ files: 'css' });

      await run('yarn');
      await run('yarn add -D stylelint');
      await writeFile('.stylelintrc', '{ "rules": { "no-extra-semicolons": true } }');

      await api.executeCommand('lint');

      expect(process.exit).toHaveBeenCalledWith(1);
      // @ts-ignore
      expect(api.logger.error.mock.calls[0][0]).toMatch(/Your (CSS|Sass) is not clean, stopping\./);
      // @ts-ignore
      expect(console.log.mock.calls[0][0]).toContain('Unexpected extra semicolon');

      await cleanup();
    });

    it('should fix linting issues', async () => {
      const { api, cleanup, run, readFile, writeFile } = await createFakeEnv({ files: 'css' });

      await run('yarn');
      await run('yarn add -D stylelint');
      await writeFile('.stylelintrc', '{ "rules": { "no-extra-semicolons": true } }');

      const fileBootstrapGridBeforeLint = await readFile('src/bootstrap-grid.scss');
      expect(fileBootstrapGridBeforeLint).toMatchSnapshot('bootstrap-grid.scss before linting');

      const fileStyleBeforeLint = await readFile('src/style.css');
      expect(fileStyleBeforeLint).toMatchSnapshot('style.css before linting');

      await api.executeCommand('lint', { fix: true });
      expect(api.logger.info).toHaveBeenCalledWith('Your CSS is clean ✨');
      expect(api.logger.info).toHaveBeenCalledWith('Your Sass is clean ✨');

      const fileBootstrapGridAfterLint = await readFile('src/bootstrap-grid.scss');
      expect(fileBootstrapGridAfterLint).toMatchSnapshot('src/button/Button.vue after linting');
      expect(fileBootstrapGridAfterLint).not.toEqual(fileBootstrapGridBeforeLint);

      const fileStyleAfterLint = await readFile('src/style.css');
      expect(fileStyleAfterLint).toMatchSnapshot('src/button/index.js after linting');
      expect(fileStyleAfterLint).not.toEqual(fileStyleBeforeLint);

      // To be sure
      await api.executeCommand('lint');
      expect(api.logger.info).toHaveBeenCalledWith('Your CSS is clean ✨');
      expect(api.logger.info).toHaveBeenCalledWith('Your Sass is clean ✨');

      await cleanup();
    });
  });
});
