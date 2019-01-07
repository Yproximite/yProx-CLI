yProx-cli
=========

[![npm (scoped)](https://img.shields.io/npm/v/@yproximite/yprox-cli.svg)](https://www.npmjs.com/package/@yproximite/yprox-cli)
[![Build Status](https://travis-ci.com/Yproximite/yProx-cli.svg?token=pNBs2oaRpfxdyhqWf28h&branch=master)](https://travis-ci.com/Yproximite/yProx-cli)

> A tool for linting and building assets from [yProx CMS](https://github.com/Yproximite/yProx).
> See [this PR](https://github.com/Yproximite/yProx/pull/4654) for additional details.

## Documentation

Read the [documentation](https://yprox-cli.netlify.com/).

## Development workflow

You need to install dependencies first:
```bash
$ yarn
```

### Tests and specs

Tests and specs are located inside the `test` folder. You can run them with:
```bash
$ yarn test
```

Be sure to always add a test when you are modifying something!

### Linting

We use [TSLint](https://palantir.github.io/tslint) and the [AirBnb preset](https://github.com/progre/tslint-config-airbnb) (with some tweaked rules). 

You can lint the code with:

```bash
$ yarn lint
$ yarn lint --fix # will automatically fix some errors
```

### Contribution

- Make a pull request, its title should follows [Angular commit message convention](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#commit-message-format)
- You should **Squash and Merge** your pull request

### Publishing a new release

This is automatically done by Travis and [semantic-release](https://github.com/semantic-release/semantic-release) when you merge a pull request.
