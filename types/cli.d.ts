type CLIArgs = Partial<{
  mode: string;
  version: boolean;
  help: boolean;
  v: boolean; // verbose
  watch: boolean; // build
  lint: boolean; // build
  fix: boolean; // lint
  'max-warnings': number; // lint, default: -1
  [key: string]: any; // filters
}>;

interface CLICommandOptions {
  [k: string]: string;
}

interface CLICommandOpts {
  description: string;
  usage: string;
  options: CLICommandOptions;
}

type CLICommandFunction = (args: CLIArgs) => Promise<any>;

interface CLICommand {
  name: string;
  opts: CLICommandOpts;
  fn: CLICommandFunction;
}

interface CLICommands {
  [commandName: string]: CLICommand;
}
