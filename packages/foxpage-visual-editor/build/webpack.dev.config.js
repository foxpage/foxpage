const { merge } = require('webpack-merge');
const path = require('path');
const webpack = require('webpack');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const webpackBaseConfig = require('./webpack.base.config');

const PORT = 3003;

module.exports = merge(webpackBaseConfig, {
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
      __DEV__: true,
    }),
    // new BundleAnalyzerPlugin(),
  ],
});
