const { join } = require('path');

/** @type {jest.ProjectConfig} */
const config = {
  // not cache in ci
  preset: 'ts-jest',
  cache: !process.env.CI,
  rootDir: __dirname,
  name: 'foxpage-server',
  displayName: 'foxpage server',
  setupFiles: ['<rootDir>/test/jest/setup.ts'],
  testRegex: 'unit/.*\\.(test|spec)\\.(ts|tsx)$',
  testEnvironment: 'node',
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  collectCoverage: false,
  globals: {
    'jest-config': {
      tsConfig: join(__dirname, 'tsconfig.test.json'),
      diagnostics: false,
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@@/(.*)$': '<rootDir>/test/$1',
  },
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'js', 'json'],
  transformIgnorePatterns: [
    '/dist/',
    'node_modules/[^/]+?/(?!(es|node_modules)/)', // Ignore modules without es dir
  ],
  collectCoverageFrom: [
    'src/*.ts',
    'src/**/*.ts',
    '!src/models/**/*.ts',
    '!**/__mocks__/**/*',
    '!src/utils/*',
    '!src/middlewares/*',
    '!src/services/abstracts/*',
    '!src/types/**/*',
  ],
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['clover', 'json', 'lcov', ['json-summary', { skipFull: true }]],
};

module.exports = config;
