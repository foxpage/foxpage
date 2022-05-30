const { merge } = require('webpack-merge');
const webpack = require('webpack');
const webpackBaseConfig = require('./webpack.base.config');

module.exports = merge(webpackBaseConfig, {
  mode: 'development',
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
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      },
    }),
  ],
});
