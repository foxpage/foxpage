import { File } from '@foxpage/foxpage-server-types';

import * as Model from '../../models';

import { BaseServiceAbstract } from './base-service-abstract';

export abstract class FileServiceAbstract extends BaseServiceAbstract<File> {
  constructor() {
    super(Model.file);
  }
}
