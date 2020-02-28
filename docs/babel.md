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

WIP

### Polyfills with core-js

[core-js](https://github.com/zloirock/core-js) is a standard library which includes a lot of polyfills.

You can confgure Babel to use core-js automatically.

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
```
