import mongoose from 'mongoose';
import { logExecutionTime } from 'mongoose-execution-time';

import metric from '../../third-parties/metric';

mongoose.plugin(logExecutionTime, {
  loggerFunction: (
    operation: any,
    collectionName: any,
    executionTimeMS: any,
    filter: any,
    update: any,
    additionalLogProperties: any,
  ) => {
    metric.mongo(
      JSON.stringify({ operation, collectionName, filter, update, additionalLogProperties }),
      0,
      executionTimeMS,
    );
  },
});
