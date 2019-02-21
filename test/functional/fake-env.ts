import * as fs from 'fs-extra';
import util from 'util';
import API from '../../lib/API';

const exec = util.promisify(require('child_process').exec);

let env = -1;

type Files = { [k: string]: string | Buffer };
type FakeEnvArgs = { files: Files | string; mode: string; verbose: boolean; mockLogger: boolean };
type FakeEnv = {
  api: API;
  cleanup: () => void;
  run: (command: string) => Promise<{ stdout: string; stderr: string; code: number }>;
  runYproxCli: (command: string) => Promise<{ stdout: string; stderr: string; code: number }>;
  readFile: (filename: string, encoding?: string) => Promise<string>;
  writeFile: (filename: string, content: string) => Promise<void>;
  fileExists: (filename: string) => Promise<boolean>;
};
export const createFakeEnv = async ({ files = {}, mode = 'development', verbose = false }: Partial<FakeEnvArgs> = {}): Promise<FakeEnv> => {
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

  const run = async (command: string): Promise<{ stdout: string; stderr: string; code: number }> => {
    return await exec(command, {
      cwd: context,
      env: {
        ...process.env,
        NODE_PATH: api.resolve('node_modules'),
      },
    });
  };

  const runYproxCli = async (command: string): Promise<{ stdout: string; stderr: string; code: number }> => {
    return run(`node ${__dirname}/../../dist/bin/yprox-cli.js ${command}`);
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

  return { api, run, runYproxCli, cleanup, readFile, writeFile, fileExists };
};
