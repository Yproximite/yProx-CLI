type CLIArgs = {
  mode?: string;
  version?: boolean;
  help?: boolean;
  v?: boolean; // verbose
  watch?: boolean; // build
  lint?: boolean; // build
  fix?: boolean; // lint
}

type CLICommandOpts = {
  description: string;
  usage: string;
  options: { [k: string]: string };
}

type CLICommandFunction = (args: CLIArgs) => any;

type CLICommand = {
  name: string;
  opts: CLICommandOpts;
  fn: CLICommandFunction;
}
