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

  it('should log', async () => {
    mockConsole(['error', 'warn', 'info', 'log']);

    const { api } = await createFakeEnv({ verbose: true });

    api.logger.error('error message');
    expect(console.error).toHaveBeenCalledWith(chalk`[{blue 08:05:01}] {redBright error} :: error message`);

    api.logger.warn('warn message');
    expect(console.warn).toHaveBeenCalledWith(chalk`[{blue 08:05:01}] {yellow warn} :: warn message`);

    api.logger.info('info message');
    expect(console.info).toHaveBeenCalledWith(chalk`[{blue 08:05:01}] {blue info} :: info message`);

    api.logger.log('log message');
    expect(console.log).toHaveBeenCalledWith(chalk`[{blue 08:05:01}] {green log} :: log message`);

    unmockConsole(['error', 'warn', 'info', 'log']);
  });
});
