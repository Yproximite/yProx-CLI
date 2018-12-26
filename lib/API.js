const fs = require('fs');
const { resolve } = require('path');
const { defaults: defaultsOptions, validate: validateOptions } = require('./options');
const loadEnv = require('./utils/loadEnv');
const Logger = require('@kocal/logger');
const defaultsDeep = require('defaults-deep');

class API {
  constructor(context, mode = 'development', verbose = false) {
    this.plugins = [];
    this.commands = [];
    this.context = context;
    this.mode = mode;
    this.verbose = verbose;
    this.logger = initLogger(this.verbose);
    this.loadUserOptions(err => {
      if (err) {
        this.logger.error('Your configuration is invalid.');
        if (err.message) {
          this.logger.error(err.message);
        }
        (err.details || []).forEach(detail => {
          this.logger.error(`${detail.message}, path: "${detail.path.join(' > ')}"`);
        });

        process.exit(1);
      }
    });
    this.loadEnv();
    this.resolvePlugins();
  }

  isProduction() {
    return process.env.NODE_ENV === 'production';
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

    return command.fn(params);
  }

  /**
   * @private
   */
  loadUserOptions(cb) {
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
    } catch (e) {
    }

    try {
      if (process.env.YPROX_CLI_IGNORE_CONFIG_FILE === 'true') {
        // no-op
      } else {
        fileConfig = require(this.resolve('yprox-cli.config.js')) || {};
      }
    } catch (e) {
    }

    if (pkgConfig !== null && fileConfig !== null) {
      cb(new Error("You can't configure yprox-cli with \x1b[1;32myprox-cli.config.js\x1b[0m and \x1b[1;32mpackage.json\x1b[0m at the same time."));
      return;
    }

    const config = defaultsDeep(defaultsOptions(), pkgConfig || fileConfig || {});
    validateOptions(config, cb);

    this.projectOptions = config;
  }

  /**
   * @private
   */
  loadEnv() {
    const load = filename => {
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

  getSafeEnvVars() {
    const validKeys = Object.keys(process.env).filter(key => key === 'NODE_ENV' || key.startsWith('APP_'));
    return validKeys.reduce((acc, key) => {
      acc[key] = process.env[key];
      return acc;
    }, {});
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
