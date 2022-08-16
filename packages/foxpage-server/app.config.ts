import fs from 'fs';

import configProfile from './config/environments';

type ConfigProfile = 'test' | 'debug' | 'development' | 'production';
const envList: Record<string, string> = {
  test: 'test',
  debug: 'debug',
  development: 'development',
  production: 'production',
};

let env = envList.dev;
if (process.env.NODE_ENV) {
  env = process.env.NODE_ENV;
}

const config: { [key: string]: any } = configProfile[(envList[env] || envList.development) as ConfigProfile];

let port: number = config.port || 50000;
if (process.env.PORT) {
  port = Number(process.env.PORT);
}

config.env = env;
config.port = port;

// Load multilingual files
const langBuffer = fs.readFileSync('./config/lang/' + config.locale + '.json');
const lang = JSON.parse(langBuffer.toString());

export { config, lang as i18n };
