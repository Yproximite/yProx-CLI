import chalk from 'chalk';
import { statSync } from 'fs';
import { mockLogger, unmockLogger } from '../../../logger';
import { restoreEnv, saveEnv } from '../../../node-env';
import { createFakeEnv } from '../../fake-env';

describe('command: build', () => {
  beforeEach(() => {
    saveEnv();
    mockLogger();
  });
  afterEach(() => {
    restoreEnv();
    unmockLogger();
  });

  describe('JavaScript', () => {
    it('should build files', async () => {
      const { api, fileExists, readFile, cleanup } = await createFakeEnv({ files: 'javascript' });

      await api.executeCommand('build');

      expect(api.logger.info).toHaveBeenCalledWith('js :: start bundling "scripts.js"');
      expect(api.logger.info).toHaveBeenCalledWith('js :: finished bundling "scripts.js"');

      const generatedFile = await readFile('dist/scripts.js');
      expect(generatedFile).toMatchSnapshot('scripts.js in development env');
      expect(generatedFile).toContain("console.log('Hello world from!');;");
      expect(generatedFile).toContain('console.log(("The constant value: " + constant));');
      expect(generatedFile).toContain('[].concat( arr )');
      expect(generatedFile).not.toContain('//# sourceMappingURL=scripts.js.map');
      expect(await fileExists('dist/scripts.js.map')).toBeFalsy();

      await cleanup();
    }, 5000);

    it('should build files, minify them and generate a source map', async () => {
      const { api, fileExists, readFile, cleanup } = await createFakeEnv({ files: 'javascript', mode: 'production' });

      await api.executeCommand('build');

      expect(api.logger.info).toHaveBeenCalledWith('js :: start bundling "scripts.js"');
      expect(api.logger.info).toHaveBeenCalledWith('js :: finished bundling "scripts.js"');

      const generatedFile = await readFile('dist/scripts.js');
      expect(generatedFile).toMatchSnapshot('scripts.js in production env');
      expect(generatedFile).toContain('console.log("Hello world from!");');
      expect(generatedFile).toContain('console.log("The constant value: "+constant);');
      expect(generatedFile).toContain('[].concat(arr)');
      expect(generatedFile).toContain('//# sourceMappingURL=scripts.js.map');
      expect(await fileExists('dist/scripts.js.map')).toBeTruthy();

      await cleanup();
    }, 5000);

    it('should fix linting issues and build files', async () => {
      expect.assertions(9);

      const { api, fileExists, readFile, writeFile, cleanup, run } = await createFakeEnv({ files: 'javascript' });

      await run('yarn add -D eslint babel-eslint');
      await writeFile(
        '.eslintrc.js',
        `
        module.exports = {
          rules: { 'no-extra-semi': 'error' },
          parser: require.resolve('babel-eslint'),
          parserOptions: { ecmaVersion: 6 }
        }`
      );

      expect(await readFile('src/es6.js')).toMatchSnapshot('src/es6.js before linting');
      expect(await readFile('src/hello-world.js')).toMatchSnapshot('src/hello-world.js before linting');

      await api.executeCommand('build', { lint: true, fix: true });

      expect(api.logger.info).toHaveBeenCalledWith('Your JavaScript is clean ✨');
      expect(api.logger.info).toHaveBeenCalledWith('js :: start bundling "scripts.js"');
      expect(api.logger.info).toHaveBeenCalledWith('js :: finished bundling "scripts.js"');

      expect(await readFile('src/es6.js')).toMatchSnapshot('src/es6.js after linting');
      expect(await readFile('src/hello-world.js')).toMatchSnapshot('src/hello-world.js after linting');
      expect(await fileExists('dist/scripts.js')).toBeTruthy();
      expect(await fileExists('dist/scripts.js.map')).toBeFalsy();

      await cleanup();
    }, 30000);
  });

  describe('Vue', () => {
    it('should fails and display a message when vue-template-compiler is not installed', async () => {
      expect.assertions(8);

      const { fileExists, cleanup, run, installYproxCli } = await createFakeEnv({ files: 'vue' });

      await run('yarn');
      await run('yarn remove vue-template-compiler');
      await installYproxCli();

      try {
        await run('yarn yprox-cli build');
      } catch (e) {
        expect(e.stdout).toContain('rollup :: start bundling "button.js"');
        expect(e.stderr).toContain("SyntaxError: Unexpected character '@' (2:10)");
        expect(e.stderr).toContain('/src/button/Button.vue (2:10)');
        expect(e.stdout).toContain(chalk`If you try to building Vue code, try to run {blue.bold yarn add -D vue-template-compiler}.`);
        expect(e.stdout).not.toContain('rollup :: finished bundling "button.js"');
        expect(e.code).toBe(1);
      }

      expect(await fileExists('dist/button.js')).toBeFalsy();
      expect(await fileExists('dist/button.js.map')).toBeFalsy();

      await cleanup();
    }, 30000);

    it('should build files', async () => {
      const { api, fileExists, readFile, cleanup, run } = await createFakeEnv({ files: 'vue' });

      await run('yarn');
      await api.executeCommand('build');

      expect(api.logger.info).toHaveBeenCalledWith('rollup :: start bundling "button.js"');
      expect(api.logger.info).toHaveBeenCalledWith('rollup :: finished bundling "button.js"');

      const generatedFile = await readFile('dist/button.js');
      expect(generatedFile).toContain('You are running Vue in development mode.');
      expect(generatedFile).toContain("console.log('Hello from Button.vue!')");
      expect(generatedFile).toContain("Vue.component('y-button', Button);");
      expect(generatedFile).toContain('console.log("Hello from index.js!");');
      expect(await fileExists('dist/button.js.map')).toBeFalsy();

      await cleanup();
    }, 15000);

    it('should build files, minify them and generate a source map', async () => {
      const { api, fileExists, readFile, cleanup, run } = await createFakeEnv({ files: 'vue', mode: 'production' });

      await run('yarn');
      await api.executeCommand('build');

      expect(api.logger.info).toHaveBeenCalledWith('rollup :: start bundling "button.js"');
      expect(api.logger.info).toHaveBeenCalledWith('rollup :: finished bundling "button.js"');

      const generatedFile = await readFile('dist/button.js');
      expect(generatedFile).not.toContain('You are running Vue in development mode.');
      expect(generatedFile).toContain('console.log("Hello from Button.vue!")');
      expect(generatedFile).not.toContain('Vue.component("y-button", Button)');
      expect(generatedFile).toContain('console.log("Hello from index.js!")');
      expect(generatedFile).toContain('//# sourceMappingURL=button.js.map');
      expect(await fileExists('dist/button.js.map')).toBeTruthy();

      await cleanup();
    }, 15000);

    it('should fix linting issues and build files', async () => {
      const { api, fileExists, readFile, writeFile, cleanup, run } = await createFakeEnv({ files: 'vue' });

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

      expect(await readFile('src/button/Button.vue')).toMatchSnapshot('src/button/Button.vue before linting');
      expect(await readFile('src/button/index.js')).toMatchSnapshot('src/button/index.js before linting');

      await api.executeCommand('build', { lint: true, fix: true });

      expect(api.logger.info).toHaveBeenCalledWith('Your JavaScript is clean ✨');
      expect(api.logger.info).toHaveBeenCalledWith('rollup :: start bundling "button.js"');
      expect(api.logger.info).toHaveBeenCalledWith('rollup :: finished bundling "button.js"');

      expect(await readFile('src/button/Button.vue')).toMatchSnapshot('src/button/Button.vue after linting');
      expect(await readFile('src/button/index.js')).toMatchSnapshot('src/button/index.js after linting');
      expect(await fileExists('dist/button.js')).toBeTruthy();
      expect(await fileExists('dist/button.js.map')).toBeFalsy();

      await cleanup();
    }, 15000);
  });

  describe('CSS & Sass', () => {
    it('should build files', async () => {
      const { api, cleanup, run, readFile } = await createFakeEnv({ files: 'css' });

      await run('yarn install');
      await api.executeCommand('build');

      expect(api.logger.info).toHaveBeenCalledWith('sass :: start bundling "bootstrap-grid.css"');
      expect(api.logger.info).toHaveBeenCalledWith('sass :: finished bundling "bootstrap-grid.css"');
      expect(api.logger.info).toHaveBeenCalledWith('css :: start bundling "style.css"');
      expect(api.logger.info).toHaveBeenCalledWith('css :: finished bundling "style.css"');
      expect(await readFile('dist/bootstrap-grid.css')).toMatchSnapshot();
      expect(await readFile('dist/style.css')).toMatchSnapshot();

      await cleanup();
    }, 15000);

    it('should build files and minify them', async () => {
      const { api, cleanup, run, readFile } = await createFakeEnv({ files: 'css', mode: 'production' });

      await run('yarn install');
      await api.executeCommand('build');

      expect(api.logger.info).toHaveBeenCalledWith('sass :: start bundling "bootstrap-grid.css"');
      expect(api.logger.info).toHaveBeenCalledWith('sass :: finished bundling "bootstrap-grid.css"');
      expect(api.logger.info).toHaveBeenCalledWith('css :: start bundling "style.css"');
      expect(api.logger.info).toHaveBeenCalledWith('css :: finished bundling "style.css"');
      expect(await readFile('dist/bootstrap-grid.css')).toMatchSnapshot();
      expect(await readFile('dist/style.css')).toMatchSnapshot();

      await cleanup();
    }, 15000);

    it('should fix linting issues and build files', async () => {
      const { api, cleanup, readFile, writeFile, fileExists, run } = await createFakeEnv({ files: 'css' });

      await run('yarn install');
      await run('yarn add -D stylelint');
      await writeFile('.stylelintrc', '{ "rules": { "no-extra-semicolons": true } }');

      expect(await readFile('src/bootstrap-grid.scss')).toMatchSnapshot('bootstrap-grid.scss before linting');
      expect(await readFile('src/style.css')).toMatchSnapshot('style.css before linting');

      await api.executeCommand('build', { lint: true, fix: true });
      expect(api.logger.info).toHaveBeenCalledWith('sass :: start bundling "bootstrap-grid.css"');
      expect(api.logger.info).toHaveBeenCalledWith('sass :: finished bundling "bootstrap-grid.css"');
      expect(api.logger.info).toHaveBeenCalledWith('css :: start bundling "style.css"');
      expect(api.logger.info).toHaveBeenCalledWith('css :: finished bundling "style.css"');

      expect(await readFile('src/bootstrap-grid.scss')).toMatchSnapshot('bootstrap-grid.scss after linting');
      expect(await readFile('src/style.css')).toMatchSnapshot('style.css after linting');
      expect(await fileExists('dist/bootstrap-grid.css')).toBeTruthy();
      expect(await fileExists('dist/style.css')).toBeTruthy();

      await cleanup();
    }, 30000);
  });

  describe('Copy files', () => {
    it('should copy files', async () => {
      const { api, cleanup, run, readFile } = await createFakeEnv({ files: 'files' });
      await run('yarn install');

      await api.executeCommand('build');

      expect(api.logger.info).toHaveBeenCalledWith('file :: start copying "files to copy"');
      expect(api.logger.info).toHaveBeenCalledWith('file :: done copying "files to copy"');

      expect(await readFile('dist/lorem.txt')).toEqual(await readFile('src/lorem.txt'));
      expect(await readFile('dist/lorem.txt')).toContain('Lorem ipsum dolor sit amet.');

      expect(await readFile('dist/udhr.txt')).toEqual(await readFile('src/udhr.txt'));
      expect(await readFile('dist/udhr.txt')).toContain('Universal Declaration of Human Rights - English');

      await cleanup();
    });
  });

  describe('Images optimization', () => {
    beforeEach(() => {
      console.log = jest.fn();
    });

    afterEach(() => {
      // @ts-ignore
      console.log.mockRestore();
    });

    it.each([['development'], ['production']])(
      'should minify images in %s env',
      async mode => {
        const { api, cleanup } = await createFakeEnv({ mode, files: 'images' });

        await api.executeCommand('build');

        expect(api.logger.info).toHaveBeenCalledWith('image :: start optimizing "images to optimize"');
        expect(api.logger.info).toHaveBeenCalledWith('image :: done optimizing "images to optimize"');
        expect(console.log).toHaveBeenCalled();
        // @ts-ignore
        expect(console.log.mock.calls).toMatchSnapshot();

        expect(statSync(api.resolve('src/guts-white-hair.png')).size).toBeGreaterThan(1024 * 1024);
        expect(statSync(api.resolve('dist/guts-white-hair.png')).size).toBeLessThan(1024 * 1024);

        expect(statSync(api.resolve('src/jax.jpg')).size).toBeGreaterThan(230 * 1024);
        expect(statSync(api.resolve('dist/jax.jpg')).size).toBeLessThan(230 * 1024);

        expect(statSync(api.resolve('src/golfer.gif')).size).toBeGreaterThan(2800 * 1024);
        expect(statSync(api.resolve('dist/golfer.gif')).size).toBeLessThan(435 * 1024);

        expect(statSync(api.resolve('src/uk.svg')).size).toBeGreaterThan(55 * 1024);
        expect(statSync(api.resolve('dist/uk.svg')).size).toBeLessThan(42 * 1024);

        await cleanup();
      },
      20000
    );
  });

  describe('GraphQL', () => {
    it('should build files', async () => {
      const { api, cleanup, readFile } = await createFakeEnv({ files: 'graphql' });

      await api.executeCommand('build'); // build in "cjs" format, to make it easier/safer to test

      expect(api.logger.info).toHaveBeenCalledWith('rollup :: start bundling "app"');
      expect(api.logger.info).toHaveBeenCalledWith('rollup :: finished bundling "app"');

      const exports: { [key: string]: any } = {};
      const fn = new Function('exports', await readFile('dist/medias.js')); // tslint:disable-line
      fn(exports);

      expect(exports.MediaQuery).toBeDefined();
      expect(exports.MediaQuery.kind).toBe('Document');
      expect(exports.MediaQuery.definitions[0].name.value).toBe('MediaQuery');

      expect(exports.MediasQuery).toBeDefined();
      expect(exports.MediasQuery.kind).toBe('Document');
      expect(exports.MediasQuery.definitions[0].name.value).toBe('MediasQuery');

      expect(exports.DeleteMediaMutation).toBeDefined();
      expect(exports.DeleteMediaMutation.kind).toBe('Document');
      expect(exports.DeleteMediaMutation.definitions[0].name.value).toBe('DeleteMediaMutation');

      await cleanup();
    });
  });

  describe('Misc', () => {
    xit('Gulp, Rollup, and Sass plugins should not mutate `api.projectOptions`', async () => {
      const { api, cleanup } = await createFakeEnv({ files: '', mode: 'production', verbose: true });
      const projectOptions = JSON.parse(JSON.stringify(api.projectOptions));

      await api.executeCommand('build', {
        lint: true,
        fix: true,
      });

      expect(projectOptions.eslint).toEqual(api.projectOptions.eslint);
      expect(projectOptions.buble).toEqual(api.projectOptions.buble);
      expect(projectOptions.autoprefixer).toEqual(api.projectOptions.autoprefixer);
      expect(projectOptions.cssnano).toEqual(api.projectOptions.cssnano);
      expect(projectOptions.terser).toEqual(api.projectOptions.terser);
      expect(projectOptions.gifsicle).toEqual(api.projectOptions.gifsicle);
      expect(projectOptions.jpegtran).toEqual(api.projectOptions.jpegtran);
      expect(projectOptions.optipng).toEqual(api.projectOptions.optipng);
      expect(projectOptions.svgo).toEqual(api.projectOptions.svgo);

      await cleanup();
    }, 70000);
  });
});
