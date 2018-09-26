yProx-cli
=========

[![Build Status](https://travis-ci.com/Yproximite/yProx-cli.svg?token=pNBs2oaRpfxdyhqWf28h&branch=master)](https://travis-ci.com/Yproximite/yProx-cli)

> A tools for linting and building assets from [yProx CMS](https://github.com/Yproximite/yProx).
> See [this PR](https://github.com/Yproximite/yProx/pull/4654) for additional details.

# Requirements

- Be inside an Yprox application :man_shrugging:
- Node.js > 8
- Yarn

# Usage

**Note:** You should create a `.npmrc` file at the root of your application with a auth token inside,
because this package is private.

```bash
$ yarn add @yproximite/yprox-cli
```

## Available commands

After some [configuration](#configuration), you should be able to run those commands:

### yprox-cli build [--mode=development] [--watch] [--filter:...]

```bash
$ yarn yprox-cli build
$ yarn yprox-cli build --mode production
$ yarn yprox-cli build --filter:handler rollup # will handle only assets handled by rollup

# Build, then watch and build
$ yarn yprox-cli build --watch
$ yarn yprox-cli build --mode production --watch
```

### yprox-cli lint [--fix] [--filter:...]
```bash
$ yarn yprox-cli lint
$ yarn yprox-cli lint --fix
$ yarn yprox-cli lint --filter:handler sass # will lint only 'sass' entries
$ yarn yprox-cli lint --filter:handler sass --fix # will lint and fix only 'sass' entries
```

### Filtering

For each commands, you can specify multiple arguments `--filter:X Y`, where:
- `X` is the name of an entry's property (see [Assets entries](#assetsentries))
- `Y` is one of the possible value of `X`

## Production mode

When passing flag `--mode production` during building:
 - JS and CSS files will be minified
 - Sourcemaps will be generated for JS and CSS files
 - Images will be minimified

## Configuration

First, you should create a `yprox-cli.config.js` file:

```js
// your-app/yprox-cli.config.js

module.exports = {
  // Entries that will be build/linted, see next section
  assets: {
    app: './assets/app.js',
    vendor: './assets/vendor.js',
  },

  // Destination paths that will be automatically injected in your entries
  path: {
    js: './public/js',
    css: './public/css',
    img: './public/img',
    plugins: './public/plugins',
  },

  // Specific configuration for handlers
  handlers: {
    autoprefixer: {
      browsers: [...],
    },
  },
};
```

Your configuration file will be merged with defaults config:

```js
{
  path: {},
  handlers: {
    autoprefixer: {},
    cssnano: {
      safe: true,
      autoprefixer: false,
    },
    uglify: {
      compress: {
        drop_console: true,
      },
    },
    gifsicle: {
      interlaced: true,
    },
    jpegtran: {
      progressive: true,
    },
    optipng: {
      optimizationLevel: 5,
    },
    svgo: {
      plugins: [
        {
          removeViewBox: true,
        },
      ],
    },
    rollup: {
      shims: {},
      // https://github.com/rollup/rollup-plugin-node-resolve
      nodeResolve: {}, 
      // https://github.com/rollup/rollup-plugin-commonjs
      commonjs: {}, 
      vue: {},
      buble: {},
      // https://github.com/TrySound/rollup-plugin-string#usage
      string: false, // `false` means that we actually disable the plugin
      // https://github.com/rollup/rollup-plugin-json#usage
      json: {}, 
    },
    https://github.com/sass/node-sass#options
    sass: {} 
  },
}
```

## Assets/Entries

Since you configured two entries `app` and `vendor`, you should create files `assets/app.js` and `assets/vendor.js`.

Those files follow this structure:

```js
// `cli` is an instance of `Cli` class
// `config` contains your configuration (`yprox-cli.config.js`)
module.exports = (cli, config) => ([
  // array of entries
]);
```

Each entries can be handled by:
- `browserify`
- `rollup`
- `js`
- `css`
- `file`
- `image`

### Handler `browserify` (DEPRECATED)

_This handler is deprecated because browserify is old, plugins are not maintened, and it will never support ES6 modules. Use `rollup` handler instead for a modern approach._

Used for building `.vue` components:

```js
{
  handler: 'browserify',
  src: 'src/StoreLocatorBundle/Resources/private/js/yprox-store-locator',
  concat: 'yprox-store-locator.min.js',
  dest: config.path.js, // will resolve `public/js`
}
```

### Handler `rollup`

Used for building `.vue` components, with support of ES6 modules (no need to Babel):

```js
{
  handler: 'rollup',
  name: 'yprox-store-locator',
  src: 'src/StoreLocatorBundle/Resources/private/js/yprox-store-locator',
  concat: 'yprox-store-locator.min.js',
  dest: config.path.js, // will resolve `public/js`
}
```

### Handler `js`

Used for handling JS files.

In production, it also uglify and generates sourcemaps.

```js
{
  handler: 'js',
  src: 'src/StoreLocatorBundle/Resources/public/storeLocatorUtils.js',
  concat: 'storeLocatorUtils.min.js',
  dest: config.path.js,
}
```

### Handler `css`

Used for handling CSS files, it runs [autoprefixer](https://github.com/postcss/autoprefixer) on them.

In production, it also runs [CSSNano](https://github.com/cssnano/cssnano), uglify, and generates sourcemaps.

```js
{
  handler: 'css',
  src: 'src/CoreBundle/Resources/private/css/legacy.css',
  concat: 'legacy.css',
  dest: config.path.css,
}
```

### Handler `sass`

The same behavior for `css` handler.

It supports `.sass` and `.scss` files.

```js
{
  handler: 'sass',
  src: 'src/CoreBundle/Resources/private/sass/grid.scss',
  concat: 'my-grid.css',
  dest: config.path.css,
}
```

### Handler `file`

Used for copying files:

```js
{
  handler: 'file',
  src: 'src/CoreBundle/Resources/private/plugins/jQuery-Validation-Engine/**/*',
  dest: `${config.path.plugins}/jQuery-Validation-Engine`,
}
```

### Handler `image`

Used for minifying images (png, jpeg, gif and svg) in production mode:

```js
{
  handler: 'image',
  src: 'src/CoreBundle/Resources/private/img/*',
  dest: config.path.img,
}
```
