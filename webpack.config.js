const path = require('path');
const WebpackUserscript = require('webpack-userscript');

const headers = {
  name: 'AM2 Assist',
  namespace: 'http://tampermonkey.net',
  contributor: ['henryzhou', 'jiak94'],
  license: 'MIT',
  match: ['http://www.airlines-manager.com/*', 'https://www.airlines-manager.com/*'],
  updateURL: 'https://github.com/statm/am2-assist/releases/download/latest/AM2_Assist.user.js',
};

module.exports = {
  mode: 'production',
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'AM2_Assist.user.js',
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        enforce: 'pre',
        loader: 'eslint-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.ts$/,
        loader: 'ts-loader',
      },
    ],
  },
  plugins: [
    new WebpackUserscript({
      headers,
      metajs: false,
    }),
  ],
};
