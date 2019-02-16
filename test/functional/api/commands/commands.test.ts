import { createFakeEnv } from '../../fake-env';

describe('api: commands', () => {
  it('should have registered commands', async () => {
    const { api, cleanup } = await createFakeEnv();

    expect(api.commands.build).toBeDefined();
    expect(api.commands.lint).toBeDefined();
    expect(api.commands).toMatchSnapshot();

    await cleanup();
  });

  describe('executeCommand', () => {
    it('should throw an error if no command passed', async () => {
      const { api, cleanup } = await createFakeEnv();

      expect(() => {
        // @ts-ignore
        api.executeCommand();
      }).toThrow(new Error('You must specify a command to run.'));

      await cleanup();
    });

    it('should throw an error if a command is not registered', async () => {
      const { api, cleanup } = await createFakeEnv();

      expect(() => {
        api.executeCommand('foobar');
      }).toThrow(new Error('Command "foobar" does not exist.'));

      await cleanup();
    });

    it('should execute the correct command', async () => {
      const { api, cleanup } = await createFakeEnv();

      api.commands.build.fn = jest.fn();
      api.executeCommand('build', { lint: true });
      expect(api.commands.build.fn).toHaveBeenCalledWith({ lint: true });

      api.commands.lint.fn = jest.fn();
      api.executeCommand('lint');
      expect(api.commands.lint.fn).toHaveBeenCalledWith({});

      await cleanup();
    });
  });
});
