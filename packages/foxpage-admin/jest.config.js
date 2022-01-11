const {
  join
} = require('path');
const {
  pathsToModuleNameMapper
} = require('ts-jest/utils');

// const paths = require('./tsconfig.path.json');

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
  // TODO 与tsconfig合并
  moduleNameMapper: {
    '^.+\\.(css|less)$': 'identity-obj-proxy',
    ...pathsToModuleNameMapper({
      "@/pages/*": [
        "src/pages/*"
      ],
      "@/configs/*": [
        "src/configs/*"
      ],
      "@/apis/*": [
        "src/apis/*"
      ],
      "@/components/*": [
        "src/pages/components/*"
      ],
      "@/utils/*": [
        "src/utils/*"
      ],
      "@/store/*": [
        "src/store/*"
      ],
      "@/actions/*": [
        "src/store/actions/*"
      ],
      "@/reducers/*": [
        "src/store/reducers/*"
      ],
      "@/sagas/*": [
        "src/store/sagas/*"
      ],
      "@/types/*": [
        "typings/*"
      ],
      "@/services/*": [
        "src/services/*"
      ],
      "@/constants/*": [
        "src/constants/*"
      ],
    }, {
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
