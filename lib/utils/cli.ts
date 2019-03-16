import chalk from 'chalk';

const CLI_BIN = 'yprox-cli';

function displaySectionTable(title: string, dataObject: { [k: string]: any }, handleOption: (opts: any[]) => string[]): void {
  if (!dataObject || Object.keys(dataObject).length === 0) {
    return;
  }

  const maxLen = Math.max(...Object.keys(dataObject).map(key => key.length));

  console.log(`  ${title}:\n`);

  Object.entries(dataObject).forEach(option => {
    const [name, value] = handleOption(option);
    console.log(chalk`    {blue ${name.padEnd(maxLen)}} ${value}`);
  });

  console.log();
}

function displayCommands(commands: CLICommands): void {
  displaySectionTable('Commands', commands, opts => [opts[0], opts[1].opts.description]);
}

function displayOptions(options: CLICommandOptions): void {
  displaySectionTable('Options', options, opts => [opts[0], opts[1]]);
}

export function displayHelp(commands: CLICommands): void {
  console.log(chalk`\n  Usage: {green ${CLI_BIN} [command] [options]}\n`);

  displayOptions({
    '--help': 'display this help',
    '--version': 'display version',
  });

  displayCommands(commands);

  console.log(chalk`  run {green ${CLI_BIN} [command] --help} for usage of a specific command\n`);
}

export function displayCommandHelp(commandName: string, command: CLICommand): void {
  console.log(chalk`\n  Usage: {green ${CLI_BIN} ${commandName} [options]}\n`);
  displayOptions(command.opts.options);
}
