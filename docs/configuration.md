# Configuration

Create a `yprox-cli.config.js` file:

```js
module.exports = {
  assets: {
    app: './assets/app.js',
  },
};
```

There is no limitation on `assets` key, you can define assets as much you want.

For now you should create `./assets/app.js` file that will export a function:

```js
// `api` is an instance of `API` class
// `config` is your configuration (`yprox-cli.config.js`)
module.exports = (api, config) => {
  return [ // array of entries
    { ... },
    { ... }
  ]; 
}
```

See [Assets and Entries](./assets.md) for more information.

## Configuring destination paths

To make your assets declaration easier, you can connfigure destination paths. 

There is no limitation about them, you can define whatever your want. Since your configuration is passed to your `assets`, you will be able to use `config.path.js` or `config.path.css` vars.

```js
// yprox-cli.config.js

module.exports = {
  // ...
  
  // Destination path
  path: {
    js: './public/js',
    css: './public/css',
    img: './public/img',
    plugins: './public/plugins',
    foo_bar: './public/foo-bar',
  },
}
```
