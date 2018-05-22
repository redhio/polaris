const {createTransformer} = require('babel-jest');

const babelOptions = {
  presets: [
    ['redhio/node', {modules: 'commonjs'}],
    'redhio/react',
  ],
};

module.exports = createTransformer(babelOptions);
