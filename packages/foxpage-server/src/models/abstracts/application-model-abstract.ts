import { Application } from '@foxpage/foxpage-server-types';

import { SearchModel } from '../../types/index-types';

import { BaseModelAbstract } from './base-model-abstract';

export abstract class ApplicationModelAbstract extends BaseModelAbstract<Application> {
  abstract getList(params: SearchModel): Promise<Application[]>;
  abstract getTotal(params: SearchModel): Promise<number>;
}
