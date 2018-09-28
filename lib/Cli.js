const { resolve } = require('path');
const Logger = require('@kocal/logger');
const { defaultsDeep } = require('lodash');
const { defaults, validate } = require('./options');

const initLogger = (verbose = false) => {
  return Logger.getLogger('yprox-cli', {
    level: verbose ? 'log' : 'info',
    format: (ctx, variables) => `[${ctx.chalk.blue(ctx.luxon.toFormat('HH:mm:ss'))}] ${ctx.levelColor(ctx.level)} :: ${ctx.message}`,
  });
};

module.exports = class Cli {
  constructor(context) {
    this.context = context;
    this.initialized = false;
  }

  init(mode = 'development', verbose = false) {
    if (this.initialized) {
      return;
    }
    this.initialized = true;
    this.mode = mode;
    this.projectOptions = defaultsDeep(this.loadUserOptions(), defaults());
    this.logger = initLogger(verbose);
  }

  run(commandName, args = []) {
    this.init(args.mode, args.v);

    if (!commandName) {
      throw new Error('You must specify a command to run.');
    }

    const command = require(resolve(__dirname, 'commands', commandName));

    return new Promise((resolve, reject) => {
      return command(this, args)
        .then(() => resolve())
        .catch(err => reject(err));
    });
  }

  loadUserOptions() {
    const configFile = resolve(process.cwd(), 'yprox-cli.config.js');
    const config = require(configFile);

    validate(config);

    return config;
  }
};
