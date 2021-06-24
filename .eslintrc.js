module.exports = {
  env: {
    browser: true,
    commonjs: true
  },
  extends: ['eslint:recommended', 'standard', 'plugin:prettier/recommended', 'prettier'],
  parserOptions: {
    ecmaVersion: 2015
  },
  rules: {
    'no-var': 'off',
    'prettier/prettier': 'error'
  }
}
