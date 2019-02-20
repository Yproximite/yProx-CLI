import API from '../../../lib/API';
import { getEntryName, readEntries } from '../../../lib/utils/entry';
import { Entry } from '../../../types/entry';

const createEntry = (opts: { [K in keyof Entry]?: Entry[K] } = {}): Entry => ({
  handler: 'css',
  src: ['a.css', 'b.css'],
  dest: 'dist',
  ...opts,
});

describe('utils: entry', () => {
  describe('getEntryName()', () => {
    it('it should return `name` value', () => {
      const entry = createEntry({ name: 'the name', destFile: 'the destFile', concat: 'the concat' });
      expect(getEntryName(entry)).toEqual('the name');
    });

    it('if there is no `name`, fallback on `destFile`', () => {
      const entry = createEntry({ destFile: 'the destFile', concat: 'the concat' });
      expect(getEntryName(entry)).toEqual('the destFile');
    });

    it('if there is no `destFile`, fallback on `concat`', () => {
      const entry = createEntry({ concat: 'the concat' });
      expect(getEntryName(entry)).toEqual('the concat');
    });

    it('if there is no `concat`, fallback on `src`', () => {
      const entry = createEntry({});
      expect(getEntryName(entry)).toEqual('a.css, b.css');
    });
  });

  describe('readEntries()', () => {
    const api = new API(__dirname);
    api.projectOptions.assets = {
      app: [
        createEntry({ name: 'app-css', handler: 'css', src: ['app.css'] }),
        createEntry({ name: 'app-sass', handler: 'sass', src: ['app.sass'] }),
        createEntry({ name: 'app-rollup', handler: 'rollup', src: ['app.js'] }),
      ],
      vendor: [createEntry({ name: 'vendor-css', handler: 'css', src: ['vendor.css'] })],
    };

    it('should returns all entries', () => {
      const args = {};
      const filteredEntries = readEntries(api, args);

      expect(filteredEntries).toEqual([
        { name: 'app-css', handler: 'css', src: [`${__dirname}/app.css`], _name: 'app', dest: `${__dirname}/dist` },
        { name: 'app-sass', handler: 'sass', src: [`${__dirname}/app.sass`], _name: 'app', dest: `${__dirname}/dist` },
        { name: 'app-rollup', handler: 'rollup', src: [`${__dirname}/app.js`], _name: 'app', dest: `${__dirname}/dist` },
        { name: 'vendor-css', handler: 'css', src: [`${__dirname}/vendor.css`], _name: 'vendor', dest: `${__dirname}/dist` },
      ]);
    });

    it('should filter CSS entries', () => {
      const args = { 'filter:handler': 'css' };
      const filteredEntries = readEntries(api, args);

      expect(filteredEntries).toEqual([
        { name: 'app-css', handler: 'css', src: [`${__dirname}/app.css`], _name: 'app', dest: `${__dirname}/dist` },
        { name: 'vendor-css', handler: 'css', src: [`${__dirname}/vendor.css`], _name: 'vendor', dest: `${__dirname}/dist` },
      ]);
    });

    it('should filter Sass and CSS entries', () => {
      const args = { 'filter:handler': ['sass', 'css'] };
      const filteredEntries = readEntries(api, args);

      expect(filteredEntries).toEqual([
        { name: 'app-css', handler: 'css', src: [`${__dirname}/app.css`], _name: 'app', dest: `${__dirname}/dist` },
        { name: 'app-sass', handler: 'sass', src: [`${__dirname}/app.sass`], _name: 'app', dest: `${__dirname}/dist` },
        { name: 'vendor-css', handler: 'css', src: [`${__dirname}/vendor.css`], _name: 'vendor', dest: `${__dirname}/dist` },
      ]);
    });

    it('should filter entries from "app" assets', () => {
      const args = { 'filter:_name': 'app' };
      const filteredEntries = readEntries(api, args);

      expect(filteredEntries).toEqual([
        { name: 'app-css', handler: 'css', src: [`${__dirname}/app.css`], _name: 'app', dest: `${__dirname}/dist` },
        { name: 'app-sass', handler: 'sass', src: [`${__dirname}/app.sass`], _name: 'app', dest: `${__dirname}/dist` },
        { name: 'app-rollup', handler: 'rollup', src: [`${__dirname}/app.js`], _name: 'app', dest: `${__dirname}/dist` },
      ]);
    });
  });
});
