# Handlers

## Rollup

Used for building `.vue` components with the support of ES6 modules.

```js
{
  handler: 'rollup',
  name: 'yprox-store-locator',
  src: 'src/StoreLocatorBundle/Resources/private/js/yprox-store-locator/index.js',
  concat: 'yprox-store-locator.min.js',
  dest: './public/js',
}
```

## Webpack

Equivalent to [handler Rollup](#rollup), but it uses webpack under the hood. 
The configuration is a bit different. You can modify the default webpack config with the help of [webpack-chain](https://github.com/neutrinojs/webpack-chain).

It does:
  - Configure webpack's mode with `NODE_ENV` value ([development](https://webpack.js.org/concepts/mode/#mode-development) and [production](https://webpack.js.org/concepts/mode/#mode-production))
  - Configure manifest chunk splitting, [webpack's manifest](https://webpack.js.org/concepts/manifest/) is bundled into `manifest.js` file
  - Configure vendors chunk splitting, every dependencies from `node_modules/` are bundled into `vendor.js` file
  - Support code-splitting with [dynamic `import()`](https://webpack.js.org/guides/code-splitting/#dynamic-imports) and named chunks
  - Handle `.js` files with [bublé](https://github.com/Rich-Harris/buble)
  - Handle `.vue` files with [vue-loader](https://github.com/vuejs/vue-loader), and extract CSS with [mini-css-extract-plugin](https://github.com/webpack-contrib/mini-css-extract-plugin) in production
  - Handle `.css` files [css-loader](https://github.com/webpack-contrib/css-loader) and [postcss-loader](https://github.com/postcss/postcss-loader) (with [Autoprefixer](https://github.com/postcss/autoprefixer) and [cssnano](https://github.com/cssnano/cssnano) enabled)
  - Handle `.sass` and `.scss` files with [sass-loader](https://github.com/webpack-contrib/sass-loader)
  
```js
{
  handler: 'webpack',
  // `webpack` is a webpack `Config` object from webpack-chain
  config (webpack) {
    webpack.output.path('public/js'); // mandatory

    webpack
      .entry('core-app-front')
      .add('./src/CoreBundle/Resources/private/js/app');

    webpack
      .entry('core-app-admin')
      .add('./src/Admin/CoreBundle/Resources/private/js/app');

    webpack
      .entry('yprox-store-locator')
      .add('./src/StoreLocatorBundle/Resources/private/js/yprox-store-locator');
  }
}
```

Then you can use bundled files like this:

```html
<head>
  <!-- if you have imported some CSS from `node_modules/` -->
  <link rel="stylesheet" href="public/js/vendor.css"/>
  
  <!-- extracted from the `core-app-front` entry -->
  <link rel="stylesheet" href="public/js/core-app-front.css"/>
</head>
<body>
  <!-- ... -->
  
  <!-- webpack manifest and vendor entries -->
  <script src="public/js/manifest.js"></script>
  <script src="public/js/vendor.js"></script>
  
  <!-- your entries -->
  <script src="public/js/core-app-front.js"></script>
  <script src="public/js/core-app-admin.js"></script>
  <script src="public/js/yprox-store-locator.js"></script>
</body>
```

::: warning
In order to be more performant, it is **highly** recommended to only have one entry handled by `webpack` (with multiple webpack entries inside).
:::

::: tip
Run `yprox-cli build --filter:handler webpack -v` to print webpack final configuration.
:::

## Plain Javascript files

Used for handling JS files.

In production environment, it uglify files and generates sourcemaps.

```js
{
  handler: 'js',
  src: 'src/StoreLocatorBundle/Resources/public/storeLocatorUtils.js',
  concat: 'storeLocatorUtils.min.js',
  dest: './public/js',
}

{
  handler: 'js',
  src: 'src/StoreLocatorBundle/Resources/public/*.js',
  concat: 'store-locator-bundle.min.js',
  dest: './public/js',
}
```

## Plain CSS Files

Used for handling CSS files, it runs [autoprefixer](https://github.com/postcss/autoprefixer) on them.

In production environment, it runs [CSSNano](https://github.com/cssnano/cssnano), uglify files, and generates sourcemaps.

```js
{
  handler: 'css',
  src: 'src/CoreBundle/Resources/private/css/legacy.css',
  concat: 'legacy.css',
  dest: './public/css',
}
```

## Sass and SCSS

The same behavior that [CSS handler](#plain-css-files), but for `.sass` and `.scss` files.

```js
{
  handler: 'sass',
  src: 'src/CoreBundle/Resources/private/sass/grid.scss',
  concat: 'grid.css',
  dest: './public/css',
}
```

## Files

Used for copying files:

```js
{
  handler: 'file',
  src: 'src/CoreBundle/Resources/private/plugins/jQuery-Validation-Engine/**/*',
  dest: `./public/plugins/jQuery-Validation-Engine`,
}
```

## Images

Used for minifying images (png, jpeg, gif and svg) in production environment:

```js
{
  handler: 'image',
  src: 'src/CoreBundle/Resources/private/img/*',
  dest: './public/img/core-bundle',
}
```
