const { merge } = require('webpack-merge');
const webpack = require('webpack');
const webpackBaseConfig = require('./webpack.base.config');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = merge(webpackBaseConfig, {
  mode: 'production',
  entry: {
    main: ['babel-polyfill', '../src/index.tsx'],
  },

  module: {
    rules: [
      {
        test: /\.(jpg|gif|png)$/,
        loader: 'file-loader',
      },
    ],
  },

  plugins: [
    new UglifyJsPlugin({
      uglifyOptions: {
        warnings: false,
        output: {
          comments: false,
        },
      },
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: '../src/index.html' },
        { from: '../src/environment.html' },
        { from: '../src/images', to: 'images' },
      ]
    }),
    new webpack.DefinePlugin({
      __DEV__: false,
    }),
  ],
});
