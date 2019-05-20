import { createFakeEnv } from '../fake-env';

const loadEnv = require('../../../lib/utils/loadEnv');

const files = {
  // .env files for prod (and production) mode
  '.env.production.local': '',
  '.env.production': '',
  '.env.prod.local': '',
  '.env.prod': '',
  // .env files for dev (and development) mode
  '.env.development.local': '',
  '.env.development': '',
  '.env.dev.local': '',
  '.env.dev': '',
  // .env files for test mode
  '.env.test.local': '',
  '.env.test': '',
  // default env files
  '.env.local': '',
  '.env': '',
  // specific
  '.env.foobar': '',
};

describe('api: env', () => {
  let oldEnv = process.env;

  beforeEach(() => {
    oldEnv = process.env;
    loadEnv.loadEnv = jest.fn();
  });

  afterEach(() => {
    process.env = oldEnv;
    loadEnv.loadEnv.mockRestore();
  });

  it('should load env vars from default (dev) mode and default env vars files', async () => {
    await createFakeEnv({ files });

    expect(loadEnv.loadEnv.mock.calls).toHaveLength(6);
    expect(loadEnv.loadEnv.mock.calls[0][0]).toMatch(/.env.development.local$/);
    expect(loadEnv.loadEnv.mock.calls[1][0]).toMatch(/.env.development$/);
    expect(loadEnv.loadEnv.mock.calls[2][0]).toMatch(/.env.dev.local$/); // alias
    expect(loadEnv.loadEnv.mock.calls[3][0]).toMatch(/.env.dev$/); // alias
    expect(loadEnv.loadEnv.mock.calls[4][0]).toMatch(/.env.local$/);
    expect(loadEnv.loadEnv.mock.calls[5][0]).toMatch(/.env$/);
  });

  it('should load env vars from production mode and default env vars file', async () => {
    await createFakeEnv({ files, mode: 'production' });

    expect(loadEnv.loadEnv.mock.calls).toHaveLength(6);
    expect(loadEnv.loadEnv.mock.calls[0][0]).toMatch(/.env.production.local$/);
    expect(loadEnv.loadEnv.mock.calls[1][0]).toMatch(/.env.production$/);
    expect(loadEnv.loadEnv.mock.calls[2][0]).toMatch(/.env.prod.local$/); // alias
    expect(loadEnv.loadEnv.mock.calls[3][0]).toMatch(/.env.prod$/); // alias
    expect(loadEnv.loadEnv.mock.calls[4][0]).toMatch(/.env.local$/);
    expect(loadEnv.loadEnv.mock.calls[5][0]).toMatch(/.env$/);
  });

  it('should load env vars from a specific mode', async () => {
    await createFakeEnv({ files, mode: 'test' });

    expect(loadEnv.loadEnv.mock.calls).toHaveLength(4);
    expect(loadEnv.loadEnv.mock.calls[0][0]).toMatch(/.env.test.local$/);
    expect(loadEnv.loadEnv.mock.calls[1][0]).toMatch(/.env.test$/);
    expect(loadEnv.loadEnv.mock.calls[2][0]).toMatch(/.env.local$/);
    expect(loadEnv.loadEnv.mock.calls[3][0]).toMatch(/.env$/);
  });

  it('should not load env vars from a file that does not exists', async () => {
    await createFakeEnv({ files, mode: 'foobar' });

    expect(loadEnv.loadEnv.mock.calls).toHaveLength(3);
    expect(loadEnv.loadEnv.mock.calls[0][0]).not.toMatch(/.env.foobar.local$/);
    expect(loadEnv.loadEnv.mock.calls[0][0]).toMatch(/.env.foobar$/);
    expect(loadEnv.loadEnv.mock.calls[1][0]).toMatch(/.env.local$/);
    expect(loadEnv.loadEnv.mock.calls[2][0]).toMatch(/.env$/);
  });

  describe('getSafeEnvVars', () => {
    it('should only return safe env vars', async () => {
      const { api } = await createFakeEnv();

      expect(process.env.NODE_ENV).toBe('test'); // safe
      process.env.APP_NAME = 'My app'; // safe
      process.env.APP_API_KEY = '<api key>'; // safe
      process.env.YPROX_CLI_FOOBAR = 'Foo'; // not safe, does starts with APP_ or not NODE_ENV

      expect(api.getSafeEnvVars()).toEqual({
        NODE_ENV: 'test',
        APP_NAME: 'My app',
        APP_API_KEY: '<api key>',
      });
    });
  });
});
