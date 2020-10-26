const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

const resolve = (d) => path.join(__dirname, d)

module.exports = {
  mode: 'development',
  devtool: 'eval-source-map',
  entry: './client/index',
  resolve: {
    extensions: ['*', '.json', '.js'],
    alias: {
      '-': resolve('client'),
    },
  },
  devServer: {
    contentBase: resolve('dist'),
    port: 9090,
    host: '0.0.0.0',
    hot: true,
  },
  output: {
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.worker\.js$/,
        loader: 'worker-loader',
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loader: 'file-loader',
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(glsl|md|obj|map)$/i,
        loader: 'raw-loader',
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './client/index.html',
    }),
    new webpack.NamedModulesPlugin(),
  ],
  node: {
    fs: 'empty',
  },
}
