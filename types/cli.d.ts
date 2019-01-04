type CLIArgs = {
  mode?: string;
  version?: boolean;
  help?: boolean;
  v?: boolean; // verbose
  watch?: boolean; // build
  lint?: boolean; // build
  fix?: boolean; // lint
  [key: string]: any; // filters
};

type CLICommandOptions = { [k: string]: string };

type CLICommandOpts = {
  description: string;
  usage: string;
  options: CLICommandOptions;
};

type CLICommandFunction = (args: CLIArgs) => Promise<any>;

type CLICommand = {
  name: string;
  opts: CLICommandOpts;
  fn: CLICommandFunction;
};

type CLICommands = { [commandName: string]: CLICommand };
