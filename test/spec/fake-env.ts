import * as fs from 'fs-extra';
import API from '../../lib/API';

let env = -1;

export const createFakeEnv = (files: { [k: string]: string }, mode = 'development', verbose = false): Promise<{ api: API; cleanup: () => void }> => {
  return new Promise(async resolve => {
    // Create new env
    env += 1;
    const context = `${__dirname}/envs/${env}`;
    await fs.mkdirp(context);

    // Create files
    await Promise.all(
      Object.entries(files).map(([filename, content]) => {
        return fs.outputFile(`${context}/${filename}`, content);
      })
    );

    // Create API and cleanup func
    const api = new API(context, mode, verbose);
    const cleanup = async () => {
      return await fs.remove(context);
    };

    resolve({ api, cleanup });
  });
};
