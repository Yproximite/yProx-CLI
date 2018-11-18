# Configuration

Create a `yprox-cli.config.js` file:

```js
module.exports = {
  assets: {
    app: './assets/app.js',
  },
};
```

Read more at [Assets and Entries](./assets.md).

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
