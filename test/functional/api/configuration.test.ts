import chalk from 'chalk';
import { readFixture } from '../../fixtures';
import { mockLogger, unmockLogger } from '../../logger';
import { createFakeEnv } from '../fake-env';

const yproxCliConfigJs = readFixture('configuration/yprox-cli.config.js');

describe('api: configuration', () => {
  beforeEach(() => {
    mockLogger();
  });

  afterEach(() => {
    unmockLogger();
  });

  it('should load conf from "yprox-cli.config.js"', async () => {
    const { api, cleanup } = await createFakeEnv({
      files: {
        'yprox-cli.config.js': yproxCliConfigJs,
      },
    });

    expect(api.projectOptions).toMatchSnapshot();

    await cleanup();
  });

  it('should warn when there is no "yprox-cli.config.js" file', async () => {
    const { api, cleanup } = await createFakeEnv();

    expect(api.logger.warn).toHaveBeenCalledWith(`The configuration file "${api.resolve('yprox-cli.config.js')}" does not exist. Using default configuration.`);

    await cleanup();
  });
});
