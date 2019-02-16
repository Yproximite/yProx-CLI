import { readFileSync } from 'fs';
import { createFakeEnv } from '../fake-env';

const packageJson = readFileSync(`${__dirname}/../fixtures/modern-project/package.json`, 'utf8');
const yproxCliConfigJs = readFileSync(`${__dirname}/../fixtures/modern-project/yprox-cli.config.js`, 'utf8');

describe('api: configuration', () => {
  beforeEach(() => {
    // @ts-ignore
    process.exit = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    // @ts-ignore
    process.exit.mockRestore();
    // @ts-ignore
    console.error.mockRestore();
  });

  it('should load conf from `yprox-cli.config.js`', async () => {
    const { api, cleanup } = await createFakeEnv({
      'yprox-cli.config.js': yproxCliConfigJs,
    });

    expect(api.projectOptions).toMatchSnapshot();

    await cleanup();
  });

  it('should load conf from `package.json`', async () => {
    const { api, cleanup } = await createFakeEnv({
      'package.json': packageJson,
    });

    expect(api.projectOptions).toMatchSnapshot();

    await cleanup();
  });

  it('should throw an error when having both config from `package.json` and `yprox-cli.config.js`', async () => {
    const { api, cleanup } = await createFakeEnv({
      'package.json': packageJson,
      'yprox-cli.config.js': yproxCliConfigJs,
    });

    expect(process.exit).toHaveBeenCalledWith(1);
    expect(console.error).toHaveBeenNthCalledWith(1, '[08:30:00] error :: Your configuration is invalid.');
    expect(console.error).toHaveBeenNthCalledWith(
      2,
      "[08:30:00] error :: You can't configure yprox-cli with yprox-cli.config.js and package.json at the same time."
    );

    await cleanup();
  });

  it('with YPROX_CLI_IGNORE_CONFIG_FILE=true, should load config from `package.json` even if we have two config files', async () => {
    process.env.YPROX_CLI_IGNORE_CONFIG_FILE = 'true';

    const { api, cleanup } = await createFakeEnv({
      'package.json': packageJson,
      'yprox-cli.config.js': yproxCliConfigJs,
    });

    expect(api.projectOptions).toMatchSnapshot();

    await cleanup();
    delete process.env.YPROX_CLI_IGNORE_CONFIG_FILE;
  });

  it('with YPROX_CLI_IGNORE_PACKAGE_JSON_FILE=true, should load config from `yprox-cli.config.js` even if we have two config files', async () => {
    process.env.YPROX_CLI_IGNORE_PACKAGE_JSON_FILE = 'true';

    const { api, cleanup } = await createFakeEnv({
      'package.json': packageJson,
      'yprox-cli.config.js': yproxCliConfigJs,
    });

    expect(api.projectOptions).toMatchSnapshot();

    await cleanup();
    delete process.env.YPROX_CLI_IGNORE_PACKAGE_JSON_FILE;
  });
});
