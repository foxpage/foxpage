import * as appConfig from '../../../app.config';

import DefaultPic from './default-picture';

let exportPicture = new DefaultPic();
if (appConfig.config.picture?.name) {
  const picInstance = require('./' + appConfig.config.picture.name).default;
  exportPicture = new picInstance();
}

export default exportPicture;
