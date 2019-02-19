# UPGRADE FROM 1.X TO 2.0

## ESLint and Stylelint are now peer dependencies

In version 1.x, ESLint and Stylelint were directly packaged with yProx-CLI
as dependency.

This is not a good practice, because someone that use yProx-CLI would like to use
a different version.

You should install them manually:

```bash
$ yarn add -D 'eslint@>=5.0.0' 'stylelint@>=9.0.0'

# or with npm
$ npm install --save-dev 'eslint@>=5.0.0' 'stylelint@>=9.0.0'
```

### Note in 3.X

ESLint and Stylelint are now totally optional.
