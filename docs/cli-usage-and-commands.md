# CLI usage & Commands

```bash
$ yarn yprox-cli <command> [arguments]
```

## Common arguments

- `-v` enable verbosity
- `--help` display help
- `--mode` to specify a [mode](./env-vars-and-modes.md#modes)

### Assets and Entries filtering

- `--filter:X Y` will filter entries where `X === Y`
- `--filter:X Y --filter:X Z` will filter entries where `[Y, Z].includes(X)`

For example if you define the following asset:
```js
// assets/app.js

{
  handler: 'css',
  src: 'src/CoreBundle/Resources/private/css/legacy.css',
  concat: 'legacy.css',
  dest: './public/css',
},
{
  handler: 'sass',
  src: 'src/CoreBundle/Resources/private/sass/grid.scss',
  concat: 'grid.css',
  dest: './public/css',
},
{
  handler: 'rollup',
  name: 'yprox-store-locator',
  src: 'src/StoreLocatorBundle/Resources/private/js/yprox-store-locator/index.js',
  concat: 'yprox-store-locator.min.js',
  dest: './public/js',
}
```

Then `X` can be one of these:
 - `handler`
 - `name`
 - `src`
 - `concat`
 - `dest`
 
If you run `yarn yprox-cli build --filter:handler css`, then entries will be filtered by [`CSS` handler](./handlers.md#plain-css-files).

If you run `yarn yprox-cli build --filter:handler css --filter:handler sass`, then entries will be filtered by [`CSS` handler](./handlers.md#plain-css-files) **or** by [`Sass` handler](./handlers.md#sass-and-scss).

::: tip
If you need to filter a entries by their asset's name, you can use `_name` filter, e.g.: `yarn yprox-cli build --filter:_name app`.
:::

## Commands

### Build

```bash
$ yarn yprox-cli build [arguments]
```

```bash
# Watch and build
$ yarn yprox-cli build --watch

# Lint before build, build is stopped if lint fails
$ yarn yprox-cli build --lint
```

### Lint

Lint JavaScript and Sass code.

```bash
$ yarn yprox-cli lint [arguments]
```

```bash
# Lint and display errors if any
$ yarn yprox-cli lint

# Lint and automatically fix lint errors if possible
$ yarn yprox-cli lint --fix
```
