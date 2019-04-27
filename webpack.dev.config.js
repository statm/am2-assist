const webpackConfig = require('./webpack.config');

module.exports = {
  ...webpackConfig,

  mode: 'development',
  devtool: 'eval-source-map',
  plugins: [],
  devServer: {
    contentBase: ['.', './dev'],
    hot: false,
    inline: false,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
    }
  }
}