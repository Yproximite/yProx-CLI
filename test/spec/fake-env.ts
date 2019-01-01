import * as fs from 'fs-extra';
import Module from 'module';
import util from 'util';
import API from '../../lib/API';

const exec = util.promisify(require('child_process').exec);

let env = -1;

type Files = { [k: string]: string | Buffer };
type FakeEnv = {
  api: API;
  cleanup: () => void;
  run: (command: string) => Promise<{ stdout: string; stderr: string }>;
};

export const createFakeEnv = async (files: Files = {}, mode = 'development', verbose = false): Promise<FakeEnv> => {
  // Create new env
  env += 1;
  const context = `${__dirname}/envs/${env}`;
  await fs.mkdirp(context);
  registerDependenciesPath(`${context}/node_modules`);

  // Create files
  await Promise.all(
    Object.entries(files).map(([filename, content]) => {
      return fs.outputFile(`${context}/${filename}`, content);
    })
  );

  // Create API and helpers funcs
  const api = new API(context, mode, verbose);

  const cleanup = async () => {
    unregisterDependenciesPath(`${context}/node_modules`);
    return await fs.remove(context);
  };

  const run = async (command: string): Promise<{ stdout: string; stderr: string }> => {
    return await exec(command, { cwd: context });
  };

  return { api, cleanup, run };
};

function registerDependenciesPath(path: string) {
  // @ts-ignore
  Module.globalPaths.unshift(path);
  module.paths.unshift(path);
}

function unregisterDependenciesPath(path: string) {
  // @ts-ignore
  Module.globalPaths = Module.globalPaths.filter(p => p !== path);
  module.paths = module.paths.filter(p => p !== path);
}
