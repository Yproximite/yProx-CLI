import chalk from 'chalk';
import { restoreEnv, saveEnv } from '../../../node-env';
import { mockLogger, unmockLogger } from '../../../logger';
import { createFakeEnv } from '../../fake-env';

describe('command: lint', () => {
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

  describe('JavaScript', () => {
    it('should skip linting when ESLint is not installed', async () => {
      const { cleanup, run, installYproxCli } = await createFakeEnv({ files: 'javascript' });

      await installYproxCli();
      const p = await run('yarn yprox-cli lint');

      expect(p.stdout).toContain('Linting JavaScript requires to install "eslint" dependency.');

      await cleanup();
    }, 30000);

    it('should lint files but fails', async () => {
      expect.assertions(10);

      const { writeFile, cleanup, run, installYproxCli } = await createFakeEnv({ files: 'javascript' });

      await run('yarn add -D eslint babel-eslint');
      await installYproxCli();
      await writeFile(
        '.eslintrc',
        `
        {
          "rules": { "no-extra-semi": "error" },
          "parser": "babel-eslint",
          "parserOptions": { "ecmaVersion": "6" }
        }`
      );

      try {
        await run('yarn yprox-cli lint');
      } catch (e) {
        expect(e.stderr).toMatch(/Your JavaScript is not clean, stopping\./);

        expect(e.stdout).toContain('Unnecessary semicolon');
        expect(e.stdout).toContain('src/hello-world.js:1:34');
        expect(e.stdout).toContain("console.log('Hello world from!');;");

        expect(e.stdout).toContain('Unnecessary semicolon');
        expect(e.stdout).toContain('src/es6.js:2:48');
        expect(e.stdout).toContain('console.log(`The constant value: ${constant}`);;');

        expect(e.stdout).toContain('2 errors found.');
        expect(e.stdout).toContain('2 errors potentially fixable with the `--fix` option.');
        expect(e.code).toBe(1);
      }

      await cleanup();
    }, 30000);

    it('should lint and fix linting issues', async () => {
      expect.assertions(8);

      const { readFile, writeFile, cleanup, run, installYproxCli } = await createFakeEnv({ files: 'javascript' });

      await run('yarn add -D eslint babel-eslint');
      await installYproxCli();
      await writeFile(
        '.eslintrc',
        `
        {
          "rules": { "no-extra-semi": "error" },
          "parser": "babel-eslint",
          "parserOptions": { "ecmaVersion": "6" }
        }`
      );

      const fileES6BeforeLint = await readFile('src/es6.js');
      const fileHelloWorldBeforeLint = await readFile('src/hello-world.js');

      expect(fileES6BeforeLint).toMatchSnapshot('src/es6.js before linting');
      expect(fileHelloWorldBeforeLint).toMatchSnapshot('src/hello-world.js before linting');

      try {
        const p = await run('yarn yprox-cli lint --fix');
        expect(p.stdout).toContain('Your JavaScript is clean ✨');
      } catch (e) {
        expect(true).toBeFalsy();
      }

      const fileES6AfterLint = await readFile('src/es6.js');
      const fileHelloWorldAfterLint = await readFile('src/hello-world.js');

      expect(fileES6AfterLint).toMatchSnapshot('src/es6.js after linting');
      expect(fileHelloWorldAfterLint).toMatchSnapshot('src/hello-world.js after linting');

      expect(fileES6AfterLint).not.toEqual(fileES6BeforeLint);
      expect(fileHelloWorldAfterLint).not.toEqual(fileHelloWorldBeforeLint);

      try {
        const p = await run('yarn yprox-cli lint');
        expect(p.stdout).toContain('Your JavaScript is clean ✨');
      } catch (e) {
        expect(true).toBeFalsy();
      }

      await cleanup();
    }, 30000);
  });

  describe('Vue', () => {
    it('should skip linting when ESLint is not installed', async () => {
      const { cleanup, run, installYproxCli } = await createFakeEnv({ files: 'vue' });

      await run('yarn');
      await installYproxCli();
      const p = await run('yarn yprox-cli lint');

      expect(p.stdout).toContain('Linting JavaScript requires to install "eslint" dependency.');

      await cleanup();
    }, 30000);

    it('should lint files but fails', async () => {
      expect.assertions(10);

      const { writeFile, cleanup, run, installYproxCli } = await createFakeEnv({ files: 'vue' });

      await run('yarn');
      await run('yarn add -D eslint babel-eslint eslint-plugin-vue');
      await installYproxCli();
      await writeFile(
        '.eslintrc',
        `
        {
          "extends": [ 'plugin:vue/recommended' ],
          "parserOptions": { "parser": "babel-eslint", "ecmaVersion": "6" },
          "rules": { "no-extra-semi": "error" }
        }`
      );

      try {
        await run('yarn yprox-cli lint');
      } catch (e) {
        expect(e.stderr).toMatch(/Your JavaScript is not clean, stopping\./);

        expect(e.stdout).toContain('src/button/Button.vue:2:11');
        expect(e.stdout).toContain('Event "click" should be on a new line');

        expect(e.stdout).toContain('The "props" property should be above the "data" property on line 11');
        expect(e.stdout).toContain('src/button/Button.vue:16:3');

        expect(e.stdout).toContain('Unnecessary semicolon');
        expect(e.stdout).toContain('src/button/index.js:6:37');

        expect(e.stdout).toContain('1 error and 3 warnings found.');
        expect(e.stdout).toContain('1 error and 3 warnings potentially fixable with the `--fix` option.');
        expect(e.code).toBe(1);
      }

      await cleanup();
    }, 30000);

    it('should fix linting issues', async () => {
      expect.assertions(8);

      const { readFile, writeFile, cleanup, run, installYproxCli } = await createFakeEnv({ files: 'vue' });

      await run('yarn');
      await run('yarn add -D eslint babel-eslint eslint-plugin-vue');
      await installYproxCli();
      await writeFile(
        '.eslintrc',
        `
        {
          "extends": [ 'plugin:vue/recommended' ],
          "parserOptions": { "parser": "babel-eslint", "ecmaVersion": "6" },
          "rules": { "no-extra-semi": "error" }
        }`
      );

      const fileButtonBeforeLint = await readFile('src/button/Button.vue');
      const fileIndexBeforeLint = await readFile('src/button/index.js');

      expect(fileButtonBeforeLint).toMatchSnapshot('src/button/Button.vue before linting');
      expect(fileIndexBeforeLint).toMatchSnapshot('src/button/index.js before linting');

      try {
        const p = await run('yarn yprox-cli lint --fix');
        expect(p.stdout).toContain('Your JavaScript is clean ✨');
      } catch (e) {
        expect(true).toBeFalsy();
      }

      const fileButtonAfterLint = await readFile('src/button/Button.vue');
      const fileIndexAfterLint = await readFile('src/button/index.js');

      expect(fileButtonAfterLint).toMatchSnapshot('src/button/Button.vue after linting');
      expect(fileIndexAfterLint).toMatchSnapshot('src/button/index.js after linting');

      expect(fileButtonAfterLint).not.toEqual(fileButtonBeforeLint);
      expect(fileIndexAfterLint).not.toEqual(fileIndexBeforeLint);

      try {
        const p = await run('yarn yprox-cli lint');
        expect(p.stdout).toContain('Your JavaScript is clean ✨');
      } catch (e) {
        expect(true).toBeFalsy();
      }

      await cleanup();
    }, 30000);
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
    }, 30000);

    it('should lint files but fails', async () => {
      expect.assertions(3);

      const { cleanup, run, installYproxCli, writeFile, fileExists } = await createFakeEnv({ files: 'css' });

      await run('yarn install');
      await installYproxCli();
      await run('yarn add -D stylelint');
      await writeFile('.stylelintrc', '{ "rules": { "no-extra-semicolons": true } }');

      try {
        await run('yarn yprox-cli lint');
      } catch (e) {
        expect(e.stderr).toMatch(/Your (CSS|Sass) is not clean, stopping\./);
        expect(e.stdout).toContain('Unexpected extra semicolon');
        expect(e.code).toBe(1);
      }

      await cleanup();
    }, 30000);

    it('should fix linting issues', async () => {
      const { cleanup, readFile, writeFile, run, installYproxCli } = await createFakeEnv({ files: 'css' });

      await run('yarn install');
      await installYproxCli();
      await run('yarn add -D stylelint');
      await writeFile('.stylelintrc', '{ "rules": { "no-extra-semicolons": true } }');

      const fileBootstrapGridBeforeLint = await readFile('src/bootstrap-grid.scss');
      const fileStyleBeforeLint = await readFile('src/style.css');

      expect(fileBootstrapGridBeforeLint).toMatchSnapshot('bootstrap-grid.scss before linting');
      expect(fileStyleBeforeLint).toMatchSnapshot('style.css before linting');

      try {
        const p = await run('yarn yprox-cli lint --fix');
        expect(p.stdout).toContain('Your CSS is clean ✨');
        expect(p.stdout).toContain('Your Sass is clean ✨');
      } catch (e) {
        expect(true).toBeFalsy();
      }

      const fileBootstrapGridAfterLint = await readFile('src/bootstrap-grid.scss');
      const fileStyleAfterLint = await readFile('src/style.css');

      expect(fileBootstrapGridAfterLint).toMatchSnapshot('src/button/Button.vue after linting');
      expect(fileStyleAfterLint).toMatchSnapshot('src/button/index.js after linting');

      expect(fileBootstrapGridAfterLint).not.toEqual(fileBootstrapGridBeforeLint);
      expect(fileStyleAfterLint).not.toEqual(fileStyleBeforeLint);

      try {
        const p = await run('yarn yprox-cli lint');
        expect(p.stdout).toContain('Your CSS is clean ✨');
        expect(p.stdout).toContain('Your Sass is clean ✨');
      } catch (e) {
        expect(true).toBeFalsy();
      }

      await cleanup();
    }, 30000);
  });
});
