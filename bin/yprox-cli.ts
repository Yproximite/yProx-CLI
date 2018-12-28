#!/usr/bin/env node
const CLI = require('../lib/CLI');

const args = require('minimist')(process.argv.slice(2), {
  boolean: [
    'v', // verbose
    // build
    'watch',
    // lint
    'fix'
  ],
});
const command = args._[0];

const cli = new CLI(process.cwd());

cli.run(command, args).catch(err => {
  console.error(err);
  process.exit(1);
});
