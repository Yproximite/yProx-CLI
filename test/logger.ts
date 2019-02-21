import Logger from '@kocal/logger';

export const mockLogger = () => {
  getLogger().debug = jest.fn();
  getLogger().log = jest.fn();
  getLogger().info = jest.fn();
  getLogger().warn = jest.fn();
  getLogger().error = jest.fn();
};
export const unmockLogger = () => {
  // @ts-ignore
  getLogger().debug.mockRestore();
  // @ts-ignore
  getLogger().log.mockRestore();
  // @ts-ignore
  getLogger().info.mockRestore();
  // @ts-ignore
  getLogger().warn.mockRestore();
  // @ts-ignore
  getLogger().error.mockRestore();
};

function getLogger() {
  return Logger.getLogger('yprox-cli');
}
