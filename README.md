yProx-cli
=========

[![npm (scoped)](https://img.shields.io/npm/v/@yproximite/yprox-cli.svg)](https://www.npmjs.com/package/@yproximite/yprox-cli)
[![Build Status](https://travis-ci.com/Yproximite/yProx-cli.svg?token=pNBs2oaRpfxdyhqWf28h&branch=master)](https://travis-ci.com/Yproximite/yProx-cli)

> A tools for linting and building assets from [yProx CMS](https://github.com/Yproximite/yProx).
> See [this PR](https://github.com/Yproximite/yProx/pull/4654) for additional details.

## Requirements

- Node.js > 8
- Yarn

## Usage

```bash
$ yarn add @yproximite/yprox-cli
```

### Available commands

After some [configuration](#configuration), you should be able to run those commands:

#### yprox-cli build [--lint] [--watch]

```bash
$ yarn yprox-cli build
$ yarn yprox-cli build --mode production
$ yarn yprox-cli build --filter:handler rollup # will handle only assets handled by rollup

# Build, then watch and build
$ yarn yprox-cli build --watch
$ yarn yprox-cli build --mode production --watch

# Lint before build
$ yarn yprox-cli build --lint
```

#### yprox-cli lint [--fix]

```bash
$ yarn yprox-cli lint
$ yarn yprox-cli lint --fix
$ yarn yprox-cli lint --filter:handler sass # will lint only 'sass' entries
$ yarn yprox-cli lint --filter:handler sass --fix # will lint and fix only 'sass' entries
```

### Common arguments

- passing `-v` enable verbose mode
- passing `--mode` will specify mode
- passing `--filter:X Y` will filter entries where `X === Y` (or `X includes Y` if `X` is an array) 

### Environment variables and modes

Environment variables is a clean way to store your application's configuration in the environment, separated of your code.

You can specify environment variables by placing the following files in your project root:

```
.env              # loaded if exists,
.env.local        # loaded if exists, should be ignored by git
.env.[mode]       # only loaded in specified mode
.env.[mode].local # only loaded in specified mode, should be ignored by git
```

An environment file contains `KEY=value` pairs of environment variables:

```dotenv
APP_NAME=my app
API_URL=https://api.example.com
API_KEY=my-api-key
```

**Note:** `NODE_ENV` environment variable is automatically defined to `<mode>` if `NODE_ENV` is not already set.

**Note:** Environment variables are available in `process.env` object.
 
**Note:** `.env` files should be ignored in git like this:
```ignore
!.env*
.env*.local
```

#### Example

Given the following files:

```dotenv
# .env
APP_NAME=my app
API_KEY=api-key
```

```dotenv
# .env.production
APP_ENV=production
API_URL=https://api.example.com
```

```dotenv
# .env.staging
NODE_ENV=production
APP_ENV=staging
API_URL=https://staging.example.com
```

```dotenv
# .env.development
APP_ENV=development
API_URL=http://api.my-project.vm
```

- `yprox-cli build`, `yprox-cli build --mode dev` and `yprox-cli build --mode development` will produce:
```dotenv
# .env
APP_NAME=my app
API_KEY=api-key
# .env.development
APP_ENV=development
API_URL=http://api.my-project.vm
# automatically added
NODE_ENV=development
```

- `yprox-cli build --mode prod` and `yprox-cli build --mode production` will produce:
```dotenv
# .env
APP_NAME=my app
API_KEY=api-key
# .env.production
APP_ENV=production
API_URL=https://api.example.com
# automatically added
NODE_ENV=production
```

- `yprox-cli build --mode staging` will produce:
```dotenv
# .env
APP_NAME=my app
API_KEY=api-key
# .env.staging
NODE_ENV=production
APP_ENV=staging
API_URL=https://staging.example.com
```

#### Special cases

When mode is `production` or `prod`, it will load:

- `.env` if exists
- `.env.local` if exists
- `.env.prod` if exists
- `.env.prod.local` if exists
- `.env.production` if exists
- `.env.production.local` if exists

When mode is `development` or `dev`, it will load:

- `.env` if exists
- `.env.local` if exists
- `.env.dev` if exists
- `.env.dev.local` if exists
- `.env.development` if exists
- `.env.development.local` if exists

### Production environment

When `NODE_ENV` is equals to `production`, then:

- JS and CSS files are minified
- JS and CSS files generate sourcemaps
- Images are minimified

### Configuration

Create a `yprox-cli.config.js` file:

```js
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

### Assets/Entries

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
- `rollup`
- `webpack`
- `js`
- `css`
- `file`
- `image`

#### Handler `rollup`

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

#### Handler `webpack`

Equivalent to `rollup` handler, but it uses webpack under the hood. 
The configuration is a bit different. Everything under `config` key is passed to webpack.

It does:
  - Configure webpack's mode with `NODE_ENV` value ([development](https://webpack.js.org/concepts/mode/#mode-development) and [production](https://webpack.js.org/concepts/mode/#mode-production))
  - Suppor code-splitting with [dynamic `import()`](https://webpack.js.org/guides/code-splitting/#dynamic-imports) and named chunks
  - Handle `.js` files with [bublé](https://github.com/Rich-Harris/buble)
  - Handle `.vue` files with [vue-loader](https://github.com/vuejs/vue-loader), and extract CSS with [mini-css-extract-plugin](https://github.com/webpack-contrib/mini-css-extract-plugin) in production
  - Handle `.css` files [css-loader](https://github.com/webpack-contrib/css-loader) and [postcss-loader](https://github.com/postcss/postcss-loader) (with [Autoprefixer](https://github.com/postcss/autoprefixer) and [cssnano](https://github.com/cssnano/cssnano) enabled)
  - Handle `.sass` and `.scss` files with [sass-loader](https://github.com/webpack-contrib/sass-loader)
  
```js
{
  handler: 'webpack',
  // The following config is passed to webpack
  config: {
    entry: {
      'core-app-front': './src/CoreBundle/Resources/private/js/app',
      'core-app-admin': './src/Admin/CoreBundle/Resources/private/js/app',
      'yprox-store-locator': './src/StoreLocatorBundle/Resources/private/js/yprox-store-locator',
    },
    output: {
      path: config.path.js,
    }
  }
}
```

In order to be more performant, it is **highly** recommended to only have one entry handled by `webpack` (with multiple entries inside).

Run `yprox-cli build -v` to print webpack final configuration.

#### Handler `js`

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

#### Handler `css`

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

#### Handler `sass`

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

#### Handler `file`

Used for copying files:

```js
{
  handler: 'file',
  src: 'src/CoreBundle/Resources/private/plugins/jQuery-Validation-Engine/**/*',
  dest: `${config.path.plugins}/jQuery-Validation-Engine`,
}
```

#### Handler `image`

Used for minifying images (png, jpeg, gif and svg) in production mode:

```js
{
  handler: 'image',
  src: 'src/CoreBundle/Resources/private/img/*',
  dest: config.path.img,
}
```

## Development workflow

You need to install some dependencies first:
```bash
$ yarn
```

### Contribution

- Make a pull request, its title should follows [Angular commit message convention](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#commit-message-format)
- You should **Squash and Merge** your pull request

### Publishing a new release

This is automatically done by Travis and [semantic-release](https://github.com/semantic-release/semantic-release) when you merge a pull request.
