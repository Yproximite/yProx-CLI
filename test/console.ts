const consoleMethods = ['debug', 'log', 'info', 'warn', 'error'];

export const mockConsole = (methodsToMock = consoleMethods): void => {
  methodsToMock.forEach(methodToMock => {
    // @ts-ignore
    console[methodToMock] = jest.fn();
  });
};

export const unmockConsole = (methodsToMock = consoleMethods): void => {
  methodsToMock.forEach(methodToMock => {
    // @ts-ignore
    console[methodToMock].mockRestore();
  });
};
