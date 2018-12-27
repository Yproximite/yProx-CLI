# UPGRADE FROM 1.X AND 2.X TO 3.0

## No more webpack 

Yprox-CLI should stay light and simple, so I decided to remove the `webpack` handler in favour of the `rollup` handler.

You have 4 solutions :

- Use the [`rollup` handler](https://yprox-cli.netlify.com/handlers.html#rollup)
- Use [Webpack Encore](https://github.com/symfony/webpack-encore) if you are building a Symfony application
- Use [vue-cli](https://github.com/vuejs/vue-cli) if you are building a Single Page Application
- Use webpack and webpack-cli

## GraphQL usage inside Rollup (#147)

`.graphql` files are now imported as ES5 modules. You can now use [`apollo-client`](https://github.com/apollographql/apollo-client).

If you don't want to, you can still send plain-text GraphQL query like that:

```js
// apiInterface.js

// Change this:
formData.append('query', query);

// To this:
import { print as printQuery } from 'graphql/language/printer'

formData.append('query', printQuery(query));
```
