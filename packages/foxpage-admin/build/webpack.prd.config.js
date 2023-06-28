const { merge } = require('webpack-merge');
const webpack = require('webpack');
const webpackBaseConfig = require('./webpack.base.config');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = merge(webpackBaseConfig, {
  mode: 'production',
  entry: {
    main: ['babel-polyfill', '../src/Index.tsx'],
  },

  module: {
    rules: [
      {
        test: /\.(jpg|gif|png)$/,
        loader: 'file-loader',
      },
    ],
  },

  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },

  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: '../src/index.html' },
        { from: '../src/environment.html' },
        { from: '../src/images', to: 'images' },
        { from: '../node_modules/monaco-editor/min/vs', to: 'vs' },
      ],
    }),
    new webpack.DefinePlugin({
      __DEV__: false,
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      },
    }),
  ],
});
