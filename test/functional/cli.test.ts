import API from '../../lib/API';
import CLI from '../../lib/CLI';
import * as cliUtil from '../../lib/utils/cli';

describe('cli', () => {
  beforeEach(() => {
    // @ts-ignore
    cliUtil.displayHelp = jest.fn();
    // @ts-ignore
    cliUtil.displayCommandHelp = jest.fn();

    console.log = jest.fn();
  });

  beforeEach(() => {
    // @ts-ignore
    console.log.mockRestore();
  });

  it('should init the API only one time', () => {
    const cli = new CLI(__dirname);

    // @ts-ignore Private property
    expect(cli.initialized).toBeFalsy();
    // @ts-ignore Private property
    expect(cli.api).toBeUndefined();

    cli.init();

    // @ts-ignore Private property
    expect(cli.initialized).toBeTruthy();
    // @ts-ignore Private property
    expect(cli.api).toBeInstanceOf(API);
    // @ts-ignore Private property
    const { api } = cli;

    // Second time
    cli.init();

    // We still have the same instance
    // @ts-ignore Private property
    expect(cli.api).toBe(api);
  });

  it('should display the help when no args are passed', async () => {
    const cli = new CLI(__dirname);
    cli.init();

    await cli.run('');

    expect(cliUtil.displayHelp).toHaveBeenCalled();
  });

  it('should display current yprox-cli version', async () => {
    const cli = new CLI(__dirname);
    cli.init();

    await cli.run('', {
      version: true,
    });

    expect(console.log).toHaveBeenCalledWith('0.0.0-development');
  });

  it('should display the help of command `build`', async () => {
    const cli = new CLI(__dirname);
    cli.init();

    await cli.run('build', {
      help: true,
    });

    // @ts-ignore
    expect(cliUtil.displayCommandHelp).toHaveBeenCalledWith('build', cli.api.commands.build);
  });

  it('should display the help of command `lint`', async () => {
    const cli = new CLI(__dirname);
    cli.init();

    await cli.run('lint', {
      help: true,
    });

    // @ts-ignore
    expect(cliUtil.displayCommandHelp).toHaveBeenCalledWith('lint', cli.api.commands.lint);
  });

  it('should execute command `build`', async () => {
    const cli = new CLI(__dirname);
    cli.init();

    // @ts-ignore Private property
    cli.api.commands.build.fn = jest.fn(() => Promise.resolve());
    await cli.run('build');

    // @ts-ignore Private property
    expect(cli.api.commands.build.fn).toHaveBeenCalledWith({});
  });

  it('should execute command `lint`', async () => {
    const cli = new CLI(__dirname);
    cli.init();

    // @ts-ignore Private property
    cli.api.commands.lint.fn = jest.fn(() => Promise.resolve());
    await cli.run('lint');

    // @ts-ignore Private property
    expect(cli.api.commands.lint.fn).toHaveBeenCalledWith({});
  });
});
