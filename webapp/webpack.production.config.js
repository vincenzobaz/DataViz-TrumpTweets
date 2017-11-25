var webpack = require('webpack');
var path = require('path');
var uglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
var CopyWebpackPlugin = require('copy-webpack-plugin');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

const server_url = 'https://vincenzobaz.github.io/DataViz-TrumpTweets/data.json';

module.exports = {
  entry: [
    path.resolve(__dirname, 'app/main.js'),
  ],
  output: {
    path: __dirname + '/build',
    publicPath: '/',
    filename: './bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [{ loader: "style-loader" }, { loader: "css-loader" }, { loader: "sass-loader", options: { includePaths: ["app/style"] } }]
      },
      {
        test: /\.css$/,
        use: "css-loader"
      },
      {
        test: /\.js$/,
        loader: "babel-loader"
      }

    ],
  },
  resolve: {
    extensions: ['.js'],
  },
  plugins: [
    new uglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    new webpack.DefinePlugin({
      'dataUrl':  JSON.stringify(server_url),
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),
    new ExtractTextPlugin('main.css'),
    new CopyWebpackPlugin([
      { from: './app/index.html', to: 'index.html' },
      { from: './app/main.scss', to: 'main.css' }
    ]),
  ]
};
