const path = require('path');
const WebpackUserscript = require('webpack-userscript');

const headers = {
  namespace: 'http://tampermonkey.net',
  contributor: ['henryzhou', 'jiak94'],
  license: 'MIT',
  match: ['http://www.airlines-manager.com/*', 'https://www.airlines-manager.com/*'],
  grant: 'GM_setClipboard',
  updateURL: 'https://github.com/statm/am2-assist/raw/master/AM2_Assist.user.js'
}

module.exports = {
  mode: 'development',
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'lib'),
    filename: 'AM2_Assist.user.js'
  },
  resolve: {
    extensions: [".ts", ".js"]
  },
  module: {
    rules: [
      { test: /\.ts$/, loader: "ts-loader" }
    ]
  },
  plugins: [
    new WebpackUserscript({
      headers,
      metajs: false
    })
  ]
};
