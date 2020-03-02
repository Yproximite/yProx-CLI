import path from 'path';
import API from '../../../lib/API';
import { getEntryName, readEntries } from '../../../lib/utils/entry';
import { Entry } from '../../../types/entry';
import { mockLogger, unmockLogger } from '../../logger';

const createEntry = (opts: Partial<Entry> = {}) =>
  <Entry>{
    handler: 'css',
    src: ['a.css', 'b.css'],
    dest: 'dist',
    ...opts,
  };

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
    let api: API;

    beforeEach(() => {
      api = new API(__dirname);
      api.projectOptions.assets = {
        app: [
          createEntry({ name: 'app-css', handler: 'css', src: ['app.css'] }),
          createEntry({ name: 'app-sass', handler: 'sass', src: ['app.sass'] }),
          createEntry({ name: 'app-js', handler: 'js', src: ['app.js'] }),
        ],
        vendor: [createEntry({ name: 'vendor-css', handler: 'css', src: ['vendor.css'] })],
      };
    });

    it('should returns all entries', () => {
      const args = {};
      const filteredEntries = readEntries(api, args);

      expect(filteredEntries).toEqual([
        { name: 'app-css', handler: 'css', src: [path.join(__dirname, `app.css`)], _name: 'app', dest: path.join(__dirname, `dist`), sourceMaps: false },
        { name: 'app-sass', handler: 'sass', src: [path.join(__dirname, `app.sass`)], _name: 'app', dest: path.join(__dirname, `dist`), sourceMaps: false },
        { name: 'app-js', handler: 'js', src: [path.join(__dirname, `app.js`)], _name: 'app', dest: path.join(__dirname, `dist`), sourceMaps: false },
        {
          name: 'vendor-css',
          handler: 'css',
          src: [path.join(__dirname, `vendor.css`)],
          _name: 'vendor',
          dest: path.join(__dirname, `dist`),
          sourceMaps: false,
        },
      ]);
    });

    it('should filter CSS entries', () => {
      const args = { 'filter:handler': 'css' };
      const filteredEntries = readEntries(api, args);

      expect(filteredEntries).toEqual([
        { name: 'app-css', handler: 'css', src: [path.join(__dirname, `app.css`)], _name: 'app', dest: path.join(__dirname, `dist`), sourceMaps: false },
        {
          name: 'vendor-css',
          handler: 'css',
          src: [path.join(__dirname, `vendor.css`)],
          _name: 'vendor',
          dest: path.join(__dirname, `dist`),
          sourceMaps: false,
        },
      ]);
    });

    it('should filter Sass and CSS entries', () => {
      const args = { 'filter:handler': ['sass', 'css'] };
      const filteredEntries = readEntries(api, args);

      expect(filteredEntries).toEqual([
        { name: 'app-css', handler: 'css', src: [path.join(__dirname, `app.css`)], _name: 'app', dest: path.join(__dirname, `dist`), sourceMaps: false },
        { name: 'app-sass', handler: 'sass', src: [path.join(__dirname, `app.sass`)], _name: 'app', dest: path.join(__dirname, `dist`), sourceMaps: false },
        {
          name: 'vendor-css',
          handler: 'css',
          src: [path.join(__dirname, `vendor.css`)],
          _name: 'vendor',
          dest: path.join(__dirname, `dist`),
          sourceMaps: false,
        },
      ]);
    });

    it('should filter entries from "app" assets', () => {
      const args = { 'filter:_name': 'app' };
      const filteredEntries = readEntries(api, args);

      expect(filteredEntries).toEqual([
        { name: 'app-css', handler: 'css', src: [path.join(__dirname, `app.css`)], _name: 'app', dest: path.join(__dirname, `dist`), sourceMaps: false },
        { name: 'app-sass', handler: 'sass', src: [path.join(__dirname, `app.sass`)], _name: 'app', dest: path.join(__dirname, `dist`), sourceMaps: false },
        { name: 'app-js', handler: 'js', src: [path.join(__dirname, `app.js`)], _name: 'app', dest: path.join(__dirname, `dist`), sourceMaps: false },
      ]);
    });

    it('should display an error if there is no entries', () => {
      mockLogger();
      // @ts-ignore
      process.exit = jest.fn();

      delete api.projectOptions.assets;
      readEntries(api, {});
      expect(api.logger.error).toHaveBeenCalledWith('No assets have been configured.');
      expect(api.logger.error).toHaveBeenCalledWith('See the documentation (https://yprox-cli.netlify.com/configuration.html#configuration) to know to do it!');
      expect(process.exit).toHaveBeenCalledWith(1);

      unmockLogger();
      // @ts-ignore
      process.exit.mockRestore();
    });

    it(`should enable source maps if it's production`, () => {
      api.isProduction = () => true;

      const args = {};
      const filteredEntries = readEntries(api, args);

      expect(filteredEntries).toEqual([
        { name: 'app-css', handler: 'css', src: [path.join(__dirname, `app.css`)], _name: 'app', dest: path.join(__dirname, `dist`), sourceMaps: true },
        { name: 'app-sass', handler: 'sass', src: [path.join(__dirname, `app.sass`)], _name: 'app', dest: path.join(__dirname, `dist`), sourceMaps: true },
        { name: 'app-js', handler: 'js', src: [path.join(__dirname, `app.js`)], _name: 'app', dest: path.join(__dirname, `dist`), sourceMaps: true },
        {
          name: 'vendor-css',
          handler: 'css',
          src: [path.join(__dirname, `vendor.css`)],
          _name: 'vendor',
          dest: path.join(__dirname, `dist`),
          sourceMaps: true,
        },
      ]);
    });
  });
});
