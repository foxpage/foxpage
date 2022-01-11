import { User } from '@foxpage/foxpage-server-types';

import { NewUser } from '../../types/user-types';

export abstract class UserModelAbstract {
  abstract addUser(params: NewUser): Promise<{}>;
  abstract getUserByAccount(account: string): Promise<Partial<User>>;
}
