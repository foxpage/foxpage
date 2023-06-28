import * as appConfig from '../../../app.config';

import DefaultCache from './default-cache';

let exportCache = new DefaultCache();
if (appConfig.config.cache?.name) {
  const cacheInstance = require('./' + appConfig.config.cache.name).default;
  exportCache = new cacheInstance();
}

export default exportCache;
