import { existsSync, readFileSync, statSync } from 'fs';
import { createFakeEnv } from '../../fake-env';

const readFile = (filename: string, charset: string | null = 'utf8') => readFileSync(filename, charset);

const readFixture = (filename: string, charset: string | null = 'utf8') => readFileSync(`${__dirname}/../../__fixtures__/${filename}`, charset);

const files = {
  'package.json': readFixture('package.json'),
  'yarn.lock': readFixture('yarn.lock'),
  '.eslintrc': readFixture('.eslintrc'),
  '.stylelintrc': readFixture('.stylelintrc'),
  // rollup
  'src/components/button/Button.vue': readFixture('src/components/button/Button.vue'),
  'src/components/button/index.js': readFixture('src/components/button/index.js'),
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
    const { api, cleanup, run } = await createFakeEnv(files, 'production', true);

    await run('yarn'); // install dependencies
    await api.executeCommand('build'); // we could use `yarn build`, but we won't have access to mocked `console.info`

    // should have built files with Rollup handler
    expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: rollup :: start bundling "button.js"');
    expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: rollup :: finished bundling "button.js"');

    expect(existsSync(api.resolve('dist/js/button.js'))).toBeTruthy();
    expect(existsSync(api.resolve('dist/js/button.js.map'))).toBeTruthy();
    expect(readFile(api.resolve('dist/js/button.js'))).toContain(
      '{name:"Button",props:{text:String},created:function(){console.log("Hello from Button.vue!")}};'
    );
    expect(readFile(api.resolve('dist/js/button.js'))).toContain('fn.component("y-button",');
    expect(readFile(api.resolve('dist/js/button.js'))).toContain('console.log("Hello from index.js!")');

    // should have built files with JS handler
    expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: js :: start bundling "scripts.js"');
    expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: js :: finished bundling "scripts.js"');

    expect(existsSync(api.resolve('dist/js/scripts.js'))).toBeTruthy();
    expect(existsSync(api.resolve('dist/js/scripts.js.map'))).toBeTruthy();
    expect(readFile(api.resolve('dist/js/scripts.js'))).toMatchSnapshot('prod js');

    // should have built files with CSS
    expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: css :: start bundling "legacy-styles.css"');
    expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: css :: finished bundling "legacy-styles.css"');

    expect(existsSync(api.resolve('dist/css/legacy-styles.css'))).toBeTruthy();
    expect(existsSync(api.resolve('dist/css/legacy-styles.css.map'))).toBeTruthy();
    expect(readFile(api.resolve('dist/css/legacy-styles.css'))).toMatchSnapshot('prod css');

    // should have built files with Sass handler
    expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: sass :: start bundling "styles.css"');
    expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: sass :: finished bundling "styles.css"');

    expect(existsSync(api.resolve('dist/css/styles.css'))).toBeTruthy();
    expect(existsSync(api.resolve('dist/css/styles.css.map'))).toBeTruthy();
    expect(readFile(api.resolve('dist/css/styles.css'))).toMatchSnapshot('prod sass');

    // should have copied files
    expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: file :: start copying "files to copy"');
    expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: file :: done copying "files to copy"');

    expect(readFile(api.resolve('dist/lorem.txt'))).toEqual(readFile(api.resolve('src/lorem.txt')));
    expect(readFile(api.resolve('dist/lorem.txt'))).toContain('Lorem ipsum dolor sit amet.');

    expect(readFile(api.resolve('dist/udhr.txt'))).toEqual(readFile(api.resolve('src/udhr.txt')));
    expect(readFile(api.resolve('dist/udhr.txt'))).toContain('Universal Declaration of Human Rights - English');

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
    const { api, cleanup, run } = await createFakeEnv(files, 'development', true);

    await run('yarn'); // install dependencies
    await api.executeCommand('build'); // we could use `yarn build`, but we won't have access to mocked `console.info`

    // should have built files with Rollup handler
    expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: rollup :: start bundling "button.js"');
    expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: rollup :: finished bundling "button.js"');

    expect(existsSync(api.resolve('dist/js/button.js'))).toBeTruthy();
    expect(existsSync(api.resolve('dist/js/button.js.map'))).toBeFalsy();
    expect(readFile(api.resolve('dist/js/button.js'))).toContain('// For security concerns, we use only base name in production mode.');
    expect(readFile(api.resolve('dist/js/button.js'))).toContain("Vue.component('y-button', Button);");
    expect(readFile(api.resolve('dist/js/button.js'))).toContain("'Hello from Button.vue!'");
    expect(readFile(api.resolve('dist/js/button.js'))).toContain('"Hello from index.js!"');

    // should have built files with JS handler
    expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: js :: start bundling "scripts.js"');
    expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: js :: finished bundling "scripts.js"');

    expect(existsSync(api.resolve('dist/js/scripts.js'))).toBeTruthy();
    expect(existsSync(api.resolve('dist/js/scripts.js.map'))).toBeFalsy();
    expect(readFile(api.resolve('dist/js/scripts.js'))).toMatchSnapshot('dev js');

    // should have built files with CSS
    expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: css :: start bundling "legacy-styles.css"');
    expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: css :: finished bundling "legacy-styles.css"');

    expect(existsSync(api.resolve('dist/css/legacy-styles.css'))).toBeTruthy();
    expect(existsSync(api.resolve('dist/css/legacy-styles.css.map'))).toBeFalsy();
    expect(readFile(api.resolve('dist/css/legacy-styles.css'))).toMatchSnapshot('dev css');

    // should have built files with Sass handler
    expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: sass :: start bundling "styles.css"');
    expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: sass :: finished bundling "styles.css"');

    expect(existsSync(api.resolve('dist/css/styles.css'))).toBeTruthy();
    expect(existsSync(api.resolve('dist/css/styles.css.map'))).toBeFalsy();
    expect(readFile(api.resolve('dist/css/styles.css'))).toMatchSnapshot('dev sass');

    // should have copied files
    expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: file :: start copying "files to copy"');
    expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: file :: done copying "files to copy"');

    expect(readFile(api.resolve('dist/lorem.txt'))).toEqual(readFile(api.resolve('src/lorem.txt')));
    expect(readFile(api.resolve('dist/lorem.txt'))).toContain('Lorem ipsum dolor sit amet.');

    expect(readFile(api.resolve('dist/udhr.txt'))).toEqual(readFile(api.resolve('src/udhr.txt')));
    expect(readFile(api.resolve('dist/udhr.txt'))).toContain('Universal Declaration of Human Rights - English');

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
    const { api, cleanup, run } = await createFakeEnv(files, 'development', true);

    await run('yarn'); // install dependencies
    await api.executeCommand('build', { 'filter:handler': 'css' }); // we could use `yarn build`, but we won't have access to mocked `console.info`

    expect(console.log).toHaveBeenCalledWith("[08:30:00] log :: Filtering assets where `asset.handler === 'css'`"); // verbose mode

    // should have built files with CSS handler
    expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: css :: start bundling "legacy-styles.css"');
    expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: css :: finished bundling "legacy-styles.css"');
    expect(existsSync(api.resolve('dist/css/legacy-styles.css'))).toBeTruthy();
    expect(existsSync(api.resolve('dist/css/legacy-styles.css.map'))).toBeFalsy();

    // other handlers should not have been called

    // rollup
    expect(console.info).not.toHaveBeenCalledWith('[08:30:00] info :: rollup :: start bundling "button.js"');
    expect(console.info).not.toHaveBeenCalledWith('[08:30:00] info :: rollup :: finished bundling "button.js"');
    expect(existsSync(api.resolve('dist/js/button.js'))).toBeFalsy();
    expect(existsSync(api.resolve('dist/js/button.js.map'))).toBeFalsy();

    // js
    expect(console.info).not.toHaveBeenCalledWith('[08:30:00] info :: js :: start bundling "scripts.js"');
    expect(console.info).not.toHaveBeenCalledWith('[08:30:00] info :: js :: finished bundling "scripts.js"');
    expect(existsSync(api.resolve('dist/js/scripts.js'))).toBeFalsy();
    expect(existsSync(api.resolve('dist/js/scripts.js.map'))).toBeFalsy();

    // sass
    expect(console.info).not.toHaveBeenCalledWith('[08:30:00] info :: sass :: start bundling "styles.css"');
    expect(console.info).not.toHaveBeenCalledWith('[08:30:00] info :: sass :: finished bundling "styles.css"');
    expect(existsSync(api.resolve('dist/css/styles.css'))).toBeFalsy();
    expect(existsSync(api.resolve('dist/css/styles.css.map'))).toBeFalsy();

    // files
    expect(console.info).not.toHaveBeenCalledWith('[08:30:00] info :: file :: start copying "files to copy"');
    expect(console.info).not.toHaveBeenCalledWith('[08:30:00] info :: file :: done copying "files to copy"');
    expect(existsSync(api.resolve('dist/lorem.txt'))).toBeFalsy();
    expect(existsSync(api.resolve('dist/udhr.txt'))).toBeFalsy();

    // images
    expect(console.info).not.toHaveBeenCalledWith('[08:30:00] info :: image :: start optimizing "images to optimize"');
    expect(console.info).not.toHaveBeenCalledWith('[08:30:00] info :: image :: done optimizing "images to optimize"');
    expect(existsSync(api.resolve('dist/images/guts-white-hair.png'))).toBeFalsy();
    expect(existsSync(api.resolve('dist/images/jax.jpg'))).toBeFalsy();
    expect(existsSync(api.resolve('dist/images/golfer.gif'))).toBeFalsy();
    expect(existsSync(api.resolve('dist/images/uk.svg'))).toBeFalsy();

    await cleanup();
  }, 70000);

  it('should build only css and sass entries (filter on `css` and `sass` handlers)', async () => {
    const { api, cleanup, run } = await createFakeEnv(files, 'development', true);

    await run('yarn'); // install dependencies
    await api.executeCommand('build', { 'filter:handler': ['css', 'sass'] }); // we could use `yarn build`, but we won't have access to mocked `console.info`

    expect(console.log).toHaveBeenCalledWith("[08:30:00] log :: Filtering assets where `['css', 'sass'].includes(asset.handler)`"); // verbose mode

    // should have built files with CSS handler
    expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: css :: start bundling "legacy-styles.css"');
    expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: css :: finished bundling "legacy-styles.css"');
    expect(existsSync(api.resolve('dist/css/legacy-styles.css'))).toBeTruthy();
    expect(existsSync(api.resolve('dist/css/legacy-styles.css.map'))).toBeFalsy();

    // should have built files with Sass handler
    expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: sass :: start bundling "styles.css"');
    expect(console.info).toHaveBeenCalledWith('[08:30:00] info :: sass :: finished bundling "styles.css"');
    expect(existsSync(api.resolve('dist/css/styles.css'))).toBeTruthy();
    expect(existsSync(api.resolve('dist/css/styles.css.map'))).toBeFalsy();

    // other handlers should not have been called

    // rollup
    expect(console.info).not.toHaveBeenCalledWith('[08:30:00] info :: rollup :: start bundling "button.js"');
    expect(console.info).not.toHaveBeenCalledWith('[08:30:00] info :: rollup :: finished bundling "button.js"');
    expect(existsSync(api.resolve('dist/js/button.js'))).toBeFalsy();
    expect(existsSync(api.resolve('dist/js/button.js.map'))).toBeFalsy();

    // js
    expect(console.info).not.toHaveBeenCalledWith('[08:30:00] info :: js :: start bundling "scripts.js"');
    expect(console.info).not.toHaveBeenCalledWith('[08:30:00] info :: js :: finished bundling "scripts.js"');
    expect(existsSync(api.resolve('dist/js/scripts.js'))).toBeFalsy();
    expect(existsSync(api.resolve('dist/js/scripts.js.map'))).toBeFalsy();

    // files
    expect(console.info).not.toHaveBeenCalledWith('[08:30:00] info :: file :: start copying "files to copy"');
    expect(console.info).not.toHaveBeenCalledWith('[08:30:00] info :: file :: done copying "files to copy"');
    expect(existsSync(api.resolve('dist/lorem.txt'))).toBeFalsy();
    expect(existsSync(api.resolve('dist/udhr.txt'))).toBeFalsy();

    // images
    expect(console.info).not.toHaveBeenCalledWith('[08:30:00] info :: image :: start optimizing "images to optimize"');
    expect(console.info).not.toHaveBeenCalledWith('[08:30:00] info :: image :: done optimizing "images to optimize"');
    expect(existsSync(api.resolve('dist/images/guts-white-hair.png'))).toBeFalsy();
    expect(existsSync(api.resolve('dist/images/jax.jpg'))).toBeFalsy();
    expect(existsSync(api.resolve('dist/images/golfer.gif'))).toBeFalsy();
    expect(existsSync(api.resolve('dist/images/uk.svg'))).toBeFalsy();

    await cleanup();
  }, 70000);

  describe('lint before build', () => {
    it('should check lint (of handler `rollup`) before building them', async () => {
      const { api, cleanup, run } = await createFakeEnv(files, 'development', true);

      await run('yarn'); // install dependencies
      await api.executeCommand('build', {
        'filter:handler': 'rollup',
        lint: true,
      }); // we could use `yarn build`, but we won't have access to mocked `console.info`

      expect(console.error).toHaveBeenCalledWith('[08:30:00] error :: Your JavaScript is not clean, stopping.');
      expect(process.exit).toHaveBeenCalledWith(1);

      await cleanup();
    }, 70000);

    it('should check lint (of handler `js`) before building them', async () => {
      const { api, cleanup, run } = await createFakeEnv(files, 'development', true);

      await run('yarn'); // install dependencies
      await api.executeCommand('build', {
        'filter:handler': 'js',
        lint: true,
      }); // we could use `yarn build`, but we won't have access to mocked `console.info`

      expect(console.error).toHaveBeenCalledWith('[08:30:00] error :: Your JavaScript is not clean, stopping.');
      expect(process.exit).toHaveBeenCalledWith(1);

      await cleanup();
    }, 70000);

    it('should check lint (of handler `css`) before building them', async () => {
      const { api, cleanup, run } = await createFakeEnv(files, 'development', true);

      await run('yarn'); // install dependencies
      await api.executeCommand('build', {
        'filter:handler': 'css',
        lint: true,
      }); // we could use `yarn build`, but we won't have access to mocked `console.info`

      expect(console.error).toHaveBeenCalledWith('[08:30:00] error :: Your CSS is not clean, stopping.');
      expect(process.exit).toHaveBeenCalledWith(1);

      await cleanup();
    }, 70000);

    it('should check lint (of handler `sass`) before building them', async () => {
      const { api, cleanup, run } = await createFakeEnv(files, 'development', true);

      await run('yarn'); // install dependencies
      await api.executeCommand('build', {
        'filter:handler': 'sass',
        lint: true,
      }); // we could use `yarn build`, but we won't have access to mocked `console.info`

      expect(console.error).toHaveBeenCalledWith('[08:30:00] error :: Your Sass is not clean, stopping.');
      expect(process.exit).toHaveBeenCalledWith(1);

      await cleanup();
    }, 70000);
  });
});
