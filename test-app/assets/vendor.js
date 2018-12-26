module.exports = (api, config) => ([
  {
    handler: 'js',
    src: api.isProduction() ? 'node_modules/vue/dist/vue.min.js' : 'node_modules/vue/dist/vue.js',
    concat: api.isProduction() ? 'vue.min.js' : 'vue.js',
    dest: config.path.js,
  },
]);
