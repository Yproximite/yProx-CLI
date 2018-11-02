const API = require('./API');

class Cli {
  constructor(context) {
    this.context = context;
    this.initialized = false;
  }

  init(mode, verbose) {
    if (this.initialized) {
      return;
    }

    this.initialized = true;
    this.api = new API(this.context, mode, verbose);
  }

  run(commandName, args = []) {
    this.init(args.mode, args.v);

    return new Promise((resolve, reject) => {
      return this.api.executeCommand(commandName, [this.api, args])
        .then(() => resolve())
        .catch(err => reject(err));
    });
  }
}

module.exports = Cli;
