let nodeEnv: string | undefined = '';

export const saveEnv = (): void => {
  nodeEnv = process.env.NODE_ENV;
  delete process.env.NODE_ENV; // otherwise, it will not be set by yProx-CLI
};

export const restoreEnv = (): void => {
  process.env.NODE_ENV = nodeEnv;
};
