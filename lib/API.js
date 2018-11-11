const { resolve } = require('path');
const { defaults: defaultsOptions, validate: validateOptions } = require('./options');
const { loadEnv } = require('./utils/loadEnv');
const Logger = require('@kocal/logger');
const defaultsDeep = require('lodash/defaultsDeep');

class API {
  constructor(context, mode = 'development', verbose = false) {
    this.plugins = [];
    this.commands = [];
    this.context = context;
    this.mode = mode;
    this.verbose = verbose;
    this.logger = initLogger(this.verbose);
    this.projectOptions = loadUserOptions(err => {
      if (err) {
        this.logger.error('Your configuration is invalid, please fix your "yprox-cli.config.js".');
        err.details.forEach(detail => {
          this.logger.error(`${detail.message}, path: "${detail.path.join(' > ')}"`);
        });

        throw new Error('Invalid configuration.');
      }
    });
    this.loadEnv();
    this.resolvePlugins();
  }

  resolve(path) {
    return resolve(this.context, path);
  }

  registerCommand(commandName, opts, fn) {
    this.commands[commandName] = { opts, fn };
  }

  executeCommand(commandName, params) {
    if (!commandName) {
      throw new Error('You must specify a command to run.');
    }

    const command = this.commands[commandName];
    if (!command) {
      throw new Error(`Command "${commandName}" does not exist.`);
    }

    return new Promise((resolve, reject) => {
      return command.fn(params)
        .then(() => resolve())
        .catch(err => reject(err));
    });
  }

  /**
   * @private
   */
  loadEnv() {
    const load = filename => {
      const path = this.resolve(filename);
      this.logger.log(`env :: loading "${path}".`);
      loadEnv(path);
    };

    load('.env');
    load('.env.local');
    if (['prod', 'production'].includes(this.mode)) {
      load('.env.prod');
      load('.env.prod.local');
      load('.env.production');
      load('.env.production.local');
    } else if (['dev', 'development'].includes(this.mode)) {
      load('.env.dev');
      load('.env.dev.local');
      load('.env.development');
      load('.env.development.local');
    } else {
      load(`.env.${this.mode}`);
      load(`.env.${this.mode}.local`);
    }

    if (!process.env.NODE_ENV) {
      process.env.NODE_ENV = this.mode;
    }
  }

  /**
   * @private
   */
  resolvePlugins() {
    this.plugins = [
      './commands/build',
      './commands/lint',
    ];

    this.plugins.forEach(plugin => {
      require(plugin)(this);
    });
  }
}

module.exports = API;

function initLogger(verbose = false) {
  return Logger.getLogger('yprox-cli', {
    level: verbose ? 'log' : 'info',
    format: (ctx, variables) => `[${ctx.chalk.blue(ctx.luxon.toFormat('HH:mm:ss'))}] ${ctx.levelColor(ctx.level)} :: ${ctx.message}`,
  });
}

function loadUserOptions(cb) {
  const configFile = resolve(process.cwd(), 'yprox-cli.config.js');
  let config = require(configFile);
  config = defaultsDeep(defaultsOptions(), config);

  validateOptions(config, cb);

  return config;
}
