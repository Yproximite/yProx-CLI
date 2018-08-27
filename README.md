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

```js
# Build
$ yarn yprox-cli build --mode development
$ yarn yprox-cli build --mode production

# Build, then watch and build
$ yarn yprox-cli build --mode development --watch
$ yarn yprox-cli build --mode production --watch

# Lint
$ yarn yprox-cli lint
$ yarn yprox-cli lint --fix
```

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
- `js`
- `css`
- `file`
- `image`

### Handler `browserify`

Used for building `.vue` components:

```js
{
  handler: 'browserify',
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
