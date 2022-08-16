const {
  join
} = require('path');
const {
  pathsToModuleNameMapper
} = require('ts-jest/utils');

const tsConfig = require('./tsconfig.json');

module.exports = {
  verbose: true,
  testEnvironment: 'enzyme',
  setupFilesAfterEnv: [require.resolve('jest-enzyme')],
  setupFiles: [require.resolve('./test/setup')],
  transform: {
    '\\.(js|jsx|ts|tsx)?$': 'ts-jest',
  },
  moduleFileExtensions: [
    "tsx",
    'ts',
    "js"
  ],
  globals: {
    "ts-jest": {
      tsConfig: join(__dirname, 'tsconfig.json')
    },
  },
  moduleNameMapper: {
    '^.+\\.(css|less)$': 'identity-obj-proxy',
    ...pathsToModuleNameMapper(tsConfig.compilerOptions.paths, {
      prefix: '<rootDir>/'
    }),
  },
  transformIgnorePatterns: [
    '/dist/',
    '[/\\\\]node_modules[/\\\\].+\\.(js|jsx|ts|tsx)$',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'text-summary', 'json-summary', 'lcov'],
  reporters: [
    'default',
    [
      require.resolve('jest-html-reporter'),
      {
        outputPath: '<rootDir>/coverage/test-result.html',
      },
    ],
  ],
};
