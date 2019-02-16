import { loadEnv } from '../../../lib/utils/loadEnv';

describe('utils: loadEnv', () => {
  describe('loadEnv', () => {
    let oldEnv = {};
    beforeEach(() => {
      oldEnv = process.env;
    });
    afterEach(() => {
      process.env = oldEnv;
    });

    it('should load env vars without overload them', () => {
      expect(process.env.APP_NAME).toBeUndefined();
      expect(process.env.NODE_ENV).toBe('test'); // injected by jest
      expect(process.env.API_KEY).toBeUndefined();

      loadEnv(`${__dirname}/../../fixtures/env/.env.prod`);
      loadEnv(`${__dirname}/../../fixtures/env/.env`);
      expect(process.env.APP_NAME).toBe('My app'); // .env
      expect(process.env.NODE_ENV).toBe('test'); // not overloaded because already defined
      expect(process.env.API_KEY).toBe('api key for prod env'); // .env.prod
    });
  });
});
