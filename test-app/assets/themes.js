module.exports = (cli, config) => ([
  {
    handler: 'sass',
    src: 'themes/_containers/containers.scss',
    dest: config.path.css,
  },
]);
