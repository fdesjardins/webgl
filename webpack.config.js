const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const resolve = d => path.join(__dirname, d)

module.exports = {
  entry: {
    app: [ 'babel-polyfill', resolve('client/index') ]
  },

  output: {
    path: resolve('dist'),
    filename: '[name].[hash].js',
    publicPath: '/'
  },

  resolve: {
    modules: [ 'node_modules' ],
    extensions: [ '*', '.json', '.jsx', '.js' ],
    alias: {
      '-': resolve('client'),
      'react-dom': '@hot-loader/react-dom'
    }
  },

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loaders: [ 'babel-loader' ]
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loaders: [ 'file-loader' ]
      },
      {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ]
      },
      {
        test: /\.(glsl|md|obj|map)$/i,
        loaders: [ 'raw-loader' ]
      }
    ],
    unknownContextCritical: false,
    unknownContextRegExp: /^.\/.*$/
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: resolve('client/index.html')
    }),
    new webpack.NamedModulesPlugin()
  ],

  devServer: {
    historyApiFallback: true,
    compress: true,
    port: 9090,
    host: '0.0.0.0'
  }
}
