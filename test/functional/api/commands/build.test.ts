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
  'src/components/button/foo.graphql': readFixture('modern-project/src/components/button/foo.graphql'),
  // css
  'src/css/bar.css': readFixture('modern-project/src/css/bar.css'),
  'src/css/foo.css': readFixture('modern-project/src/css/foo.css'),
  // js
  'src/js/bar.js': readFixture('modern-project/src/js/bar.js'),
  'src/js/foo.js': readFixture('modern-project/src/js/foo.js'),
  // sass
  'src/sass/_form.scss': readFixture('modern-project/src/sass/_form.scss'),
  'src/sass/style.scss': readFixture('modern-project/src/sass/style.scss'),
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
    const { api, cleanup, run, readFile, fileExists } = await createFakeEnv(files, 'production', true);

    await run('yarn install --frozen-lockfile');
    await api.executeCommand('build'); // we could use `yarn build`, but we won't have access to mocked `console.info`

    // should have built files with Rollup handler
    expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: rollup :: start bundling "button.js"');
    expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: rollup :: finished bundling "button.js"');

    expect(await fileExists('dist/js/button.js')).toBeTruthy();
    expect(await fileExists('dist/js/button.js.map')).toBeTruthy();
    expect(await readFile('dist/js/button.js')).toContain('version="2.5.22"'); // vue
    expect(await readFile('dist/js/button.js')).toContain('{name:"Button",props:{text:String},created:function(){console.log("Hello from Button.vue!"),'); // vue plugin
    expect(await readFile('dist/js/button.js')).toContain(
      'kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"FooQuery"}'
    ); // graphql plugin
    expect(await readFile('dist/js/button.js')).toContain('.component("y-button",'); // app
    expect(await readFile('dist/js/button.js')).toContain('console.log("Hello from index.js!")'); // app

    // should have built files with JS handler
    expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: js :: start bundling "scripts.js"');
    expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: js :: finished bundling "scripts.js"');

    expect(await fileExists('dist/js/scripts.js')).toBeTruthy();
    expect(await fileExists('dist/js/scripts.js.map')).toBeTruthy();
    expect(await readFile('dist/js/scripts.js')).toMatchSnapshot('prod js');

    // should have built files with CSS
    expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: css :: start bundling "legacy-styles.css"');
    expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: css :: finished bundling "legacy-styles.css"');

    expect(await fileExists('dist/css/legacy-styles.css')).toBeTruthy();
    expect(await fileExists('dist/css/legacy-styles.css.map')).toBeTruthy();
    expect(await readFile('dist/css/legacy-styles.css')).toMatchSnapshot('prod css');

    // should have built files with Sass handler
    expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: sass :: start bundling "styles.css"');
    expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: sass :: finished bundling "styles.css"');

    expect(await fileExists('dist/css/styles.css')).toBeTruthy();
    expect(await fileExists('dist/css/styles.css.map')).toBeTruthy();
    expect(await readFile('dist/css/styles.css')).toMatchSnapshot('prod sass');

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
    const { api, cleanup, run, readFile, fileExists } = await createFakeEnv(files, 'development', true);

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

    // should have built files with CSS
    expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: css :: start bundling "legacy-styles.css"');
    expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: css :: finished bundling "legacy-styles.css"');

    expect(await fileExists('dist/css/legacy-styles.css')).toBeTruthy();
    expect(await fileExists('dist/css/legacy-styles.css.map')).toBeFalsy();
    expect(await readFile('dist/css/legacy-styles.css')).toMatchSnapshot('dev css');

    // should have built files with Sass handler
    expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: sass :: start bundling "styles.css"');
    expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: sass :: finished bundling "styles.css"');

    expect(await fileExists('dist/css/styles.css')).toBeTruthy();
    expect(await fileExists('dist/css/styles.css.map')).toBeFalsy();
    expect(await readFile('dist/css/styles.css')).toMatchSnapshot('dev sass');

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

  it('should build only css entries (filter on `css` handler)', async () => {
    const { api, cleanup, run, fileExists } = await createFakeEnv(files, 'development', true);

    await run('yarn install --frozen-lockfile');
    await api.executeCommand('build', { 'filter:handler': 'css' }); // we could use `yarn build`, but we won't have access to mocked `console.info`

    expect(console.log).toHaveBeenCalledWith("[08:30:00] log :: Filtering assets where `asset.handler === 'css'`"); // verbose mode

    // should have built files with CSS handler
    expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: css :: start bundling "legacy-styles.css"');
    expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: css :: finished bundling "legacy-styles.css"');
    expect(await fileExists('dist/css/legacy-styles.css')).toBeTruthy();
    expect(await fileExists('dist/css/legacy-styles.css.map')).toBeFalsy();

    // other handlers should not have been called

    // rollup
    expect(console.info).not.toHaveBeenCalledWith('[08:30:00] info :: rollup :: start bundling "button.js"');
    expect(console.info).not.toHaveBeenCalledWith('[08:30:00] info :: rollup :: finished bundling "button.js"');
    expect(await fileExists('dist/js/button.js')).toBeFalsy();
    expect(await fileExists('dist/js/button.js.map')).toBeFalsy();

    // js
    expect(console.info).not.toHaveBeenCalledWith('[08:30:00] info :: js :: start bundling "scripts.js"');
    expect(console.info).not.toHaveBeenCalledWith('[08:30:00] info :: js :: finished bundling "scripts.js"');
    expect(await fileExists('dist/js/scripts.js')).toBeFalsy();
    expect(await fileExists('dist/js/scripts.js.map')).toBeFalsy();

    // sass
    expect(console.info).not.toHaveBeenCalledWith('[08:30:00] info :: sass :: start bundling "styles.css"');
    expect(console.info).not.toHaveBeenCalledWith('[08:30:00] info :: sass :: finished bundling "styles.css"');
    expect(await fileExists('dist/css/styles.css')).toBeFalsy();
    expect(await fileExists('dist/css/styles.css.map')).toBeFalsy();

    // images
    expect(console.info).not.toHaveBeenCalledWith('[08:30:00] info :: image :: start optimizing "images to optimize"');
    expect(console.info).not.toHaveBeenCalledWith('[08:30:00] info :: image :: done optimizing "images to optimize"');
    expect(await fileExists('dist/images/guts-white-hair.png')).toBeFalsy();
    expect(await fileExists('dist/images/jax.jpg')).toBeFalsy();
    expect(await fileExists('dist/images/golfer.gif')).toBeFalsy();
    expect(await fileExists('dist/images/uk.svg')).toBeFalsy();

    await cleanup();
  }, 70000);

  it('should build only css and sass entries (filter on `css` and `sass` handlers)', async () => {
    const { api, cleanup, run, fileExists } = await createFakeEnv(files, 'development', true);

    await run('yarn install --frozen-lockfile');
    await api.executeCommand('build', { 'filter:handler': ['css', 'sass'] }); // we could use `yarn build`, but we won't have access to mocked `console.info`

    expect(console.log).toHaveBeenCalledWith("[08:30:00] log :: Filtering assets where `['css', 'sass'].includes(asset.handler)`"); // verbose mode

    // should have built files with CSS handler
    expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: css :: start bundling "legacy-styles.css"');
    expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: css :: finished bundling "legacy-styles.css"');
    expect(await fileExists('dist/css/legacy-styles.css')).toBeTruthy();
    expect(await fileExists('dist/css/legacy-styles.css.map')).toBeFalsy();

    // should have built files with Sass handler
    expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: sass :: start bundling "styles.css"');
    expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: sass :: finished bundling "styles.css"');
    expect(await fileExists('dist/css/styles.css')).toBeTruthy();
    expect(await fileExists('dist/css/styles.css.map')).toBeFalsy();

    // other handlers should not have been called

    // rollup
    expect(console.info).not.toHaveBeenCalledWith('[08:30:00] info :: rollup :: start bundling "button.js"');
    expect(console.info).not.toHaveBeenCalledWith('[08:30:00] info :: rollup :: finished bundling "button.js"');
    expect(await fileExists('dist/js/button.js')).toBeFalsy();
    expect(await fileExists('dist/js/button.js.map')).toBeFalsy();

    // js
    expect(console.info).not.toHaveBeenCalledWith('[08:30:00] info :: js :: start bundling "scripts.js"');
    expect(console.info).not.toHaveBeenCalledWith('[08:30:00] info :: js :: finished bundling "scripts.js"');
    expect(await fileExists('dist/js/scripts.js')).toBeFalsy();
    expect(await fileExists('dist/js/scripts.js.map')).toBeFalsy();

    // images
    expect(console.info).not.toHaveBeenCalledWith('[08:30:00] info :: image :: start optimizing "images to optimize"');
    expect(console.info).not.toHaveBeenCalledWith('[08:30:00] info :: image :: done optimizing "images to optimize"');
    expect(await fileExists('dist/images/guts-white-hair.png')).toBeFalsy();
    expect(await fileExists('dist/images/jax.jpg')).toBeFalsy();
    expect(await fileExists('dist/images/golfer.gif')).toBeFalsy();
    expect(await fileExists('dist/images/uk.svg')).toBeFalsy();

    await cleanup();
  }, 70000);

  describe('Copy files', () => {
    it('should copy files', async () => {
      const { api, cleanup, readFile } = await createFakeEnv('files');

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

  describe('lint (but not fix) before build', () => {
    it('should lint (but not fix) files built with handler `rollup`, before building them', async () => {
      const { api, cleanup, run, fileExists } = await createFakeEnv(files, 'development', true);

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
      const { api, cleanup, run, fileExists } = await createFakeEnv(files, 'development', true);

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

    it('should lint (but not fix) files built with handler `css`, before building them', async () => {
      const { api, cleanup, run, fileExists } = await createFakeEnv(files, 'development', true);

      await run('yarn install --frozen-lockfile');
      await api.executeCommand('build', {
        'filter:handler': 'css',
        lint: true,
      }); // we could use `yarn build`, but we won't have access to mocked `console.info`

      expect(console.error).toHaveBeenCalledWith('[08:30:00] error :: Your CSS is not clean, stopping.');
      expect(process.exit).toHaveBeenCalledWith(1);
      expect(console.info).not.toHaveBeenCalledWith('[08:30:00] info :: css :: start bundling "legacy-styles.css"');
      expect(console.info).not.toHaveBeenCalledWith('[08:30:00] info :: css :: finished bundling "legacy-styles.css"');
      expect(await fileExists('dist/css/legacy-styles.css')).toBeFalsy();

      await cleanup();
    }, 70000);

    it('should lint (but not fix) files built with handler `sass`, before building them', async () => {
      const { api, cleanup, run, fileExists } = await createFakeEnv(files, 'development', true);

      await run('yarn install --frozen-lockfile');
      await api.executeCommand('build', {
        'filter:handler': 'sass',
        lint: true,
      }); // we could use `yarn build`, but we won't have access to mocked `console.info`

      expect(console.error).toHaveBeenCalledWith('[08:30:00] error :: Your Sass is not clean, stopping.');
      expect(process.exit).toHaveBeenCalledWith(1);
      expect(console.info).not.toHaveBeenCalledWith('[08:30:00] info :: sass :: start bundling "styles.css"');
      expect(console.info).not.toHaveBeenCalledWith('[08:30:00] info :: sass :: finished bundling "styles.css"');
      expect(await fileExists('dist/css/styles.css')).toBeFalsy();

      await cleanup();
    }, 70000);
  });

  describe('lint (and fix) before build', () => {
    it('should lint (and but fix) files built with handler `rollup`, before building them', async () => {
      const { api, cleanup, run, readFile, fileExists } = await createFakeEnv(files, 'development', true);

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
      const { api, cleanup, run, readFile, fileExists } = await createFakeEnv(files, 'development', true);

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

    it('should lint (and but fix) files built with handler `css`, before building them', async () => {
      const { api, cleanup, run, readFile, fileExists } = await createFakeEnv(files, 'development', true);

      const fileContent = await readFile('src/css/bar.css');
      expect(fileContent).toMatchSnapshot('css/bar.css before lint');

      await run('yarn install --frozen-lockfile');
      await api.executeCommand('build', {
        'filter:handler': 'css',
        lint: true,
        fix: true,
      }); // we could use `yarn build`, but we won't have access to mocked `console.info`

      expect(console.error).not.toHaveBeenCalledWith('[08:30:00] error :: Your CSS is not clean, stopping.');
      expect(process.exit).not.toHaveBeenCalledWith(1);
      expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: Your CSS is clean ✨');
      expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: css :: start bundling "legacy-styles.css"');
      expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: css :: finished bundling "legacy-styles.css"');
      expect(await fileExists('dist/css/legacy-styles.css')).toBeTruthy();

      const newFileContent = await readFile('src/css/bar.css');
      expect(newFileContent).toMatchSnapshot('css/bar.css after lint');
      expect(fileContent).not.toBe(newFileContent);

      await cleanup();
    }, 70000);

    it('should lint (and but fix) files built with handler `sass`, before building them', async () => {
      const { api, cleanup, run, readFile, fileExists } = await createFakeEnv(files, 'development', true);

      const fileContent = await readFile('src/sass/style.scss');
      expect(fileContent).toMatchSnapshot('sass/style.scss before lint');

      await run('yarn install --frozen-lockfile');
      await api.executeCommand('build', {
        'filter:handler': 'sass',
        lint: true,
        fix: true,
      }); // we could use `yarn build`, but we won't have access to mocked `console.info`

      expect(console.error).not.toHaveBeenCalledWith('[08:30:00] error :: Your Sass is not clean, stopping.');
      expect(process.exit).not.toHaveBeenCalledWith(1);
      expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: Your Sass is clean ✨');
      expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: sass :: start bundling "styles.css"');
      expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: sass :: finished bundling "styles.css"');
      expect(await fileExists('dist/css/styles.css')).toBeTruthy();

      const newFileContent = await readFile('src/sass/style.scss');
      expect(newFileContent).toMatchSnapshot('sass/style.scss after lint');
      expect(fileContent).not.toBe(newFileContent);

      await cleanup();
    }, 70000);
  });

  describe('Misc', () => {
    it('Gulp, Rollup, and Sass plugins should not mutate `api.projectOptions`', async () => {
      const { api, cleanup, run } = await createFakeEnv(files, 'production', true);
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
