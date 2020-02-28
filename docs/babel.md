# Babel

[Babel](https://babeljs.io/) is enabled by default. It allows you write modern JavaScript code without being worried of browsers compatibility.

## Installation

```bash
$ yarn add --dev @babel/core @babel/preset-env
```

## Configuration

Create a `babel.config.js` in your project:

```js
module.exports = {
  presets: [
    ['@babel/preset-env', {  
      modules: false 
    }]
  ],
};
```

[`@babel/present-env`](https://babeljs.io/docs/en/babel-preset-env) requires [a list of browsers](https://github.com/browserslist/browserslist) to be configured.
To do that, update your `package.json` and add a `browserlist` key:

```json
{
  "name": "your-app",
  "browserslist": [
    "last 2 versions",
    "not dead",
    "> 0.2%"
  ]
}
```

### Runtime helpers

[`@babel/plugin-transform-runtime`](https://babeljs.io/docs/en/babel-plugin-transform-runtime) is as Babel plugin that enables the re-use of Babel's injected helper to save on codesize. This results as smaller transpiled files.

You have to install some dependencies:

```bash
$ yarn add @babel/runtime
$ yarn add --dev @babel/plugin-transform-runtime
```

And change your `babel.config.js`:

```js
module.exports = {
  presets: [
    ['@babel/preset-env', {
      modules: false
    }]
  ],
  plugins: ['@babel/plugin-transform-runtime'],
};
```

If you use [the Rollup handler](./handlers.md#rollup), you will have to configure [`rollup-plugin-babel`](https://github.com/rollup/rollup-plugin-babel) and configure [`runtimeHelpers` option](https://github.com/rollup/rollup-plugin-babel#helpers):

```js
// yprox-cli.config.js
module.exports = {
  // ...
  handlers: {
    rollup: {
      babel: {
        exclude: 'node_modules/**', // default config from yProx-CLI, ensure node_modules are not transpiled by Babel
        runtimeHelpers: true,
      },
    },
  },
}
```

### Polyfills with core-js

[core-js](https://github.com/zloirock/core-js) is a standard library which includes a lot of polyfills.

You can confgure Babel to use core-js automatically when needed.

```bash
$ yarn add core-js@3
```

Update your `babel.config.js`:

```js
module.exports = {
  presets: [
    ['@babel/preset-env', {
      modules: false,
      useBuiltIns: "usage",
      corejs: 3,
    }],
  ],
};
``
