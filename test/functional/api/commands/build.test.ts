import { statSync } from 'fs';
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

describe('command: build', () => {
  let oldEnv = process.env;
  beforeEach(() => {
    oldEnv = process.env;
    delete process.env.NODE_ENV; // otherwise it will not be set by yprox-cli
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

  it('should build entries (production mode)', async () => {
    const { api, cleanup, run, readFile, fileExists } = await createFakeEnv({ files, mode: 'production', verbose: true });

    await run('yarn install --frozen-lockfile');
    await api.executeCommand('build'); // we could use `yarn build`, but we won't have access to mocked `console.info`

    // should have built files with Rollup handler
    expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: rollup :: start bundling "button.js"');
    expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: rollup :: finished bundling "button.js"');

    expect(await fileExists('dist/js/button.js')).toBeTruthy();
    expect(await fileExists('dist/js/button.js.map')).toBeTruthy();
    expect(await readFile('dist/js/button.js')).toContain('version="2.5.22"'); // vue
    expect(await readFile('dist/js/button.js')).toContain('{name:"Button",props:{text:String},created:function(){console.log("Hello from Button.vue!")'); // vue plugin
    expect(await readFile('dist/js/button.js')).toContain('.component("y-button",'); // app
    expect(await readFile('dist/js/button.js')).toContain('console.log("Hello from index.js!")'); // app

    // should have built files with JS handler
    expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: js :: start bundling "scripts.js"');
    expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: js :: finished bundling "scripts.js"');

    expect(await fileExists('dist/js/scripts.js')).toBeTruthy();
    expect(await fileExists('dist/js/scripts.js.map')).toBeTruthy();
    expect(await readFile('dist/js/scripts.js')).toMatchSnapshot('prod js');

    // should have optimized images
    expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: image :: start optimizing "images to optimize"');
    expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: image :: done optimizing "images to optimize"');

    expect(statSync(api.resolve('src/images/guts-white-hair.png')).size).toBeGreaterThan(1024 * 1024);
    expect(statSync(api.resolve('dist/images/guts-white-hair.png')).size).toBeLessThan(1024 * 1024);

    expect(statSync(api.resolve('src/images/jax.jpg')).size).toBeGreaterThan(230 * 1024);
    expect(statSync(api.resolve('dist/images/jax.jpg')).size).toBeLessThan(230 * 1024);

    expect(statSync(api.resolve('src/images/golfer.gif')).size).toBeGreaterThan(2800 * 1024);
    expect(statSync(api.resolve('dist/images/golfer.gif')).size).toBeLessThan(435 * 1024);

    expect(statSync(api.resolve('src/images/uk.svg')).size).toBeGreaterThan(55 * 1024);
    expect(statSync(api.resolve('dist/images/uk.svg')).size).toBeLessThan(42 * 1024);

    await cleanup();
  }, 100000);

  it('should build entries (development mode)', async () => {
    const { api, cleanup, run, readFile, fileExists } = await createFakeEnv({ files, mode: 'development', verbose: true });

    await run('yarn install --frozen-lockfile');
    await api.executeCommand('build'); // we could use `yarn build`, but we won't have access to mocked `console.info`

    // should have built files with Rollup handler
    expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: rollup :: start bundling "button.js"');
    expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: rollup :: finished bundling "button.js"');

    expect(await fileExists('dist/js/button.js')).toBeTruthy();
    expect(await fileExists('dist/js/button.js.map')).toBeFalsy();
    expect(await readFile('dist/js/button.js')).toContain("Vue.component('y-button', Button);");
    expect(await readFile('dist/js/button.js')).toContain("'Hello from Button.vue!'");
    expect(await readFile('dist/js/button.js')).toContain('"Hello from index.js!"');

    // should have built files with JS handler
    expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: js :: start bundling "scripts.js"');
    expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: js :: finished bundling "scripts.js"');

    expect(await fileExists('dist/js/scripts.js')).toBeTruthy();
    expect(await fileExists('dist/js/scripts.js.map')).toBeFalsy();
    expect(await readFile('dist/js/scripts.js')).toMatchSnapshot('dev js');

    // should have optimized images
    expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: image :: start optimizing "images to optimize"');
    expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: image :: done optimizing "images to optimize"');

    expect(statSync(api.resolve('src/images/guts-white-hair.png')).size).toBeGreaterThan(1024 * 1024);
    expect(statSync(api.resolve('dist/images/guts-white-hair.png')).size).toBeLessThan(1024 * 1024);

    expect(statSync(api.resolve('src/images/jax.jpg')).size).toBeGreaterThan(230 * 1024);
    expect(statSync(api.resolve('dist/images/jax.jpg')).size).toBeLessThan(230 * 1024);

    expect(statSync(api.resolve('src/images/golfer.gif')).size).toBeGreaterThan(2800 * 1024);
    expect(statSync(api.resolve('dist/images/golfer.gif')).size).toBeLessThan(435 * 1024);

    expect(statSync(api.resolve('src/images/uk.svg')).size).toBeGreaterThan(55 * 1024);
    expect(statSync(api.resolve('dist/images/uk.svg')).size).toBeLessThan(42 * 1024);

    await cleanup();
  }, 70000);

  describe('CSS & Sass', () => {
    it('should build files', async () => {
      const { api, cleanup, run, readFile } = await createFakeEnv({ files: 'css' });

      await run('yarn install');
      await api.executeCommand('build');

      expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: sass :: start bundling "bootstrap-grid.css"');
      expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: sass :: finished bundling "bootstrap-grid.css"');
      expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: css :: start bundling "style.css"');
      expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: css :: finished bundling "style.css"');
      expect(await readFile('dist/bootstrap-grid.css')).toMatchSnapshot();
      expect(await readFile('dist/style.css')).toMatchSnapshot();

      await cleanup();
    }, 20000);

    it('should build files and minify them', async () => {
      const { api, cleanup, run, readFile } = await createFakeEnv({ files: 'css', mode: 'production' });

      await run('yarn install');
      await api.executeCommand('build');

      expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: sass :: start bundling "bootstrap-grid.css"');
      expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: sass :: finished bundling "bootstrap-grid.css"');
      expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: css :: start bundling "style.css"');
      expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: css :: finished bundling "style.css"');
      expect(await readFile('dist/bootstrap-grid.css')).toMatchSnapshot();
      expect(await readFile('dist/style.css')).toMatchSnapshot();

      await cleanup();
    }, 20000);

    it('should skip linting when Stylelint is not installed', async () => {
      const { api, cleanup, run, runYproxCli, fileExists } = await createFakeEnv({ files: 'css' });

      await run('yarn install');
      // make module resolution working for stylelint dependency, if someone have a better idea...
      const { stdout } = await runYproxCli('build --lint');

      expect(stdout).toContain('info :: Linting Sass requires to install "stylelint" dependency.');
      expect(stdout).toContain('info :: Linting CSS requires to install "stylelint" dependency.');
      expect(stdout).toContain('info :: sass :: start bundling "bootstrap-grid.css"');
      expect(stdout).toContain('info :: sass :: finished bundling "bootstrap-grid.css"');
      expect(stdout).toContain('info :: css :: start bundling "style.css"');
      expect(stdout).toContain('info :: css :: finished bundling "style.css"');
      expect(await fileExists('dist/bootstrap-grid.css')).toBeTruthy();
      expect(await fileExists('dist/style.css')).toBeTruthy();

      await cleanup();
    }, 20000);

    it('should lint files but not build them', async () => {
      expect.assertions(6);

      const { cleanup, run, runYproxCli, writeFile, fileExists } = await createFakeEnv({ files: 'css' });

      await run('yarn install');
      await run('yarn add -D stylelint');
      await writeFile('.stylelintrc', '{ "rules": { "no-extra-semicolons": true } }');

      try {
        // make module resolution working for stylelint dependency, if someone have a better idea...
        await runYproxCli('build --lint');
      } catch (e) {
        expect(e.stderr).toMatch(/error :: Your (CSS|Sass) is not clean, stopping\./);
        expect(e.stdout).toContain('Unexpected extra semicolon');
        expect(e.stdout).toContain('info :: Some errors can be automatically fixed with "--fix" flag');
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
        expect(childProcess.stdout).toContain('info :: sass :: start bundling "bootstrap-grid.css"');
        expect(childProcess.stdout).toContain('info :: sass :: finished bundling "bootstrap-grid.css"');
        expect(childProcess.stdout).toContain('info :: css :: start bundling "style.css"');
        expect(childProcess.stdout).toContain('info :: css :: finished bundling "style.css"');
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

      expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: file :: start copying "files to copy"');
      expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: file :: done copying "files to copy"');

      expect(await readFile('dist/lorem.txt')).toEqual(await readFile('src/lorem.txt'));
      expect(await readFile('dist/lorem.txt')).toContain('Lorem ipsum dolor sit amet.');

      expect(await readFile('dist/udhr.txt')).toEqual(await readFile('src/udhr.txt'));
      expect(await readFile('dist/udhr.txt')).toContain('Universal Declaration of Human Rights - English');

      await cleanup();
    });
  });

  describe('GraphQL', () => {
    it('should build files', async () => {
      const { api, cleanup, readFile } = await createFakeEnv({ files: 'graphql' });

      await api.executeCommand('build'); // build in "cjs" format, to make it easier/safer to test

      expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: rollup :: start bundling "app"');
      expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: rollup :: finished bundling "app"');

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

      expect(console.error).toHaveBeenCalledWith('[08:30:00] error :: Your JavaScript is not clean, stopping.');
      expect(process.exit).toHaveBeenCalledWith(1);
      expect(console.info).not.toHaveBeenCalledWith('[08:30:00] info :: rollup :: start bundling "button.js"');
      expect(console.info).not.toHaveBeenCalledWith('[08:30:00] info :: rollup :: finished bundling "button.js"');
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

      expect(console.error).toHaveBeenCalledWith('[08:30:00] error :: Your JavaScript is not clean, stopping.');
      expect(process.exit).toHaveBeenCalledWith(1);
      expect(console.info).not.toHaveBeenCalledWith('[08:30:00] info :: js :: start bundling "scripts.js"');
      expect(console.info).not.toHaveBeenCalledWith('[08:30:00] info :: js :: finished bundling "scripts.js"');
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

      expect(console.error).not.toHaveBeenCalledWith('[08:30:00] error :: Your JavaScript is not clean, stopping.');
      expect(process.exit).not.toHaveBeenCalledWith(1);
      expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: Your JavaScript is clean ✨');
      expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: rollup :: start bundling "button.js"');
      expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: rollup :: finished bundling "button.js"');
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

      expect(console.error).not.toHaveBeenCalledWith('[08:30:00] error :: Your JavaScript is not clean, stopping.');
      expect(process.exit).not.toHaveBeenCalledWith(1);
      expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: Your JavaScript is clean ✨');
      expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: js :: start bundling "scripts.js"');
      expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: js :: finished bundling "scripts.js"');
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
