yProx-cli
=========

[![npm (scoped)](https://img.shields.io/npm/v/@yproximite/yprox-cli.svg)](https://www.npmjs.com/package/@yproximite/yprox-cli)
[![Build Status](https://travis-ci.com/Yproximite/yProx-cli.svg?token=pNBs2oaRpfxdyhqWf28h&branch=master)](https://travis-ci.com/Yproximite/yProx-cli)

> A tool for linting and building assets from [yProx CMS](https://github.com/Yproximite/yProx).
> See [this PR](https://github.com/Yproximite/yProx/pull/4654) for additional details.


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
