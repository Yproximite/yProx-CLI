#!/usr/bin/env node
import CLI from '../lib/CLI';

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

cli.run(command, args).catch((err: Error) => {
  console.error(err);
  process.exit(1);
});
