const { merge } = require('webpack-merge');
const webpack = require('webpack');
const webpackBaseConfig = require('./webpack.base.config');
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
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      },
    }),
  ],
});
