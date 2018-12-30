import API from './API';
import { displayCommandHelp, displayHelp } from './utils/cli';

export default class CLI {
  private readonly context: string;
  private initialized: boolean;
  private api!: API;

  constructor(context: string) {
    this.context = context;
    this.initialized = false;
  }

  init(mode?: string, verbose: boolean = false) {
    if (this.initialized) {
      return;
    }

    this.initialized = true;
    this.api = new API(this.context, mode, verbose);
  }

  public run(commandName: string, args: CLIArgs = {}) {
    this.init(args.mode, args.v);

    return new Promise((resolve, reject) => {
      if (!commandName && args.version) {
        console.log(require('../../package').version);
        return resolve();
      }

      if (!commandName || args.help) {
        this.showHelp(commandName);
        return resolve();
      }

      return this.api
        .executeCommand(commandName, args)
        .then(resolve)
        .catch(reject);
    });
  }

  private showHelp(commandName: string) {
    const commands = this.api.commands;
    const command = commands[commandName];

    if (command) {
      displayCommandHelp(commandName, command);
    } else {
      displayHelp(commands);
    }
  }
}
