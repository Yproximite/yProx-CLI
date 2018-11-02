const chalk = require('chalk');
const CLI_BIN = 'yprox-cli';

module.exports.displayHelp = (commands) => {
  console.log(chalk`\n  Usage: {green ${CLI_BIN} [command] [options]}\n`);

  displayOptions({
    '--help': 'display this help',
    '--version': 'display version',
  });

  displayCommands(commands);

  console.log(chalk`  run {green ${CLI_BIN} [command] --help} for usage of a specific command\n`);
};

module.exports.displayCommandHelp = (commandName, command) => {
  console.log(chalk`\n  Usage: {green ${CLI_BIN} ${commandName} [options]}\n`);
  displayOptions(command.opts.options);
};

function displayCommands(commands) {
  displaySectionTable('Commands', commands, (entry) => [entry[0], entry[1].opts.description]);
}

function displayOptions(options) {
  displaySectionTable('Options', options, (entry) => [entry[0], entry[1]]);
}

function displaySectionTable(title, dataObject, handleEntry) {
  if (!dataObject || Object.keys(dataObject).length === 0) {
    return;
  }

  const maxLen = Math.max(...Object.keys(dataObject).map(key => key.length));

  console.log(`  ${title}:\n`);

  Object.entries(dataObject).forEach(entry => {
    const [name, value] = handleEntry(entry);
    console.log(chalk`    {blue ${name.padEnd(maxLen)}} ${value}`);
  });

  console.log();
}
