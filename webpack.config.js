const path = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

const resolve = d => path.join(__dirname, d)

module.exports = {
  entry: {
    app: ['babel-polyfill', resolve('client/index')]
  },
  mode: 'development',

  devtool: 'inline-source-map',

  output: {
    path: resolve('dist'),
    publicPath: '/dist/',
    filename: '[name].js'
  },

  resolve: {
    modules: ['node_modules'],
    extensions: ['*', '.json', '.jsx', '.js'],
    alias: {
      '-': resolve('client')
    }
  },

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loaders: ['babel-loader']
      },
      {
        test: /\.(scss|css)$/,
        use: ExtractTextPlugin.extract({
          use: [
            {
              loader: 'css-loader',
              options: {
                sourceMap: true
              }
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: true
              }
            }
          ],
          fallback: 'style-loader'
        })
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loaders: [
          'file-loader?hash=sha512&digest=hex&name=[hash].[ext]',
          'image-webpack-loader?bypassOnDebug'
        ]
      },
      {
        test: /\.(glsl|md|obj)$/i,
        loaders: ['raw-loader']
      }
    ],
    unknownContextCritical: false,
    unknownContextRegExp: /^.\/.*$/
  },
  plugins: [
    // new webpack.optimize.CommonsChunkPlugin({
    //   name: 'common',
    //   minChunks: module =>
    //     module.context && module.context.indexOf('node_modules') !== -1
    // }),
    // new webpack.optimize.CommonsChunkPlugin({
    //   name: 'manifest',
    //   minChunks: Infinity
    // }),
    new ExtractTextPlugin('app.css')
  ]
}
