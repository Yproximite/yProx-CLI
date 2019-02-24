import chalk from 'chalk';
import { readFixture } from '../../fixtures';
import { mockLogger, unmockLogger } from '../../logger';
import { createFakeEnv } from '../fake-env';

const packageJson = readFixture('configuration/package.json');
const yproxCliConfigJs = readFixture('configuration/yprox-cli.config.js');

describe('api: configuration', () => {
  beforeEach(() => {
    mockLogger();
    // @ts-ignore
    process.exit = jest.fn();
  });

  afterEach(() => {
    unmockLogger();
    // @ts-ignore
    process.exit.mockRestore();
  });

  it('should load conf from `yprox-cli.config.js`', async () => {
    const { api, cleanup } = await createFakeEnv({
      files: {
        'yprox-cli.config.js': yproxCliConfigJs,
      },
    });

    expect(api.projectOptions).toMatchSnapshot();

    await cleanup();
  });

  it('should load conf from `package.json`', async () => {
    const { api, cleanup } = await createFakeEnv({
      files: {
        'package.json': packageJson,
      },
    });

    expect(api.projectOptions).toMatchSnapshot();

    await cleanup();
  });

  it('should throw an error when having both config from `package.json` and `yprox-cli.config.js`', async () => {
    const { api, cleanup } = await createFakeEnv({
      files: {
        'package.json': packageJson,
        'yprox-cli.config.js': yproxCliConfigJs,
      },
    });

    expect(process.exit).toHaveBeenCalledWith(1);
    expect(api.logger.error).toHaveBeenNthCalledWith(1, 'Your configuration is invalid.');
    expect(api.logger.error).toHaveBeenNthCalledWith(
      2,
      chalk`You can't configure yprox-cli with {blue.bold yprox-cli.config.js} and {blue.bold package.json} at the same time.`
    );

    await cleanup();
  });

  it('with YPROX_CLI_IGNORE_CONFIG_FILE=true, should load config from `package.json` even if we have two config files', async () => {
    process.env.YPROX_CLI_IGNORE_CONFIG_FILE = 'true';

    const { api, cleanup } = await createFakeEnv({
      files: {
        'package.json': packageJson,
        'yprox-cli.config.js': yproxCliConfigJs,
      },
    });

    expect(api.projectOptions).toMatchSnapshot();

    await cleanup();
    delete process.env.YPROX_CLI_IGNORE_CONFIG_FILE;
  });

  it('with YPROX_CLI_IGNORE_PACKAGE_JSON_FILE=true, should load config from `yprox-cli.config.js` even if we have two config files', async () => {
    process.env.YPROX_CLI_IGNORE_PACKAGE_JSON_FILE = 'true';

    const { api, cleanup } = await createFakeEnv({
      files: {
        'package.json': packageJson,
        'yprox-cli.config.js': yproxCliConfigJs,
      },
    });

    expect(api.projectOptions).toMatchSnapshot();

    await cleanup();
    delete process.env.YPROX_CLI_IGNORE_PACKAGE_JSON_FILE;
  });
});
