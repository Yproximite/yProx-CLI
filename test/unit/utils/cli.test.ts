import { displayCommandHelp, displayHelp } from '../../../lib/utils/cli';

describe('utils: cli', () => {
  const commands = {
    build: {
      name: 'build',
      fn: () => Promise.resolve(1),
      opts: {
        description: 'Build files',
        usage: 'yprox-cli build [options]',
        options: { '--lint': 'Lint before build' },
      },
    },
    lint: {
      name: 'lint',
      fn: () => Promise.resolve(2),
      opts: {
        description: 'Lint files',
        usage: 'yprox-cli lint [options]',
        options: { '--fix': 'Fix some errors' },
      },
    },
  };

  describe('show global help', () => {
    it('should show global help', () => {
      let output = '';
      console.log = jest.fn(data => (output += `${data || ''}\n`));

      displayHelp(commands);
      expect(output).toMatchSnapshot();
    });
  });

  describe('show a specific command help', () => {
    it('should show help for `build` command', () => {
      let output = '';
      console.log = jest.fn(data => (output += `${data || ''}\n`));

      displayCommandHelp('build', commands.build);
      expect(output).toMatchSnapshot();
    });

    it('should show help for `lint` command', () => {
      let output = '';
      console.log = jest.fn(data => (output += `${data || ''}\n`));

      displayCommandHelp('lint', commands.lint);
      expect(output).toMatchSnapshot();
    });
  });
});
