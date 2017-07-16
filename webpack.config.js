const path = require('path')
const webpack = require('webpack')

const resolve = d => path.join(__dirname, d)

module.exports = {
  entry: resolve('client/index'),
  output: {
    path: resolve('dist'),
    filename: 'bundle.js',
    sourcePrefix: ''
  },
  // devtool: 'cheap-module-source-map',
  resolve: {
    modules: ['node_modules'],
    extensions: ['*', '.json', '.jsx', '.js'],
    alias: {
      '-': resolve('client')
    }
  },
  module: {
    loaders: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loaders: [
          'babel-loader'
        ]
      },
      {
        test: /\.scss$/,
        loaders: [
          'style-loader',
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.css$/,
        loaders: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loaders: [
          'file-loader?hash=sha512&digest=hex&name=[hash].[ext]',
          'image-webpack-loader?bypassOnDebug'
        ]
      },
      {
        test: /\.(gltf|glb)$/i,
        loaders: [
          'file-loader?hash=sha512&digest=hex&name=[hash].[ext]'
        ]
      }
    ],
    unknownContextCritical: false,
    unknownContextRegExp: /^.\/.*$/
  },
  plugins: [
  ]
}
