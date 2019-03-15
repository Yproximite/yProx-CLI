import API from './API';
import { displayCommandHelp, displayHelp } from './utils/cli';

export default class CLI {
  private readonly context: string;

  private initialized: boolean;

  private api!: API;

  public constructor(context: string) {
    this.context = context;
    this.initialized = false;
  }

  public init(mode?: string, verbose: boolean = false): void {
    if (this.initialized) {
      return;
    }

    this.initialized = true;
    this.api = new API(this.context, mode, verbose);
  }

  public run(commandName: string, args: CLIArgs = {}): Promise<void> {
    this.init(args.mode, args.v);

    return new Promise((resolve, reject) => {
      if (!commandName && args.version) {
        try {
          const pkgFile = require.resolve('../package.json');
          const pkg = require(pkgFile);
          console.log(pkg.version);
        } catch (e) {
          throw new Error("Unable to get yProx-CLi version (can't load its `package.json`).");
        }

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

  private showHelp(commandName: string): void {
    const { commands } = this.api;
    const command = commands[commandName];

    if (command) {
      displayCommandHelp(commandName, command);
    } else {
      displayHelp(commands);
    }
  }
}
