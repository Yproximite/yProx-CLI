import { flatten, groupBy } from '../../../lib/utils/array';

describe('utils: array', () => {
  describe('groupBy', () => {
    it('should group', () => {
      const items = [
        { handler: 'js', foo: '1' },
        { handler: 'js', foo: '2' },
        { handler: 'css', foo: '3' },
        { handler: 'css', foo: '4' },
        { handler: 'js', foo: '5' },
      ];
      const groupedItems = items.reduce(groupBy('handler'), {});

      expect(groupedItems).toEqual({
        js: [
          { handler: 'js', foo: '1' },
          { handler: 'js', foo: '2' },
          { handler: 'js', foo: '5' },
        ],
        css: [
          { handler: 'css', foo: '3' },
          { handler: 'css', foo: '4' },
        ],
      });
    });
  });

  describe('flatten', () => {
    it('should flatten', () => {
      const items = ['foo', 'bar', ['foo bar'], ['abc def']];
      const flattenedItems = items.reduce(flatten(), []);

      expect(flattenedItems).toEqual(['foo', 'bar', 'foo bar', 'abc def']);
    });
  });
});
