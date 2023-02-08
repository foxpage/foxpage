module.exports = {
  env: {
    node: true,
  },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'simple-import-sort', 'import'],
  extends: [
    // "eslint:recommended",
    'prettier',
    // 'plugin:prettier/recommended',
    // "plugin:@typescript-eslint/eslint-recommended",
    // 'plugin:@typescript-eslint/recommended',
  ],
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {
      modules: true,
    },
    project: ['./tsconfig.json', './tsconfig.eslint.json'],
  },
  rules: {
    eqeqeq: [
      'error',
      'always',
      {
        null: 'ignore',
      },
    ],
    semi: ['error', 'always'],
    'no-var': 0,
    'comma-spacing': [2, { before: false, after: true }],
    camelcase: 2,
    'comma-style': [2, 'last'],
    quotes: [1, 'single'],
    'no-unreachable': 2,
    'array-bracket-spacing': [2, 'never'],
    'brace-style': [
      2,
      '1tbs',
      {
        allowSingleLine: true,
      },
    ],
    'no-mixed-spaces-and-tabs': 2,
    'no-ternary': 0,
    'prefer-const': 0,
    'no-multi-spaces': 1,
    'object-curly-spacing': ['error', 'always'],
    'max-len': [0, 100, 2],
    'simple-import-sort/imports': [
      'error',
      {
        groups: [
          // Side effect imports.
          ['^\\u0000'],
          // Node.js builtins. You could also generate this regex if you use a `.js` config.
          // For example: `^(${require("module").builtinModules.join("|")})(/|$)`
          [
            '^(assert|buffer|child_process|cluster|console|constants|crypto|dgram|dns|domain|events|fs|http|https|module|net|os|path|punycode|querystring|readline|repl|stream|string_decoder|sys|timers|tls|tty|url|util|vm|zlib|freelist|v8|process|async_hooks|http2|perf_hooks)(/.*|$)',
          ],
          // Packages. `react` related packages come first.
          ['^react'],
          // Packages.
          // Things that start with a letter (or digit or underscore), or `@` followed by a letter.
          ['^@?(?!foxpage)\\w'],
          // Packages.
          ['^@foxpage/(?!foxpage)'],
          // Packages.
          // foxpage packages
          ['^@foxpage/foxpage'],
          // absolute path
          // src file
          ['^@/'],
          // absolute path
          // test file
          ['^@@/'],
          // Parent imports. Put `..` last.
          ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
          // Other relative imports. Put same-folder imports and `.` last.
          ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
          // Style imports.
          ['^.+\\.(scss|css|less)$'],
        ],
      },
    ],
    'simple-import-sort/exports': 'error',
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/no-duplicates': 'error',
  },
};
