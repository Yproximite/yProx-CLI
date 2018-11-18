# Assets and entries

Implying you have this configuration:

```js
// yprox-cli.config.js

module.exports = {
  assets: {
    app: './assets/app.js',
  },
  
  path: {
    js: './public/js',
    css: './public/css',
  }
};
```

## Assets

You should create `./assets/app.js` file that will export a function:

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

## Entries

An entry defines:
- what will be build (source files)
- how to build it (handler)
- where output it (destination path)

This is what an entry looks like:
```js
{
  handler: 'sass',
  src: 'src/CoreBundle/Resources/private/sass/grid.scss',
  concat: 'my-grid.css',
  dest: config.path.css,
},
```

