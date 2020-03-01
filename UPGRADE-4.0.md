# UPGRADE FROM 3.X TO 4.0

## Drop Node.js 8 support ([#627](https://github.com/Yproximite/yProx-CLI/pull/627))

Node.js 8 is not supported anymore.
Ensure your project use Node.js 10 or more.

## Remove Buble for Babel ([#633](https://github.com/Yproximite/yProx-CLI/pull/633)) 

[Buble](https://github.com/bublejs/buble) has been removed in favor of [Babel](https://babeljs.io/), because Buble was too far behind in term of functionnality (plugins) and is now only maintened for [bug fixes](https://github.com/bublejs/buble#maintenance-status).
 
See [yProx-CLI's Babel documentation](https://yprox-cli.netlify.com/babel.html) for more information.

## Don't read configuration from `package.json` anymore

In previous version, it was possible to configure yProx-CLI directly from your `package.json` under `yproxCli` key.
That's because the configuration could be a simple JS/JSON object/array.

But now, we want to create an API to configure yProx-CLI in a better way, in JavaScript.
No more JavaScript nested plain-objects, but an API with methods, typings and documentation.

```js
// yprox-cli.config.js
const { YproxCLI } = require('@yproximite/yprox-cli');

YproxCLI.init({
  sourcePath: './src',
  outputPath: './dist',
});

module.exports = configuration;
```
