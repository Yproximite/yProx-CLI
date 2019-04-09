# Environment variables and modes

Environment variables is a clean way to store your application's configuration in the environment, separated of your code.

You can specify environment variables by placing the following files in your project root:

```
.env.[mode].local # only loaded in specified mode, should be ignored by git
.env.[mode]       # only loaded in specified mode
.env.local        # loaded if exists, should be ignored by git
.env              # loaded if exists
```

An environment file contains `KEY=value` pairs of environment variables:

```dotenv
APP_NAME=my app
APP_API_URL=https://api.example.com
APP_API_KEY=my-api-key
```

Loaded variables will become available to all yProx-cli commands and dependencies.

::: tip Env Loading Priorities
An env file for a specific mode (e.g. `.env.production`) will take higher priority than a generic one (e.g. `.env`).

In addition, environment variables that already exist when yProx-cli is bootstrapped have the highest priority and will not be overwritten by `.env` files.
:::

## Modes

Note that a mode is different from `NODE_ENV`, as a mode can contain multiple environment variables. That said, each mode does set `NODE_ENV` to the same value by default - for example, `NODE_ENV` will be set to `"development"` in development mode.

You can set environment variables only available to a certain mode by `postfixing` the .env file. For example, if you create a file named `.env.development` in your project root, then the variables declared in that file will only be loaded in development mode.

You can overwrite the default mode used for a command by passing the `--mode` option flag. For example, if you want to use production variables in the build command, add this to your `package.json` scripts:

```json
"build": "yprox-cli build --mode production"
```

## Examples

Given the following files:

```dotenv
# .env
APP_NAME=My app
APP_API_KEY=api-key
```

```dotenv
# .env.production
APP_ENV=production
APP_API_URL=https://api.example.com
```

```dotenv
# .env.staging
NODE_ENV=production
APP_ENV=staging
APP_NAME=My app (staging)
APP_API_URL=https://staging.example.com
```

```dotenv
# .env.development
APP_ENV=development
APP_NAME=My app (development)
APP_API_URL=http://api.my-project.vm
```

### Development mode

`yprox-cli build`, `yprox-cli build --mode dev` and `yprox-cli build --mode development` will compute the following env vars:

```dotenv
# .env.development
APP_ENV=development
APP_NAME=My app (development)
APP_API_URL=http://api.my-project.vm

# .env
APP_API_KEY=api-key

# automatically added
NODE_ENV=development
```

### Production mode

`yprox-cli build --mode prod` and `yprox-cli build --mode production` will compute the following env vars:

```dotenv
# .env.production
APP_ENV=production
APP_API_URL=https://api.example.com

# .env
APP_NAME=My app
APP_API_KEY=api-key

# automatically added
NODE_ENV=production
```

### Staging mode

`yprox-cli build --mode staging` will compute the following env vars:

```dotenv
# .env.staging
NODE_ENV=production # not overriden because defined manually
APP_ENV=staging
APP_NAME=My app (staging)
APP_API_URL=https://staging.example.com

# .env
APP_API_KEY=api-key
```

## Special cases

When mode is `production` or `prod`, it will load:

- `.env.production.local` if exists
- `.env.production` if exists
- `.env.prod.local` if exists
- `.env.prod` if exists
- `.env.local` if exists
- `.env` if exists

When mode is `development` or `dev`, it will load:

- `.env.development.local` if exists
- `.env.development` if exists
- `.env.dev.local` if exists
- `.env.dev` if exists
- `.env.local` if exists
- `.env` if exists

## Using environment variables in your code


Only variables that start with `APP_` will be statically embedded into your code. You can access them in your application code:

```js
console.log(process.env.APP_NAME)
```

During build in production mode, `process.env.name` will be replaced by `"My app"`.

In addition to `APP_*` variables, there are also one special variable that will always be available in your app code:

- `NODE_ENV`:  this will be one of `"development"` or `"production"`, depending on the [mode](#modes) the app is running in.

## Handle `.env` files in git

```ignore
!.env*
.env*.local
```

Files like `.env`, `.env.dev` or `.env.prod` should be commited. Those files should always be the same between your team members.

Files like `.env.local`, `.env.dev.local` or `.env.prod.local` should **never** be commited. Those files only exists **for you**, they are great if you want to modify a `.env` file without impacting your team members.
