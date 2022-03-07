const mongoConfig = process.env.MONGO_CONFIG;

export default {
  host: '',
  port: 50000,
  jwtKey: 'test',
  ignoreTokenPath: [
    '/swagger/swagger.json',
    '/swagger/swagger',
    '/users/login',
    '/users/register',
    '/healthcheck',
  ],
  mongodb: mongoConfig || 'mongodb://127.0.0.1:45201/test?retryWrites=false',
  locale: 'en',
  plugins: ['@foxpage/foxpage-plugin-unpkg'],
  allLocales: ['en-US', 'zh-HK', 'en-HK', 'ko-KR', 'ja-JP'], // Supported locales
};
