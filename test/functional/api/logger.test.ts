import chalk = require('chalk');
import { advanceTo, clear } from 'jest-date-mock';
import { mockConsole, unmockConsole } from '../../console';
import { createFakeEnv } from '../fake-env';

describe('logger', () => {
  beforeAll(() => {
    advanceTo(new Date(2019, 12, 8, 8, 5, 1));
  });

  afterAll(() => {
    clear();
  });

  test.each([
    { method: 'error', colorLevel: 'redBright' },
    { method: 'warn', colorLevel: 'yellow' },
    { method: 'info', colorLevel: 'blue' },
    // "log" is called only in verbose mode
    { method: 'log', colorLevel: 'green', shouldBeCalled: false },
    { method: 'log', colorLevel: 'green', shouldBeCalled: true, verbose: true },
    // "debug" is never called
    { method: 'debug', colorLevel: 'cyanBright', shouldBeCalled: false },
    { method: 'debug', colorLevel: 'cyanBright', shouldBeCalled: false, verbose: true },
  ])('%p', async ({ method, colorLevel, shouldBeCalled = true, verbose = false }) => {
    mockConsole([method]);

    const { api } = await createFakeEnv({ verbose });
    console.warn(method, colorLevel, shouldBeCalled, verbose);
    console.warn(api);
    console.warn(api.logger);

    // @ts-ignore
    api.logger[method](`${method} message`);

    if (shouldBeCalled) {
      // @ts-ignore
      expect(console[method]).toHaveBeenCalledWith(chalk`[{blue 08:05:01}] {${colorLevel} ${method}} :: ${method} message`);
    } else {
      // @ts-ignore
      expect(console[method]).not.toHaveBeenCalled();
    }

    unmockConsole([method]);
  });
});
