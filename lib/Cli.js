const { resolve } = require('path');
const { defaults, validate } = require('./options');
const { defaultsDeep } = require('lodash');

module.exports = class Cli {
  constructor(context) {
    this.context = context;
    this.initialized = false;
  }

  init(mode = 'development') {
    if (this.initialized) {
      return;
    }
    this.initialized = true;
    this.mode = mode;
    this.projectOptions = defaultsDeep(this.loadUserOptions(), defaults());
  }

  run(commandName, args = []) {
    this.init(args.mode);

    if(!commandName) {
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
