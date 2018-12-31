import Logger, { Context, Variables } from '@kocal/logger';
import stripAnsi from 'strip-ansi';
import defaultsDeep from 'defaults-deep';
import fs from 'fs';
import { ValidationError, ValidationErrorItem } from 'joi';
import { resolve } from 'path';
import { ProjectOptions } from '../types';
import { defaults as defaultsOptions, validate as validateOptions } from './options';
import { loadEnv } from './utils/loadEnv';

export default class API {
  public readonly context: string;
  public readonly mode: string;
  public readonly verbose: boolean;
  public readonly commands: CLICommands;
  public readonly logger: Logger;
  public projectOptions!: ProjectOptions;
  private plugins: any[];

  constructor(context: string, mode = 'development', verbose = false) {
    this.plugins = [];
    this.commands = {};
    this.context = context;
    this.mode = mode;
    this.verbose = verbose;
    this.logger = initLogger(this.verbose);
    this.loadUserOptions((err: ValidationError, config?: ProjectOptions) => {
      if (err) {
        this.logger.error('Your configuration is invalid.');
        if (err.message) {
          this.logger.error(err.message);
        }
        (err.details || []).forEach((detail: ValidationErrorItem) => {
          this.logger.error(`${detail.message}, path: "${detail.path.join(' > ')}"`);
        });

        return process.exit(1);
      }

      if (!config) {
        throw new Error('This should not happens.');
      }

      this.projectOptions = config;
    });
    this.loadEnv();
    this.resolvePlugins();
  }

  public isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  public resolve(path: string): string {
    return resolve(this.context, path);
  }

  public registerCommand(commandName: string, opts: CLICommandOpts, fn: CLICommandFunction) {
    this.commands[commandName] = { opts, fn, name: commandName };
  }

  public executeCommand(commandName: string, args: CLIArgs) {
    if (!commandName) {
      throw new Error('You must specify a command to run.');
    }

    const command = this.commands[commandName];
    if (!command) {
      throw new Error(`Command "${commandName}" does not exist.`);
    }

    return command.fn(args);
  }

  private loadUserOptions(cb: (err: ValidationError, config?: ProjectOptions) => void): void {
    let pkgConfig = null;
    let fileConfig = null;

    try {
      if (process.env.YPROX_CLI_IGNORE_PACKAGE_JSON_FILE === 'true') {
        // no-op
      } else {
        // read config fron `package.json`
        const pkg = require(this.resolve('package.json'));
        pkgConfig = pkg.yproxCli || {};
      }
    } catch (e) {}

    try {
      if (process.env.YPROX_CLI_IGNORE_CONFIG_FILE === 'true') {
        // no-op
      } else {
        fileConfig = require(this.resolve('yprox-cli.config.js')) || {};
      }
    } catch (e) {}

    if (pkgConfig !== null && fileConfig !== null) {
      cb(new Error(
        "You can't configure yprox-cli with \x1b[1;32myprox-cli.config.js\x1b[0m and \x1b[1;32mpackage.json\x1b[0m at the same time."
      ) as ValidationError);
      return;
    }

    const config = defaultsDeep(defaultsOptions(), pkgConfig || fileConfig || {}) as ProjectOptions;

    validateOptions(config, err => cb(err, config));
  }

  private loadEnv(): void {
    const load = (filename: string) => {
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

  getSafeEnvVars(): { [k: string]: any } {
    const validKeys = Object.keys(process.env).filter(key => {
      return key === 'NODE_ENV' || key.startsWith('APP_');
    });

    return validKeys.reduce((acc: { [k: string]: any }, key) => {
      acc[key] = process.env[key];
      return acc;
    }, {});
  }

  private resolvePlugins(): void {
    const plugins = ['./commands/build', './commands/lint'];

    plugins.forEach(plugin => {
      require(plugin).default(this);
    });
  }
}

function initLogger(verbose = false): Logger {
  return Logger.getLogger('yprox-cli', {
    level: verbose ? 'log' : 'info',
    format: (ctx: Context, variables: Variables) => {
      // jest
      if (process.env.NODE_ENV === 'test') {
        return `[${ctx.luxon.toFormat('HH:mm:ss')}] ${ctx.level} :: ${stripAnsi(ctx.message)}`;
      }

      return `[${ctx.chalk.blue(ctx.luxon.toFormat('HH:mm:ss'))}] ${ctx.levelColor(ctx.level)} :: ${ctx.message}`;
    },
  });
}
