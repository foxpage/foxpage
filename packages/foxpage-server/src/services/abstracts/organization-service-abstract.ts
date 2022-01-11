import { Organization } from '@foxpage/foxpage-server-types';

import * as Model from '../../models';

import { BaseServiceAbstract } from './base-service-abstract';

export abstract class OrgServiceAbstract extends BaseServiceAbstract<Organization> {
  constructor() {
    super(Model.org);
  }
}
