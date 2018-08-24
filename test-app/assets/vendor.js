module.exports = (cli, config) => ([
  {
    handler: 'js',
    src: cli.mode === 'production' ? 'node_modules/vue/dist/vue.min.js' : 'node_modules/vue/dist/vue.js',
    concat: cli.mode === 'production' ? 'vue.min.js' : 'vue.js',
    dest: config.path.js,
  },
]);
