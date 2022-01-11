import { Application } from '@foxpage/foxpage-server-types';

import * as Model from '../../models';

import { BaseServiceAbstract } from './base-service-abstract';

export abstract class ApplicationServiceAbstract extends BaseServiceAbstract<Application> {
  constructor() {
    super(Model.application);
  }
}
