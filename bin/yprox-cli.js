#!/usr/bin/env node
const Cli = require('../lib/Cli');

const args = require('minimist')(process.argv.slice(2), {
  boolean: [
    // build
    'watch',
    // lint
    'fix'
  ],
});
const command = args._[0];

const cli = new Cli(process.cwd());

cli.run(command, args).catch(err => {
  console.error(err);
  process.exit(1);
});
