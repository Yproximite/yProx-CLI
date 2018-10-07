const { resolve } = require('path');

module.exports = (cli, config) => ([
  {
    handler: 'sass',
    src: resolve(__dirname, '../themes/_containers/containers.scss'),
    dest: config.path.css,
  },
]);
