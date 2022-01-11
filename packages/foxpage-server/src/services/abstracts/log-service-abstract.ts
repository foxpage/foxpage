import { Log } from '@foxpage/foxpage-server-types';

import * as Model from '../../models';

import { BaseServiceAbstract } from './base-service-abstract';

export abstract class LogServiceAbstract extends BaseServiceAbstract<Log> {
  constructor() {
    super(Model.log);
  }
}
