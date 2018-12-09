module.exports = (api, entry, args) => {
  return (config) => {
    config
      .mode(api.mode)
      .context(api.context)
      .target('web')
      .watchOptions({
        poll: 300,
        ignored: /node_modules/,
      })
      .stats({
        colors: true,
        children: false,
        modules: false,
        version: false,
        hash: false,
      });
  };
};
