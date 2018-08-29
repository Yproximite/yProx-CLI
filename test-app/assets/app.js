module.exports = (cli, config) => ([
  {
    handler: 'css',
    src: 'src/CoreBundle/Resources/private/css/legacy.css',
    concat: 'legacy.css',
    dest: config.path.css,
  },
  {
    handler: 'css',
    src: 'src/CoreBundle/Resources/private/css/button.css',
    concat: 'button.css',
    dest: config.path.css,
  },
  {
    handler: 'image',
    src: 'src/CoreBundle/Resources/private/img/*',
    dest: config.path.img,
  },
  {
    handler: 'file',
    src: 'src/CoreBundle/Resources/private/plugins/jQuery-Validation-Engine/**/*',
    dest: `${config.path.plugins}/jQuery-Validation-Engine`,
  },
  {
    handler: 'browserify',
    src: 'src/StoreLocatorBundle/Resources/private/js/yprox-store-locator',
    concat: 'yprox-store-locator.browserify.min.js',
    dest: config.path.js,
  },
  {
    handler: 'rollup',
    src: 'src/StoreLocatorBundle/Resources/private/js/yprox-store-locator',
    concat: 'yprox-store-locator.rollup.min.js',
    dest: config.path.js,
  },
  {
    handler: 'js',
    src: 'src/StoreLocatorBundle/Resources/public/storeLocatorUtils.js',
    concat: 'storeLocatorUtils.min.js',
    dest: config.path.js,
  },
]);
