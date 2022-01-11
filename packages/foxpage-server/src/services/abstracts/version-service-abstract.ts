import { ContentVersion } from '@foxpage/foxpage-server-types';

import * as Model from '../../models';

import { BaseServiceAbstract } from './base-service-abstract';

export abstract class VersionServiceAbstract extends BaseServiceAbstract<ContentVersion> {
  constructor() {
    super(Model.version);
  }
}
