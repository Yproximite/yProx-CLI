module.exports = (api, entry, args) => {
  return (config) => {
    config.output
      .filename('[name].js')
      .chunkFilename('[name].js');
  };
};
