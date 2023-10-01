const prettierSolidity = require('prettier-plugin-solidity');

module.exports = {
  plugins: [prettierSolidity],
  semi: true,
  singleQuote: true,
  trailingComma: 'es5',
};
