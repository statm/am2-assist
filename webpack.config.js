const WebpackUserscript = require('webpack-userscript');

const headers = {
  namespace: 'http://tampermonkey.net',
  contributor: ['henryzhou', 'jiak94'],
  license: 'MIT',
  match: ['http://www.airlines-manager.com/*', 'https://www.airlines-manager.com/*'],
  updateURL: 'https://github.com/statm/am2-assist/raw/master/AM2_Assist.user.js'
}

module.exports = {
  mode: 'production',
  entry: './src/index.ts',
  output: {
    path: __dirname,
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
