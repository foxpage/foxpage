import { Authorize } from '@foxpage/foxpage-server-types';

import { Creator } from './index-types';

export type AuthInfo = Exclude<Authorize, 'targetId'> & { target: Creator };
