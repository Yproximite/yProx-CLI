# Configuration

Create a `yprox-cli.config.js` file:

```js
module.exports = {
  assets: {
    app: './assets/app.js',
  },
};
```

::: tip
If you prefer, you can configure the tool with your `package.json`:

```json
{
  "yproxCli": {
    "assets": {
      "app": "./assets/app.js"
    }
  }
}
```

But keep in mind that you **can not** use both config from `yprox-cli.config.js` and config from `package.json` at the same time.
:::

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
