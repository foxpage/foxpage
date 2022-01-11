import { Folder } from '@foxpage/foxpage-server-types';

import * as Model from '../../models';

import { BaseServiceAbstract } from './base-service-abstract';

export abstract class FolderServiceAbstract extends BaseServiceAbstract<Folder> {
  constructor() {
    super(Model.folder);
  }
}
