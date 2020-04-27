// vue.config.js
const path = require('path');

module.exports = {
  // options...
  devServer: {
    writeToDisk: true,
    contentBase: path.resolve(__dirname, 'dist'),
    publicPath: 'http://localhost:3000',
    hot: true,
    inline: true,
    historyApiFallback: true,
    port: 3000,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  }
}