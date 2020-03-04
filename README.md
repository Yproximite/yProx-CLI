# yProx-CLI

![CI](https://github.com/Yproximite/yProx-CLI/workflows/CI/badge.svg)
![Node](https://img.shields.io/node/v/@yproximite/yprox-cli.svg)

> A tool for bulk linting and building assets.

## Another tool?

Yes, but linting and building **a lot** of assets is now easier than ever!

Out of the box, yProx-CLI comes with:

- JavaScript support (+ [Buble](https://github.com/bublejs/buble))
- CSS and Sass support
- Rollup support (JavaScript, Vue, [GraphQL](https://github.com/Kocal/rollup-plugin-graphql)) for modern apps
- ESLint for linting JavaScript files
- Stylelint for linting CSS and Sass support
- Copy/Paste files
- Images optimization

yProx-CLI is really useful for us because it allowed us to package all the tools we need in only big package.

We have ~150 WordPress projects and it was really hard to maintain ~25 dev dependencies (for Gulp) for each project.
Using yProx-CLI saves us some huge amount of time because:

- we were able to externalize all those dependencies in one package
- we were able to externalize the tooling in one package. Before, **everything** was in a Gulp file configuration

## Documentation

Read the [documentation](https://yprox-cli.netlify.com/).

## Development workflow

You need to install dependencies first:

```bash
$ yarn
```

### Tests

Tests are located inside the `test` folder. You can run them with:

```bash
$ yarn test
```

Be sure to always add a test when you are modifying something!

### Linting

We use [ESlint](https://eslint.org/), the [AirBnb preset](https://github.com/progre/tslint-config-airbnb), the [Recommended rules for TypeScript](https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/src/configs/recommended.json), and [Prettier](https://prettier.io/).

You can lint the code with:

```bash
$ yarn lint
$ yarn lint --fix # will automatically fix some errors
```

### Contribution

- Make a pull request on `develop` branch, its title should follows [Angular commit message convention](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#commit-message-format)
- You should **Squash and Merge** your pull request

### Publishing a new release

- Open a PR `develop` to `master`
- Merge your pull request with a **Merge commit**
