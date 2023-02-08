const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const AntdDayjsWebpackPlugin = require('antd-dayjs-webpack-plugin');
const { mainModule } = require('process');

module.exports = {
  context: path.resolve(__dirname),
  output: {
    publicPath: '/dist/',
    // filename: '[name].bundle.js',
    filename: 'main.bundle.js',
    path: path.resolve(__dirname, '../dist'),
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.css'],
    fallback: {
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      util: require.resolve('util'),
    },
    plugins: [
      // @ts-ignore
      new TsconfigPathsPlugin({
        configFile: path.join(__dirname, './tsconfig.webpack.json'),
      }),
    ],
  },
  plugins: [new AntdDayjsWebpackPlugin()],
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              configFile: path.resolve(__dirname, '../babel.config.js'),
            },
          },
        ],
      },
      {
        test: /\.md$/,
        loader: 'raw-loader',
      },
      {
        test: /\.less$/,
        use: ['style-loader', 'css-loader', 'postcss-loader', 'less-loader'],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader',
        options: {
          limit: '10000',
          mimetype: 'application/font-woff',
        },
      },
      {
        test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader',
        options: {
          limit: '10000',
          mimetype: 'application/font-woff',
        },
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader',
        options: {
          limit: '10000',
          mimetype: 'application/octet-stream',
        },
      },
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader',
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader',
      },
      {
        test: require.resolve('react'),
        loader: 'expose-loader',
        options: {
          exposes: 'React',
        },
      },
      {
        test: require.resolve('react-dom'),
        loader: 'expose-loader',
        options: {
          exposes: 'ReactDOM',
        },
      },
      {
        test: require.resolve('antd'),
        loader: 'expose-loader',
        options: {
          exposes: 'antd',
        },
      },
      {
        test: require.resolve('html-react-parser'),
        loader: 'expose-loader',
        options: {
          exposes: 'HTMLDOMParser',
        },
      },
      {
        test: require.resolve('styled-components'),
        loader: 'expose-loader',
        options: {
          exposes: 'styled',
        },
      },
    ],
  },
};
