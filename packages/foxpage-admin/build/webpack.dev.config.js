const webpack = require('webpack');
const { merge } = require('webpack-merge');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const path = require('path');
const webpackBaseConfig = require('./webpack.base.config');
const configProfile = require('../env.config');

const PORT = 3002;

module.exports = merge(webpackBaseConfig, {
  output: {
    publicPath: '/dist/',
    filename: 'main.bundle.js',
    chunkFilename: '[name].[contenthash:8].js',
    path: path.resolve(__dirname, './dist'),
  },
  cache: true,
  devtool: 'inline-source-map',
  mode: 'development',
  entry: {
    main: [
      '@babel/polyfill',
      'react-hot-loader/patch',
      `webpack-dev-server/client?http://0.0.0.0:${PORT}`,
      'webpack/hot/only-dev-server',
      path.join(__dirname, '../src/Index.tsx'),
    ],
  },

  devServer: {
    contentBase: './src', // Relative directory for base of server
    hot: true, // Live-reload
    inline: true,
    port: PORT, // Port Number
    host: 'localhost', // Change to '0.0.0.0' for external facing server
    disableHostCheck: true,
  },

  module: {
    rules: [
      {
        test: /\.(jpg|gif|png|jpeg)$/,
        loader: 'file-loader',
      },
    ],
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      APP_CONFIG: JSON.stringify(configProfile.dev),
      __DEV__: true,
      __PORT__: PORT,
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      },
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: '../src/index.html' },
        { from: '../src/environment.html' },
        { from: '../src/images', to: 'images' },
        { from: '../../../node_modules/monaco-editor/min/vs', to: 'vs' },
      ],
    }),
  ],
});
