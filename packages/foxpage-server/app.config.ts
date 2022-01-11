import fs from 'fs';

import configProfile from './config/environments';

enum EnvType {
  Debug = 'debug',
  Dev = 'development',
  Prod = 'production',
  Test = 'test',
}

let env: EnvType = EnvType.Dev;
if (process.env.NODE_ENV) {
  env = process.env.NODE_ENV as EnvType;
}

const config: { [key: string]: any } = configProfile[env as EnvType] || configProfile['development'];
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
