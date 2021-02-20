module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: [
    'prettier',
    'prettier/@typescript-eslint',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 6,
    project: './tsconfig.json',
    sourceType: 'module',

    ecmaFeatures: {
      modules: true,
    },
  },
  plugins: ['import', '@typescript-eslint', 'prettier'],
  root: true,
  rules: {
    '@typescript-eslint/adjacent-overload-signatures': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-misused-new': 'error',
    '@typescript-eslint/prefer-for-of': 'error',
    '@typescript-eslint/unified-signatures': 'error',
    eqeqeq: ['error', 'smart'],
    'no-caller': 'error',
    'no-invalid-this': 'warn',
    'no-new-wrappers': 'error',
    'no-shadow': [
      'error',
      {
        hoist: 'all',
      },
    ],
    'no-throw-literal': 'error',
    'no-unused-labels': 'error',
    'no-var': 'error',
    'import/default': 0,
    'import/namespace': 0,
    'import/named': 0,
    'import/order': 'warn',
    'import/no-duplicates': 'error',
    'prettier/prettier': 'error',
  },
  settings: {
    'import/resolver': {
      typescript: {},
    },
  },
};
