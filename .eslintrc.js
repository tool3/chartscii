module.exports = {
  env: {
    es6: true,
    node: true,
    mocha: true
  },
  extends: 'eslint:recommended',
  
  rules: {
    quotes: 0,
    'no-console': 0,
    'object-curly-spacing': ['warn', 'always'],
    'no-constant-condition': 0
  },

  parserOptions: {
    ecmaVersion: 2018
  }
};
