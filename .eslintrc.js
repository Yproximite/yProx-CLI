module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
  extends: [
    'airbnb-base',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'prettier/@typescript-eslint',
  ],
  settings: {
    'import/resolver': {
      node: {
        extensions: [
          '.ts',
          '.js',
        ]
      }
    }
  },
  overrides: [
    {
      files: ['test/**/*.ts'],
      env: {
        jest: true
      },
      rules: {
        'no-console': 'off',
        'no-return-assign': 'off',
      }
    }
  ]
};