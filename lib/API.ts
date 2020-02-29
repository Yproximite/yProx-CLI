import chalk from 'chalk';
import defaultsDeep from 'defaults-deep';
import fs from 'fs';
import { ValidationError, ValidationErrorItem } from 'joi';
import { resolve } from 'path';
import { ProjectOptions } from '../types';
import { initLogger, Logger } from './logger';
import { defaults as defaultsOptions, validate as validateOptions } from './options';
import { loadEnv } from './utils/loadEnv';

export default class API {
  public readonly context: string;

  public readonly mode: string;

  public readonly verbose: boolean;

  public readonly commands: CLICommands;

  public readonly logger: Logger;

  public projectOptions!: ProjectOptions;

  public constructor(context: string, mode = 'development', verbose = false) {
    this.context = context;
    this.mode = mode;
    this.verbose = verbose;
    this.commands = {};
    this.logger = initLogger(this.verbose);
    this.loadUserOptions((err: Error | ValidationError, config?: ProjectOptions): void => {
      if (err) {
        this.logger.error('Your configuration is invalid.');
        if (err.message) {
          this.logger.error(err.message);
        }

        // @ts-ignore
        (err.details || []).forEach((detail: ValidationErrorItem) => {
          this.logger.error(`${detail.message}, path: "${detail.path.join(' > ')}"`);
        });

        process.exit(1);
        return;
      }

      /* istanbul ignore next */
      if (!config) {
        throw new Error('This should not happens.');
      }

      this.projectOptions = config;
    });
    this.loadEnv();
    this.resolvePlugins();
  }

  public resolve(path: string): string {
    return resolve(this.context, path);
  }

  public registerCommand(commandName: string, opts: CLICommandOpts, fn: CLICommandFunction): void {
    this.commands[commandName] = { opts, fn, name: commandName };
  }

  public executeCommand(commandName: string, args: CLIArgs = {}): Promise<any> {
    if (!commandName) {
      throw new Error('You must specify a command to run.');
    }

    const command = this.commands[commandName];
    if (!command) {
      throw new Error(`Command "${commandName}" does not exist.`);
    }

    return command.fn(args);
  }

  // eslint-disable-next-line class-methods-use-this
  public isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  // eslint-disable-next-line class-methods-use-this
  public getSafeEnvVars(): { [k: string]: any } {
    const validKeys = Object.keys(process.env).filter(key => {
      return key === 'NODE_ENV' || key.startsWith('APP_');
    });

    return validKeys.reduce((acc: { [k: string]: any }, key) => {
      acc[key] = process.env[key];
      return acc;
    }, {});
  }

  private loadUserOptions(cb: (err: Error | ValidationError, config?: ProjectOptions) => void): void {
    const configFilePath = this.resolve('yprox-cli.config.js');
    const configFileFound = fs.existsSync(configFilePath);

    if (!configFileFound) {
      this.logger.warn(`The configuration file "${configFilePath}" does not exist. Using default configuration.`);
    }

    const config = defaultsDeep(defaultsOptions(), configFileFound ? require(configFilePath) : {}) as ProjectOptions;

    validateOptions(config, err => cb(err, config));
  }

  private loadEnv(): void {
    const load = (filename: string): void => {
      const path = this.resolve(filename);

      if (fs.existsSync(path)) {
        this.logger.log(`env :: loading "${path}".`);
        loadEnv(path);
      }
    };

    if (['prod', 'production'].includes(this.mode)) {
      load('.env.production.local');
      load('.env.production');
      load('.env.prod.local');
      load('.env.prod');
    } else if (['dev', 'development'].includes(this.mode)) {
      load('.env.development.local');
      load('.env.development');
      load('.env.dev.local');
      load('.env.dev');
    } else {
      load(`.env.${this.mode}.local`);
      load(`.env.${this.mode}`);
    }

    load('.env.local');
    load('.env');

    if (typeof process.env.NODE_ENV === 'undefined') {
      process.env.NODE_ENV = this.mode;
    }
  }

  private resolvePlugins(): void {
    const plugins = ['./plugins/build', './plugins/lint'];

    plugins.forEach(plugin => {
      require(plugin).default(this);
    });
  }
}
