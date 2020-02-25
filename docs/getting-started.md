# Getting Started

## Requirements

- Node.js 10+
- npm or Yarn

## Installation

This package is hosted on [GitHub Packages](https://github.com/features/packages), so you must tell to npm/yarn where to download it.
Please read [Authenticating to GitHub Packages](https://help.github.com/en/packages/using-github-packages-with-your-projects-ecosystem/configuring-npm-for-use-with-github-packages#authenticating-to-github-packages).

You can run `npm login --registry=https://npm.pkg.github.com --scope=@yproximite` **or** create a `.npmrc` file with the following content:
```
@yproximite:registry=https://npm.pkg.github.com/
//npm.pkg.github.com/:_authToken=<access token>
```

Then run: 

```bash
$ yarn add --dev @yproximite/yprox-cli
```

### Linting JavaScript

If you plan to use yProx-CLI to lint your JavaScript, you need to install ESLint too:

```bash
$ yarn add --dev 'eslint@>=5.0.0'
```

### Linting CSS and Sass

If you plan to use yProx-CLI to lint your CSS and Sass, you need to install Stylelint too:

```bash
$ yarn add --dev 'stylelint@^13.0.0'
```

### Vue support

You will need to install `vue-template-compiler` (which should match your Vue version) to build `.vue` files:

```bash
$ yarn add --dev 'vue-template-compiler@>=2.0.0'
```
