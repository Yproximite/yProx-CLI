let nodeEnv: string | undefined = '';

export const saveEnv = () => {
  nodeEnv = process.env.NODE_ENV;
  delete process.env.NODE_ENV; // otherwise, it will not be set by yProx-CLI
};

export const restoreEnv = () => {
  process.env.NODE_ENV = nodeEnv;
};
