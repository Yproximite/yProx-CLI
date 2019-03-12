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
  rules: {
    'no-console': 'off',
    'global-require': 'off',
    'import/no-dynamic-require': 'off',
    'import/prefer-default-export': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-var-requires': 'off',
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: [
          '.ts',
          '.d.ts',
          '.js',
        ]
      }
    }
  },
  overrides: [
    {
      files: ['types/*.d.ts'],
      rules: {
        'import/export': 'off'
      }
    },
    {
      files: ['test/**/*.ts'],
      env: {
        jest: true
      },
      rules: {
        'no-new-func': 'off',
        'no-return-assign': 'off',
        'no-template-curly-in-string': 'off',
        '@typescript-eslint/no-var-requires': 'off',
      }
    }
  ]
};
