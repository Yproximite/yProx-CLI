# Getting Started

## Requirements

- Node.js 10+
- npm or Yarn

## Installation

In your `.npmrc`, add the following configuration:

```
@yproximite:registry=https://npm.pkg.github.com
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
$ yarn add --dev 'stylelint@>=9.0.0'
```

### Vue support

You will need to install `vue-template-compiler` (which should match your Vue version) to build `.vue` files:

```bash
$ yarn add --dev 'vue-template-compiler@>=2.0.0'
```
