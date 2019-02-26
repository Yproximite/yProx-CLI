const { tmpdir } = require('os');
const { remove } = require('fs-extra');

module.exports = async () => {
  console.log('\n[setup] Cleaning functional envs folder...');
  await remove(`${tmpdir()}/yprox-cli`);
};
