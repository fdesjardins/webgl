const path = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require("extract-text-webpack-plugin")

const resolve = d => path.join(__dirname, d)

const extractSass = new ExtractTextPlugin({
    filename: "[name].css",
    // disable: process.env.NODE_ENV === "development"
})

module.exports = {
  entry: {
    app: resolve('client/index')
  },
  output: {
    path: resolve('dist'),
    publicPath: '/dist/',
    filename: '[name].js',

    // chunkFilename: '[id].js',
    sourcePrefix: ''
  },
  devtool: 'cheap-module-source-map',
  resolve: {
    modules: ['node_modules'],
    extensions: ['*', '.json', '.jsx', '.js'],
    alias: {
      '-': resolve('client'),
      '-Example': resolve('client/components/Example/Example')
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
        use: extractSass.extract({
          use: [{
            loader: "css-loader", options: { sourceMap: true },
          }, {
            loader: "sass-loader", options: { sourceMap: true }
          }],
          fallback: 'style-loader'
        })
      },
      // {
      //   test: /\.css$/,
      //   use: extractCSS.extract([ 'css-loader' ])
      // },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loaders: [
          'file-loader?hash=sha512&digest=hex&name=[hash].[ext]',
          'image-webpack-loader?bypassOnDebug'
        ]
      },
      {
        test: /\.(glsl|md)$/i,
        loaders: [
          'raw-loader'
        ]
      }
    ],
    unknownContextCritical: false,
    unknownContextRegExp: /^.\/.*$/
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: 'common',
      minChunks: module => {
        return module.context && module.context.indexOf('node_modules') !== -1
      }
    }),
    extractSass

    // new ExtractTextPlugin('[name].css')
    // new webpack.LoaderOptionsPlugin({
    //   minimize: true,
    //   debug: false
    // }),
    // new webpack.optimize.UglifyJsPlugin({
    //   compress: {
    //     warnings: false
    //   },
    //   output: {
    //     comments: false
    //   },
    //   sourceMap: false
    // }),
    // new webpack.DefinePlugin({
    //   'process.env': {
    //     ENV: JSON.stringify('production'),
    //     NODE_ENV: JSON.stringify('production')
    //   }
    // })
  ]
}
