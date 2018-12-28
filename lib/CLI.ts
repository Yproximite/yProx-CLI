import API from './API';
import { displayCommandHelp, displayHelp } from './utils/cli';

export default class CLI {
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
      if (!commandName && args.version) {
        console.log(require('../package').version);
        return resolve();
      }

      if (!commandName || args.help) {
        this.showHelp(commandName);
        return resolve();
      }

      return this.api.executeCommand(commandName, args)
        .then(() => resolve())
        .catch(err => reject(err));
    });
  }

  /**
   * @private
   */
  showHelp(commandName) {
    const commands = this.api.commands;
    const command = commands[commandName];

    if (command) {
      displayCommandHelp(commandName, command);
    } else {
      displayHelp(commands);
    }
  }
}
