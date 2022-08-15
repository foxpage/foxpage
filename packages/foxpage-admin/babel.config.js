module.exports = (api) => {
  const isProduction = process.env.NODE_ENV === 'production';

  api.assertVersion('^7.0');
  api.cache.using(() => !isProduction);

  const presetEnvConfig = {
    targets: {
      browsers: ['last 2 versions', 'ie >= 11'],
    },
    useBuiltIns: 'entry',
    corejs: 2,
    modules: isProduction ? false : 'commonjs',
  };

  return {
    presets: [
      require('@babel/preset-env').default(api, presetEnvConfig),
      require('@babel/preset-react'),
      require('@babel/preset-typescript'),
    ].filter(Boolean),
    plugins: [
      [require('babel-plugin-import'), { libraryName: 'antd', libraryDirectory: 'es', style: 'css' }],
      [require('@babel/plugin-proposal-class-properties')],
      require('@babel/plugin-proposal-export-default-from'),
      require('@babel/plugin-proposal-export-namespace-from'),
      require('@babel/plugin-proposal-json-strings'),
      require('@babel/plugin-proposal-numeric-separator'),
      require('@babel/plugin-proposal-throw-expressions'),
      require('@babel/plugin-syntax-dynamic-import'),
      require('@babel/plugin-transform-arrow-functions'),
      require('@babel/plugin-transform-modules-commonjs'),
      require('@babel/plugin-proposal-object-rest-spread'),
    ].filter(Boolean),
  };
};
