const mongoConfig = process.env.MONGO_CONFIG;

export default {
  host: '',
  port: 50000,
  jwtKey: 'mock', // Generate jwt key text
  ignoreTokenPath: [
    '/swagger/swagger.json',
    '/swagger/swagger',
    '/users/login',
    '/users/register',
    '/healthcheck',
    '/applications/list',
    '/components/live-versions',
    '/components/version-infos',
    '/pages/lives',
    '/templates/lives',
    '/content/tag-versions',
    '/content/tag-contents',
    '/contents',
    '/contents/changes',
    '/functions/lives',
    '/conditions/lives',
    '/variables/lives',
    '/mocks/lives',
    '/pages/live-infos',
    '/pages/draft-infos',
    '/files',
  ], // Skip to verify the interface of the token
  mongodb: mongoConfig || '', // Database connection string
  locale: 'en', // Current language
  plugins: ['@foxpage/foxpage-plugin-unpkg'],
  metric: {
    name: '',
    debug: false,
  },
  allLocales: ['en-US', 'zh-HK', 'en-HK', 'ko-KR', 'ja-JP'], // Supported locales
};
