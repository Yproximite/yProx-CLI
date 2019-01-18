# Handlers

## Rollup

Used for building modern applications. It supports Vue components and ES6 modules.

In production environment, it minimize files and generates sourcemaps.

```js
{
  handler: 'rollup',
  name: 'yprox-store-locator',
  src: 'src/StoreLocatorBundle/Resources/private/js/yprox-store-locator/index.js',
  dest: './public/js',
  destFile: 'yprox-store-locator.min.js',
}
```

## Plain Javascript files

Used for handling JS files with the support of ES6 code. Note that ES6 modules are **not supported**, use Rollup instead.

In production environment, it minimize files and generates sourcemaps.

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

Used for optimizing PNG, JPEG, GIF and SVG images:

```js
{
  handler: 'image',
  src: 'src/CoreBundle/Resources/private/img/*',
  dest: './public/img/core-bundle',
}
```
