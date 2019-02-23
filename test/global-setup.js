const { remove } = require('fs-extra');

module.exports = async () => {
  console.log('\n[setup] Cleaning functional envs folder...');
  await remove(`${__dirname}/functional/envs`);
};
