import { createFakeEnv } from '../fake-env';
import { advanceTo, clear } from 'jest-date-mock';

describe('logger', () => {
  beforeAll(() => {
    advanceTo(new Date(2019, 12, 8, 12, 20, 50));
  });

  afterAll(() => {
    clear();
  });

  it('should log', async () => {
    const { api } = await createFakeEnv();

    console.warn = jest.fn();
    console.error = jest.fn();
    api.logger.warn('qsdqsd');
    api.logger.error('qsdqsd');
    // @ts-ignore
    console.info(console.warn.mock.calls);
    // @ts-ignore
    console.info(console.error.mock.calls);
  });
});
