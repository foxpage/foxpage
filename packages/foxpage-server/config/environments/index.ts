import debug from './debug';
import development from './development';
import production from './production';
import test from './test';

const config = {
  test: test,
  debug: debug,
  development: development,
  production: production,
};

export default config;
