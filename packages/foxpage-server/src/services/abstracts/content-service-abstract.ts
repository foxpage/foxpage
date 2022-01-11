import { Content } from '@foxpage/foxpage-server-types';

import * as Model from '../../models';

import { BaseServiceAbstract } from './base-service-abstract';

export abstract class ContentServiceAbstract extends BaseServiceAbstract<Content> {
  constructor() {
    super(Model.content);
  }
}
