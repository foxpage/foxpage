import * as appConfig from '../../../app.config';

import DefaultMetric from './default-metric';

let defaultMetric = new DefaultMetric();
if (appConfig.config.metric?.name) {
  try {
    defaultMetric = require('./' + appConfig.config.metric.name);
  } catch (err: any) {
    console.log('require metric module failed: ' + err.message);
  }
}

export default defaultMetric;
