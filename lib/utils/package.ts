import API from '../API';

export const isPackageInstalled = (packageName: string, api: API): boolean => {
  try {
    require.resolve(packageName);
    return true;
  } catch (e) {}

  return false;
};
