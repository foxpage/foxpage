import * as appConfig from '../../../app.config';

let exportLogin: any = {};
if (appConfig.config.login) {
  const loginInstance = require('./' + appConfig.config.login).default;
  exportLogin = new loginInstance();
}

export default exportLogin;
