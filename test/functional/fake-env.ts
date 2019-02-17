import * as fs from 'fs-extra';
import util from 'util';
import API from '../../lib/API';

const exec = util.promisify(require('child_process').exec);

let env = -1;

type Files = { [k: string]: string | Buffer };
type FakeEnv = {
  api: API;
  cleanup: () => void;
  run: (command: string) => Promise<{ stdout: string; stderr: string }>;
  readFile: (filename: string, encoding?: string) => Promise<string>;
  writeFile: (filename: string, content: string) => Promise<void>;
  fileExists: (filename: string) => Promise<boolean>;
};

export const createFakeEnv = async (files: Files | string = {}, mode = 'development', verbose = false): Promise<FakeEnv> => {
  // Create new env
  env += 1;
  const context = `${__dirname}/envs/${env}`;
  await fs.mkdirp(context);

  // Create files
  if (typeof files === 'string') {
    await fs.copy(`${__dirname}/../fixtures/${files}`, context);
  } else {
    await Promise.all(
      Object.entries(files).map(([filename, content]) => {
        return fs.outputFile(`${context}/${filename}`, content);
      })
    );
  }

  // Create API and helpers funcs
  const api = new API(context, mode, verbose);

  const run = async (command: string): Promise<{ stdout: string; stderr: string }> => {
    return await exec(command, { cwd: context });
  };

  const cleanup = async () => {
    return await fs.remove(context);
  };

  const readFile = async (filename: string, encoding: string = 'utf8'): Promise<string> => {
    return await fs.readFile(api.resolve(filename), { encoding });
  };

  const writeFile = async (filename: string, content: string): Promise<void> => {
    return await fs.writeFile(api.resolve(filename), content);
  };

  const fileExists = async (filename: string): Promise<boolean> => {
    return await fs.pathExists(api.resolve(filename));
  };

  return { api, run, cleanup, readFile, writeFile, fileExists };
};
