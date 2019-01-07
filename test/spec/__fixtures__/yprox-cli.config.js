// This file is ignored when running `yarn build` or `yarn lint`
// The yProx-CLI config is located in the `package.json`, under `yproxCli` key.
module.exports = {
  assets: {
    app: [{ handler: 'rollup', src: 'i-dont-exists/from-yprox-cli-config.js/index.js' }],
  },
};
