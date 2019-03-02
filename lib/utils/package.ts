export const isPackageInstalled = (packageName: string): boolean => {
  try {
    require.resolve(packageName);
    return true;
  } catch (e) {}

  return false;
};
