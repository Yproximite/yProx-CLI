const { promisify } = require('util');
const { tmpdir } = require('os');
const { remove } = require('fs-extra');
const exec = promisify(require('child_process').exec);
const path = require('path');

const rootDir = path.join(__dirname, '../');

module.exports = async () => {
  console.log('\n[setup] Cleaning functional envs folder...');
  await remove(`${tmpdir()}/yprox-cli`);

  try {
    console.log('[setup] Building yProx-CLI...');
    await exec('yarn build', { cwd: rootDir });
  } catch (e) {
    console.error(e.stdout);
    process.exit(e.code);
  }

  console.log('[setup] Packaging yProx-CLI...');
  await exec('npm pack', { cwd: rootDir });
};
