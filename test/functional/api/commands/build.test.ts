import { statSync } from 'fs';
import { readFixture } from '../../../fixtures';
import { mockLogger, unmockLogger } from '../../../logger';
import { restoreEnv, saveEnv } from '../../../node-env';
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
};

describe('command: build', () => {
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

  it('should build entries (production mode)', async () => {
    const { api, cleanup, run, readFile, fileExists } = await createFakeEnv({ files, mode: 'production', verbose: true });

    await run('yarn install --frozen-lockfile');
    await api.executeCommand('build'); // we could use `yarn build`, but we won't have access to mocked `console.info`

    // should have built files with Rollup handler
    expect(api.logger.info).toHaveBeenCalledWith('rollup :: start bundling "button.js"');
    expect(api.logger.info).toHaveBeenCalledWith('rollup :: finished bundling "button.js"');

    expect(await fileExists('dist/js/button.js')).toBeTruthy();
    expect(await fileExists('dist/js/button.js.map')).toBeTruthy();
    expect(await readFile('dist/js/button.js')).toContain('version="2.5.22"'); // vue
    expect(await readFile('dist/js/button.js')).toContain('{name:"Button",props:{text:String},created:function(){console.log("Hello from Button.vue!")'); // vue plugin
    expect(await readFile('dist/js/button.js')).toContain('.component("y-button",'); // app
    expect(await readFile('dist/js/button.js')).toContain('console.log("Hello from index.js!")'); // app

    // should have built files with JS handler
    expect(api.logger.info).toHaveBeenCalledWith('js :: start bundling "scripts.js"');
    expect(api.logger.info).toHaveBeenCalledWith('js :: finished bundling "scripts.js"');

    expect(await fileExists('dist/js/scripts.js')).toBeTruthy();
    expect(await fileExists('dist/js/scripts.js.map')).toBeTruthy();
    expect(await readFile('dist/js/scripts.js')).toMatchSnapshot('prod js');

    await cleanup();
  }, 100000);

  it('should build entries (development mode)', async () => {
    const { api, cleanup, run, readFile, fileExists } = await createFakeEnv({ files, mode: 'development', verbose: true });

    await run('yarn install --frozen-lockfile');
    await api.executeCommand('build'); // we could use `yarn build`, but we won't have access to mocked `console.info`

    // should have built files with Rollup handler
    expect(api.logger.info).toHaveBeenCalledWith('rollup :: start bundling "button.js"');
    expect(api.logger.info).toHaveBeenCalledWith('rollup :: finished bundling "button.js"');

    expect(await fileExists('dist/js/button.js')).toBeTruthy();
    expect(await fileExists('dist/js/button.js.map')).toBeFalsy();
    expect(await readFile('dist/js/button.js')).toContain("Vue.component('y-button', Button);");
    expect(await readFile('dist/js/button.js')).toContain("'Hello from Button.vue!'");
    expect(await readFile('dist/js/button.js')).toContain('"Hello from index.js!"');

    // should have built files with JS handler
    expect(api.logger.info).toHaveBeenCalledWith('js :: start bundling "scripts.js"');
    expect(api.logger.info).toHaveBeenCalledWith('js :: finished bundling "scripts.js"');

    expect(await fileExists('dist/js/scripts.js')).toBeTruthy();
    expect(await fileExists('dist/js/scripts.js.map')).toBeFalsy();
    expect(await readFile('dist/js/scripts.js')).toMatchSnapshot('dev js');

    await cleanup();
  }, 70000);

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
    }, 20000);

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
    }, 20000);

    it('should skip linting when Stylelint is not installed', async () => {
      const { api, cleanup, run, runYproxCli, fileExists } = await createFakeEnv({ files: 'css' });

      await run('yarn install');
      // make module resolution working for stylelint dependency, if someone have a better idea...
      const { stdout } = await runYproxCli('build --lint');

      expect(stdout).toContain('Linting Sass requires to install "stylelint" dependency.');
      expect(stdout).toContain('Linting CSS requires to install "stylelint" dependency.');
      expect(stdout).toContain('sass :: start bundling "bootstrap-grid.css"');
      expect(stdout).toContain('sass :: finished bundling "bootstrap-grid.css"');
      expect(stdout).toContain('css :: start bundling "style.css"');
      expect(stdout).toContain('css :: finished bundling "style.css"');
      expect(await fileExists('dist/bootstrap-grid.css')).toBeTruthy();
      expect(await fileExists('dist/style.css')).toBeTruthy();

      await cleanup();
    }, 20000);

    it('should lint files but not build them', async () => {
      expect.assertions(5);

      const { cleanup, run, runYproxCli, writeFile, fileExists } = await createFakeEnv({ files: 'css' });

      await run('yarn install');
      await run('yarn add -D stylelint');
      await writeFile('.stylelintrc', '{ "rules": { "no-extra-semicolons": true } }');

      try {
        // make module resolution working for stylelint dependency, if someone have a better idea...
        await runYproxCli('build --lint');
      } catch (e) {
        expect(e.stderr).toMatch(/Your (CSS|Sass) is not clean, stopping\./);
        expect(e.stdout).toContain('Unexpected extra semicolon');
        expect(e.code).toBe(1);
      }

      expect(await fileExists('dist/bootstrap-grid.css')).toBeFalsy();
      expect(await fileExists('dist/style.css')).toBeFalsy();

      await cleanup();
    }, 20000);

    it('should fix linting issues and build files', async () => {
      const { cleanup, readFile, writeFile, fileExists, run, runYproxCli } = await createFakeEnv({ files: 'css' });

      await run('yarn install');
      await run('yarn add -D stylelint');
      await writeFile('.stylelintrc', '{ "rules": { "no-extra-semicolons": true } }');

      expect(await readFile('src/bootstrap-grid.scss')).toMatchSnapshot('bootstrap-grid.scss before linting');
      expect(await readFile('src/style.css')).toMatchSnapshot('style.css before linting');

      try {
        // make module resolution working for stylelint dependency, if someone have a better idea...
        const childProcess = await runYproxCli('build --lint --fix');
        expect(childProcess.stdout).toContain('sass :: start bundling "bootstrap-grid.css"');
        expect(childProcess.stdout).toContain('sass :: finished bundling "bootstrap-grid.css"');
        expect(childProcess.stdout).toContain('css :: start bundling "style.css"');
        expect(childProcess.stdout).toContain('css :: finished bundling "style.css"');
      } catch (e) {
        expect(true).toBeFalsy();
      }

      expect(await readFile('src/bootstrap-grid.scss')).toMatchSnapshot('bootstrap-grid.scss after linting');
      expect(await readFile('src/style.css')).toMatchSnapshot('style.css after linting');
      expect(await fileExists('dist/bootstrap-grid.css')).toBeTruthy();
      expect(await fileExists('dist/style.css')).toBeTruthy();

      await cleanup();
    }, 20000);
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

      cleanup();
    });
  });

  describe('lint (but not fix) before build', () => {
    it('should lint (but not fix) files built with handler `rollup`, before building them', async () => {
      const { api, cleanup, run, fileExists } = await createFakeEnv({ files, mode: 'development', verbose: true });

      await run('yarn install --frozen-lockfile');
      await api.executeCommand('build', {
        'filter:handler': 'rollup',
        lint: true,
      }); // we could use `yarn build`, but we won't have access to mocked `console.info`

      expect(api.logger.error).toHaveBeenCalledWith('Your JavaScript is not clean, stopping.');
      expect(process.exit).toHaveBeenCalledWith(1);
      expect(api.logger.info).not.toHaveBeenCalledWith('rollup :: start bundling "button.js"');
      expect(api.logger.info).not.toHaveBeenCalledWith('rollup :: finished bundling "button.js"');
      expect(await fileExists('dist/js/button.js')).toBeFalsy();

      await cleanup();
    }, 70000);

    it('should lint (but not fix) files built with handler `js`, before building them', async () => {
      const { api, cleanup, run, fileExists } = await createFakeEnv({ files, mode: 'development', verbose: true });

      await run('yarn install --frozen-lockfile');
      await api.executeCommand('build', {
        'filter:handler': 'js',
        lint: true,
      }); // we could use `yarn build`, but we won't have access to mocked `console.info`

      expect(api.logger.error).toHaveBeenCalledWith('Your JavaScript is not clean, stopping.');
      expect(process.exit).toHaveBeenCalledWith(1);
      expect(api.logger.info).not.toHaveBeenCalledWith('js :: start bundling "scripts.js"');
      expect(api.logger.info).not.toHaveBeenCalledWith('js :: finished bundling "scripts.js"');
      expect(await fileExists('dist/js/scripts.js')).toBeFalsy();

      await cleanup();
    }, 70000);
  });

  describe('lint (and fix) before build', () => {
    it('should lint (and but fix) files built with handler `rollup`, before building them', async () => {
      const { api, cleanup, run, readFile, fileExists } = await createFakeEnv({ files, mode: 'development', verbose: true });

      const fileContent = await readFile('src/components/button/index.js');
      expect(fileContent).toMatchSnapshot('button/index.js before lint');

      await run('yarn install --frozen-lockfile');
      await api.executeCommand('build', {
        'filter:handler': 'rollup',
        lint: true,
        fix: true,
      }); // we could use `yarn build`, but we won't have access to mocked `console.info`

      expect(api.logger.error).not.toHaveBeenCalledWith('Your JavaScript is not clean, stopping.');
      expect(process.exit).not.toHaveBeenCalledWith(1);
      expect(api.logger.info).toHaveBeenCalledWith('Your JavaScript is clean ✨');
      expect(api.logger.info).toHaveBeenCalledWith('rollup :: start bundling "button.js"');
      expect(api.logger.info).toHaveBeenCalledWith('rollup :: finished bundling "button.js"');
      expect(await fileExists('dist/js/button.js')).toBeTruthy();

      const newFileContent = await readFile('src/components/button/index.js');
      expect(newFileContent).toMatchSnapshot('button/index.js after lint');
      expect(fileContent).not.toBe(newFileContent);

      await cleanup();
    }, 70000);

    it('should lint (and but fix) files built with handler `js`, before building them', async () => {
      const { api, cleanup, run, readFile, fileExists } = await createFakeEnv({ files, mode: 'development', verbose: true });

      const fileContent = await readFile('src/js/bar.js');
      expect(fileContent).toMatchSnapshot('js/bar.js before lint');

      await run('yarn install --frozen-lockfile');
      await api.executeCommand('build', {
        'filter:handler': 'js',
        lint: true,
        fix: true,
      }); // we could use `yarn build`, but we won't have access to mocked `console.info`

      expect(api.logger.error).not.toHaveBeenCalledWith('Your JavaScript is not clean, stopping.');
      expect(process.exit).not.toHaveBeenCalledWith(1);
      expect(api.logger.info).toHaveBeenCalledWith('Your JavaScript is clean ✨');
      expect(api.logger.info).toHaveBeenCalledWith('js :: start bundling "scripts.js"');
      expect(api.logger.info).toHaveBeenCalledWith('js :: finished bundling "scripts.js"');
      expect(await fileExists('dist/js/scripts.js')).toBeTruthy();

      const newFileContent = await readFile('src/js/bar.js');
      expect(newFileContent).toMatchSnapshot('js/bar.js after lint');
      expect(fileContent).not.toBe(newFileContent);

      await cleanup();
    }, 70000);
  });

  describe('Misc', () => {
    it('Gulp, Rollup, and Sass plugins should not mutate `api.projectOptions`', async () => {
      const { api, cleanup, run } = await createFakeEnv({ files, mode: 'production', verbose: true });
      const projectOptions = JSON.parse(JSON.stringify(api.projectOptions));

      await run('yarn install --frozen-lockfile');
      await api.executeCommand('build', {
        lint: true,
        fix: true,
      }); // we could use `yarn build`, but we won't have access to mocked `console.info`

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
