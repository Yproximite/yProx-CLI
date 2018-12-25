# UPGRADE FROM 1.X AND 2.X TO 3.0

## No more webpack 

Yprox-CLI should stay light and simple, so I decided to remove the `webpack` handler in favour of the `rollup` handler.

You have 4 solutions :

- Use the [`rollup` handler](https://yprox-cli.netlify.com/handlers.html#rollup)
- Use [Webpack Encore](https://github.com/symfony/webpack-encore) if you are building a Symfony application
- Use [vue-cli](https://github.com/vuejs/vue-cli) if you are building a Single Page Application
- Use webpack and webpack-cli
