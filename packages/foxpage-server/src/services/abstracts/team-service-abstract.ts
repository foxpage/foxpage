import { Team } from '@foxpage/foxpage-server-types';

import * as Model from '../../models';

import { BaseServiceAbstract } from './base-service-abstract';

export abstract class TeamServiceAbstract extends BaseServiceAbstract<Team> {
  constructor() {
    super(Model.team);
  }
}
