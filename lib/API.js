const { resolve } = require('path');
const { defaults, validate } = require('./options');
const Logger = require('@kocal/logger');
const defaultsDeep = require('lodash/defaultsDeep');

class API {
  constructor(context, mode = 'development', verbose = false) {
    this.context = context;
    this.mode = mode;
    this.verbose = verbose;
    this.logger = initLogger();
    this.projectOptions = defaultsDeep(loadUserOptions(), defaults());
  }

  executeCommand(commandName, params) {
    if (!commandName) {
      throw new Error('You must specify a command to run.');
    }

    const command = require(resolve(__dirname, 'commands', commandName));

    return new Promise((resolve, reject) => {
      return command(...params)
        .then(() => resolve())
        .catch(err => reject(err));
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

function loadUserOptions() {
  const configFile = resolve(process.cwd(), 'yprox-cli.config.js');
  const config = require(configFile);

  validate(config);

  return config;
}
