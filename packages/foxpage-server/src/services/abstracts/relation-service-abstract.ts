import { ContentRelation } from '@foxpage/foxpage-server-types';

import * as Model from '../../models';

import { BaseServiceAbstract } from './base-service-abstract';

export abstract class RelationServiceAbstract extends BaseServiceAbstract<ContentRelation> {
  constructor() {
    super(Model.relation);
  }
}
