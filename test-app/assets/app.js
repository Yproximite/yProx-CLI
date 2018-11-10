module.exports = (cli, config) => ([
  {
    handler: 'rollup',
    name: 'core-app-front',
    src: 'src/CoreBundle/Resources/private/js/app/index.js',
    concat: 'core-app-front.rollup.js',
    dest: config.path.js,
  },
  {
    handler: 'rollup',
    name: 'core-app-admin',
    src: 'src/Admin/CoreBundle/Resources/private/js/app/index.js',
    concat: 'core-app-admin.rollup.js',
    dest: config.path.js,
  },
  {
    handler: 'rollup',
    name: 'yprox-media-browser',
    src: 'src/Admin/MediaManagerBundle/Resources/private/js/yprox-media-browser/index.js',
    concat: 'yprox-media-browser.rollup.js',
    dest: config.path.js,
  },
  {
    handler: 'rollup',
    name: 'yprox-store-locator',
    src: 'src/StoreLocatorBundle/Resources/private/js/yprox-store-locator/index.js',
    concat: 'yprox-store-locator.rollup.js',
    dest: config.path.js,
  },
  {
    handler: 'webpack',
    config (webpack) {
      webpack.entry('core-app-front.webpack').add('./src/CoreBundle/Resources/private/js/app');
      webpack.entry('core-app-admin.webpack').add('./src/Admin/CoreBundle/Resources/private/js/app');
      webpack.entry('yprox-media-browser.webpack').add('./src/Admin/MediaManagerBundle/Resources/private/js/yprox-media-browser');
      webpack.entry('yprox-store-locator.webpack').add('./src/StoreLocatorBundle/Resources/private/js/yprox-store-locator');
      webpack.output.path(config.path.js);
    },
  },
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
    handler: 'sass',
    src: 'src/CoreBundle/Resources/private/sass/grid.scss',
    concat: 'my-grid.css',
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
]);
