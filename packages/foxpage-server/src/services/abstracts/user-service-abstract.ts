import { User } from '@foxpage/foxpage-server-types';

import * as Model from '../../models';

import { BaseServiceAbstract } from './base-service-abstract';

export abstract class UserServiceAbstract extends BaseServiceAbstract<User> {
  constructor() {
    super(Model.user);
  }
}
