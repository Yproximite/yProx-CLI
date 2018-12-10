const path = require('path');

module.exports = (api, entry, args) => {
  return (config) => {
    config.resolve.extensions
      .add('.js')
      .add('.json')
      .add('.vue');

    config.resolve.modules
      .add('node_modules')
      .add(api.resolve('node_modules'))
      .add(path.resolve(__dirname, '../../../../../../node_modules'));
  };
};
