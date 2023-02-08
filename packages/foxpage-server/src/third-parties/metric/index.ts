import * as appConfig from '../../../app.config';

import Metric from './metric';

let defaultMetric = new Metric();
if (appConfig.config.metric?.name) {
  try {
    defaultMetric = require('./' + appConfig.config.metric.name);
  } catch (err: any) {
    console.log('require metric module failed: ' + err.message);
  }
}

export default defaultMetric;
